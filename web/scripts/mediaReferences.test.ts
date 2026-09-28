import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, findMediaReferences } from './mediaReferences'

describe('findMediaReferences', () => {
  it('写真スラッグから small / large の webp を求める', () => {
    expect(findMediaReferences(`<Picture slug="wf-079" alt="" />`)).toEqual([
      '/media/photos/small/wf-079.webp',
      '/media/photos/large/wf-079.webp',
    ])
  })

  it('動画スラッグから mp4 と poster の jpg を求める', () => {
    expect(findMediaReferences(`const VIDEOS = ['shorts/s08']`)).toEqual([
      '/media/videos/shorts/s08.mp4',
      '/media/videos/shorts/s08.jpg',
    ])
  })

  it('/media/ で始まるパスはそのまま返す', () => {
    expect(findMediaReferences(`src="/media/images/logocolor.svg"`)).toEqual([
      '/media/images/logocolor.svg',
    ])
  })

  it('重複を除き、クォートで囲まれていない文字列は拾わない', () => {
    expect(findMediaReferences(`'wf-001' "wf-001" // wf-002 の説明`)).toEqual([
      '/media/photos/small/wf-001.webp',
      '/media/photos/large/wf-001.webp',
    ])
  })
})

describe('web/app が参照するメディア', () => {
  const appDir = join(import.meta.dirname, '../app')
  const publicDir = join(import.meta.dirname, '../public')

  it('テストを除くソースファイルを集める', () => {
    const files = collectSourceFiles(appDir)
    expect(files.some((file) => file.endsWith('Logo.tsx'))).toBe(true)
    expect(files.some((file) => file.includes('.test.'))).toBe(false)
  })

  it('すべて web/public に実在する', () => {
    const missing = collectSourceFiles(appDir)
      .flatMap((file) => findMediaReferences(readFileSync(file, 'utf8')))
      .filter((path) => !existsSync(join(publicDir, path)))
    expect(missing).toEqual([])
  })
})
