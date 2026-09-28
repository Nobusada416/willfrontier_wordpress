import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import manifest from '../app/lib/mediaManifest.json'
import { buildMediaManifest } from './mediaManifest'

const PUBLIC_DIR = join(import.meta.dirname, '../public')

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
})
