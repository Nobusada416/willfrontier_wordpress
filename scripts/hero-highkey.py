#!/usr/bin/env python3
"""トップヒーロー用に写真を明るく柔らかいトーン（ハイキー）へ加工する。

ヒーローの 9 枚を同じ明るさ・コントラストに揃えた `<slug>-hero.webp` を別ファイルとして書き出す。
元の webp は他ページでも使っているので上書きしない。

使い方（Pillow が必要。-I はユーザー site-packages を読まないため、Pillow は venv か system に入れる）:
  python3 -I scripts/hero-highkey.py                      # 元写真と同じディレクトリに出力
  python3 -I scripts/hero-highkey.py --stats-only         # 元写真の輝度だけ表示
元写真の場所は旧テーマ（assets/photos）と React 版（web/public/media/photos）のどちらかを自動で選ぶ。
React 版では出力後に npm run media:manifest -w web で寸法一覧を作り直す。
"""

import argparse
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
# 旧テーマ（main）と React 版（web/public/media）で写真の置き場所が違うため、存在する方を使う
PHOTO_DIR_CANDIDATES = [ROOT / 'assets' / 'photos', ROOT / 'web' / 'public' / 'media' / 'photos']

# ヒーローで加工する 9 枚（front-page.php / web/app/content/home.ts の HERO_TILES と合わせる）
HERO_SLUGS = [
    'wf-112',
    'wf-114',
    'wf-079',
    'wf-095',
    'wf-086',
    'wf-092',
    'wf-104',
    'wf-105',
    'wf-102',
]

# 既定のトーン（以前左上にあった生成AI画像の実測 mean=179 / p5=58 / p95=252 を目安に決めた）
DEFAULT_TONE = {
    # 加工後の平均輝度。179 まで上げると実写は霞んで見えるため、少し下げて揃えた
    'target_mean': 172,
    'black': 18,  # 出力の黒レベル（持ち上げすぎると霞んだ印象になる）
    'white': 252,  # 出力の白レベル（完全な白飛びを避ける）
}

# レベル補正で黒・白に揃える入力側の分位点（くすんだ写真のレンジを広げる）
LEVELS_LOW = 0.005
LEVELS_HIGH = 0.995

# 写真ごとの上書き
TONE_OVERRIDES: dict[str, dict[str, int]] = {}

WEBP_QUALITY = 82

# ガンマの探索範囲。端に張り付いたら目標の明るさに届いていない
GAMMA_RANGE = (0.3, 4.0)


def luminance(image: Image.Image) -> Image.Image:
    return image.convert('L')


def percentile(hist: list[int], q: float) -> int:
    """輝度ヒストグラムの分位点"""
    total = sum(hist)
    acc = 0
    for i, n in enumerate(hist):
        acc += n
        if acc >= q * total:
            return i
    return 255


def stats(image: Image.Image) -> dict[str, float]:
    """輝度の平均と分位点（p5 / p50 / p95）を返す"""
    hist = luminance(image).histogram()
    mean = sum(i * n for i, n in enumerate(hist)) / sum(hist)
    return {
        'mean': mean,
        'p5': percentile(hist, 0.05),
        'p50': percentile(hist, 0.5),
        'p95': percentile(hist, 0.95),
    }


def input_levels(image: Image.Image) -> tuple[int, int]:
    """レベル補正の入力側の黒点・白点（輝度の分位点）。平坦な画像でも 0 除算しないよう白点を黒点より上にする"""
    hist = luminance(image).histogram()
    low = percentile(hist, LEVELS_LOW)
    high = percentile(hist, LEVELS_HIGH)
    return low, max(high, low + 1)


def build_lut(levels: tuple[int, int], gamma: float, black: int, white: int) -> list[int]:
    """レベル補正でレンジを広げ、中間調をガンマで持ち上げ、黒と白の出力レベルを狭めるトーンカーブ"""
    low, high = levels
    lut = []
    for i in range(256):
        x = min(max((i - low) / (high - low), 0.0), 1.0)
        lut.append(round(black + (white - black) * x ** (1 / gamma)))
    return lut


def apply_tone(image: Image.Image, levels: tuple[int, int], gamma: float, black: int, white: int) -> Image.Image:
    # RGB 各チャンネルに同じカーブを当てる（Photoshop のトーンカーブ相当で色相はほぼ保たれる）
    lut = build_lut(levels, gamma, black, white)
    return image.point(lut * 3)


def fit_gamma(image: Image.Image, levels: tuple[int, int], target_mean: float, black: int, white: int) -> float:
    """加工後の平均輝度が target_mean になるガンマを二分探索する"""
    # 探索は縮小画像で行う（平均輝度はほぼ変わらない）
    probe = image.copy()
    probe.thumbnail((400, 400))
    low, high = GAMMA_RANGE
    for _ in range(30):
        mid = (low + high) / 2
        if stats(apply_tone(probe, levels, mid, black, white))['mean'] < target_mean:
            low = mid
        else:
            high = mid
    return (low + high) / 2


def format_stats(s: dict[str, float]) -> str:
    return f"mean={s['mean']:.0f} p5={s['p5']} p50={s['p50']} p95={s['p95']}"


def open_rgb(path: Path) -> Image.Image:
    with Image.open(path) as image:
        return image.convert('RGB')


def process(slug: str, src_dir: Path, out_dir: Path) -> None:
    tone = {**DEFAULT_TONE, **TONE_OVERRIDES.get(slug, {})}
    source = open_rgb(src_dir / 'large' / f'{slug}.webp')
    with Image.open(src_dir / 'small' / f'{slug}.webp') as small_source:
        small_size = small_source.size

    levels = input_levels(source)
    gamma = fit_gamma(source, levels, tone['target_mean'], tone['black'], tone['white'])
    if any(abs(gamma - bound) < 0.01 for bound in GAMMA_RANGE):
        print(f'警告: {slug} のガンマが探索範囲の端（{gamma:.2f}）です。target_mean に届いていません', file=sys.stderr)
    large = apply_tone(source, levels, gamma, tone['black'], tone['white'])
    small = large.resize(small_size, Image.Resampling.LANCZOS)

    for size_dir, image in (('large', large), ('small', small)):
        target = out_dir / size_dir / f'{slug}-hero.webp'
        target.parent.mkdir(parents=True, exist_ok=True)
        image.save(target, 'WEBP', quality=WEBP_QUALITY, method=6)

    print(f'{slug}: gamma={gamma:.2f} {format_stats(stats(source))} -> {format_stats(stats(large))}')


def find_photo_dir() -> Path:
    for candidate in PHOTO_DIR_CANDIDATES:
        if (candidate / 'large' / f'{HERO_SLUGS[0]}.webp').exists():
            return candidate
    sys.exit(f'写真が見つかりません: {", ".join(str(c) for c in PHOTO_DIR_CANDIDATES)}')


def main() -> None:
    src_dir = find_photo_dir()
    parser = argparse.ArgumentParser(description='トップヒーロー用のハイキー写真を書き出す')
    parser.add_argument('--out-dir', type=Path, default=src_dir, help='large/ と small/ を置くディレクトリ')
    parser.add_argument('--stats-only', action='store_true', help='加工せず元写真の輝度だけ表示する')
    args = parser.parse_args()

    if args.stats_only:
        for slug in HERO_SLUGS:
            print(f'{slug}: {format_stats(stats(open_rgb(src_dir / "large" / f"{slug}.webp")))}')
        return

    for slug in HERO_SLUGS:
        process(slug, src_dir, args.out_dir)


if __name__ == '__main__':
    main()
