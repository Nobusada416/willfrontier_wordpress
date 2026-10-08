#!/usr/bin/env python3
"""トップヒーロー用に写真を明るく柔らかいトーン（ハイキー）へ加工する。

左上の生成AI画像（wf-112）だけが明るく浮いて見えるため、残りの実写 8 枚を
同じ明るさ・コントラストに寄せた `<slug>-hero.webp` を別ファイルとして書き出す。
元の webp は他ページでも使っているので上書きしない。

使い方:
  python3 -I scripts/hero-highkey.py                      # assets/photos に出力
  python3 -I scripts/hero-highkey.py --out-dir web/public/media/photos
  python3 -I scripts/hero-highkey.py --stats-only         # 現状の輝度だけ表示
"""

import argparse
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / 'assets' / 'photos'

# 基準にする AI 画像（加工しない）
REFERENCE_SLUG = 'wf-112'

# ヒーローで加工する 8 枚
HERO_SLUGS = [
    'wf-114',
    'wf-079',
    'wf-095',
    'wf-086',
    'wf-092',
    'wf-104',
    'wf-105',
    'wf-102',
]

# 既定のトーン（AI 画像の実測 mean=179 / p5=58 / p95=252 に寄せる）
DEFAULT_TONE = {
    'target_mean': 172,  # 加工後の平均輝度
    'black': 18,  # 出力の黒レベル（持ち上げすぎると霞んだ印象になる）
    'white': 252,  # 出力の白レベル（完全な白飛びを避ける）
}

# レベル補正で黒・白に揃える入力側の分位点（くすんだ写真のレンジを広げる）
LEVELS_LOW = 0.005
LEVELS_HIGH = 0.995

# 写真ごとの上書き
TONE_OVERRIDES: dict[str, dict[str, int]] = {}

WEBP_QUALITY = 82


def luminance(image: Image.Image) -> Image.Image:
    return image.convert('L')


def stats(image: Image.Image) -> dict[str, float]:
    """輝度の平均と分位点（p5 / p50 / p95）を返す"""
    hist = luminance(image).histogram()
    total = sum(hist)
    mean = sum(i * n for i, n in enumerate(hist)) / total

    def percentile(q: float) -> int:
        acc = 0
        for i, n in enumerate(hist):
            acc += n
            if acc >= q * total:
                return i
        return 255

    return {'mean': mean, 'p5': percentile(0.05), 'p50': percentile(0.5), 'p95': percentile(0.95)}


def input_levels(image: Image.Image) -> tuple[int, int]:
    """レベル補正の入力側の黒点・白点（輝度の分位点）"""
    hist = luminance(image).histogram()
    total = sum(hist)
    acc = 0
    low = high = None
    for i, n in enumerate(hist):
        acc += n
        if low is None and acc >= LEVELS_LOW * total:
            low = i
        if high is None and acc >= LEVELS_HIGH * total:
            high = i
    return low or 0, max(high or 255, (low or 0) + 1)


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
    low, high = 0.3, 4.0
    for _ in range(30):
        mid = (low + high) / 2
        if stats(apply_tone(probe, levels, mid, black, white))['mean'] < target_mean:
            low = mid
        else:
            high = mid
    return (low + high) / 2


def format_stats(s: dict[str, float]) -> str:
    return f"mean={s['mean']:.0f} p5={s['p5']} p50={s['p50']} p95={s['p95']}"


def process(slug: str, out_dir: Path) -> None:
    tone = {**DEFAULT_TONE, **TONE_OVERRIDES.get(slug, {})}
    source = Image.open(SRC_DIR / 'large' / f'{slug}.webp').convert('RGB')
    small_size = Image.open(SRC_DIR / 'small' / f'{slug}.webp').size

    levels = input_levels(source)
    gamma = fit_gamma(source, levels, tone['target_mean'], tone['black'], tone['white'])
    large = apply_tone(source, levels, gamma, tone['black'], tone['white'])
    small = large.resize(small_size, Image.Resampling.LANCZOS)

    for size_dir, image in (('large', large), ('small', small)):
        target = out_dir / size_dir / f'{slug}-hero.webp'
        target.parent.mkdir(parents=True, exist_ok=True)
        image.save(target, 'WEBP', quality=WEBP_QUALITY, method=6)

    print(f'{slug}: gamma={gamma:.2f} {format_stats(stats(source))} -> {format_stats(stats(large))}')


def main() -> None:
    parser = argparse.ArgumentParser(description='トップヒーロー用のハイキー写真を書き出す')
    parser.add_argument('--out-dir', type=Path, default=SRC_DIR, help='large/ と small/ を置くディレクトリ')
    parser.add_argument('--stats-only', action='store_true', help='加工せず現状の輝度だけ表示する')
    args = parser.parse_args()

    reference = Image.open(SRC_DIR / 'large' / f'{REFERENCE_SLUG}.webp').convert('RGB')
    print(f'{REFERENCE_SLUG}（基準）: {format_stats(stats(reference))}')

    if args.stats_only:
        for slug in HERO_SLUGS:
            print(f'{slug}: {format_stats(stats(Image.open(SRC_DIR / "large" / f"{slug}.webp")))}')
        return

    for slug in HERO_SLUGS:
        process(slug, args.out_dir)


if __name__ == '__main__':
    main()
