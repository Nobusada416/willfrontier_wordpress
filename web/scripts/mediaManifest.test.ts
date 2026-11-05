import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { HERO_TILES, MISSION_BACKGROUND } from '../app/content/home'
import manifest from '../app/lib/mediaManifest.json'
import { buildMediaManifest } from './mediaManifest'

const PUBLIC_DIR = join(import.meta.dirname, '../public')
// scripts/photo-xsmall.py の XSMALL_SHORT_SIDE と合わせる
const XSMALL_SHORT_SIDE = 400

describe('メディアの寸法一覧（app/lib/mediaManifest.json）', () => {
  it('web/public/media の実ファイルと一致する（ずれていたら npm run media:manifest -w web で作り直す）', () => {
    expect(buildMediaManifest(PUBLIC_DIR)).toEqual(manifest)
  })

  it('写真は small と large の両方がそろっている', () => {
    const photos = buildMediaManifest(PUBLIC_DIR).photos
    expect(Object.keys(photos).length).toBeGreaterThan(0)
    Object.entries(photos).forEach(([slug, sizes]) => {
      expect(sizes.small.width, slug).toBeGreaterThan(0)
      expect(sizes.large.width, slug).toBeGreaterThanOrEqual(sizes.small.width)
    })
  })

  it('xsmall は短辺 400px で、small より小さい', () => {
    const photos = buildMediaManifest(PUBLIC_DIR).photos
    const withXsmall = Object.entries(photos).filter(([, sizes]) => sizes.xsmall)
    expect(withXsmall.length).toBeGreaterThan(0)
    withXsmall.forEach(([slug, { xsmall, small, large }]) => {
      if (!xsmall) return
      expect(Math.min(xsmall.width, xsmall.height), slug).toBe(XSMALL_SHORT_SIDE)
      expect(xsmall.width, slug).toBeLessThan(small.width)
      // 縦横比は large と同じ（1px の丸めは許す）
      expect(Math.abs(xsmall.height - (xsmall.width * large.height) / large.width), slug).toBeLessThan(1)
    })
  })

  // P9 の Lighthouse: トップのモザイク（表示幅 140px 前後）と MISSION の背景が幅 768px の small を読み込み、
  // 目標の 85 に届かない主因になっていた。small が xsmall より大きい写真には xsmall を用意する
  it('トップのファーストビュー（HERO_TILES）と MISSION の背景の写真は、small が大きければ xsmall がある', () => {
    const photos = buildMediaManifest(PUBLIC_DIR).photos
    const missing = [...HERO_TILES, ...MISSION_BACKGROUND].filter((slug) => {
      const sizes = photos[slug]
      if (!sizes) return true
      const smallShortSide = Math.min(sizes.small.width, sizes.small.height)
      return smallShortSide > XSMALL_SHORT_SIDE && !sizes.xsmall
    })
    expect(missing).toEqual([])
  })
})
