#!/usr/bin/env python3
"""トップで小さく表示する写真の xsmall（短辺 400px）の webp を書き出す。

P9 の Lighthouse で、トップのファーストビューのモザイク（表示幅 140px 前後）と MISSION の背景が
幅 768px の small を読み込み、Performance が目標の 85 に届かない主因になっていた。
large から縮小し、web/public/media/photos/xsmall/<slug>.webp に書き出す。
small の短辺が 400px 以下の写真（small が 360×480 など）は small で足りるため書き出さない。

使い方（Pillow が必要。-I はユーザー site-packages を読まないため、Pillow は venv か system に入れる）:
  python3 -I scripts/photo-xsmall.py
出力後に npm run media:manifest -w web で寸法一覧を作り直す。
写真を差し替えたとき（scripts/hero-highkey.py で -hero 版を作り直したときを含む）も実行し直す。
"""

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PHOTO_DIR = ROOT / 'web' / 'public' / 'media' / 'photos'

# web/scripts/mediaManifest.test.ts の XSMALL_SHORT_SIDE と合わせる
XSMALL_SHORT_SIDE = 400

# web/app/content/home.ts の HERO_TILES と MISSION_BACKGROUND（足りないものはテストで検出する）
SLUGS = [
    'wf-112-hero',
    'wf-114-hero',
    'wf-079-hero',
    'wf-095-hero',
    'wf-086-hero',
    'wf-092-hero',
    'wf-104-hero',
    'wf-105-hero',
    'wf-102-hero',
    'wf-114',
    'wf-079',
    'wf-092',
]

# scripts/hero-highkey.py と同じ書き出しの設定
WEBP_QUALITY = 82


def xsmall_size(width: int, height: int) -> tuple[int, int]:
    """短辺を XSMALL_SHORT_SIDE にした寸法（縦横比は保つ）"""
    if width <= height:
        return XSMALL_SHORT_SIDE, round(height * XSMALL_SHORT_SIDE / width)
    return round(width * XSMALL_SHORT_SIDE / height), XSMALL_SHORT_SIDE


def main() -> int:
    out_dir = PHOTO_DIR / 'xsmall'
    out_dir.mkdir(exist_ok=True)
    for slug in SLUGS:
        with Image.open(PHOTO_DIR / 'small' / f'{slug}.webp') as small:
            if min(small.size) <= XSMALL_SHORT_SIDE:
                print(f'{slug}: small が {small.size[0]}x{small.size[1]} のため書き出さない')
                continue
        with Image.open(PHOTO_DIR / 'large' / f'{slug}.webp') as large:
            size = xsmall_size(*large.size)
            image = large.convert('RGB').resize(size, Image.Resampling.LANCZOS)
        target = out_dir / f'{slug}.webp'
        image.save(target, 'WEBP', quality=WEBP_QUALITY, method=6)
        print(f'{slug}: {size[0]}x{size[1]} {target.stat().st_size // 1024}KB')
    return 0


if __name__ == '__main__':
    sys.exit(main())
