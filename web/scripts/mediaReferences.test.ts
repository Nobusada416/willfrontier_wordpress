import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSourceFiles, findMediaReferences, normalizeThemeSource } from './mediaReferences'

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

describe('normalizeThemeSource', () => {
  it('旧テーマの /web/public/media/ 参照を /media/ の文字列として扱えるようにする', () => {
    const php = `<img src="<?php echo get_template_directory_uri(); ?>/web/public/media/images/logocolor.svg">`
    expect(findMediaReferences(normalizeThemeSource(php))).toEqual(['/media/images/logocolor.svg'])
  })
})

describe('旧テーマ（ルート直下の *.php）が参照するメディア', () => {
  // P11 で旧テーマを削除するまで、移動先の web/public/media を参照し続けるため検証する
  const themeDir = join(import.meta.dirname, '../..')
  const publicDir = join(import.meta.dirname, '../public')

  it('すべて web/public に実在する', () => {
    const phpFiles = readdirSync(themeDir).filter((name) => name.endsWith('.php'))
    expect(phpFiles.length).toBeGreaterThan(0)
    const missing = phpFiles
      .flatMap((name) =>
        findMediaReferences(normalizeThemeSource(readFileSync(join(themeDir, name), 'utf8'))),
      )
      .filter((path) => !existsSync(join(publicDir, path)))
    expect(missing).toEqual([])
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

  // P9 の Lighthouse で、24px で表示するアイコンに 976px・800KB 超の png を使っていたなど、
  // 表示に対して大きすぎる画像が初回の通信量を押し上げていた。装飾・イラストの画像が大きくなりすぎないようにする
  it('/media/images/ の画像はどれも 300KB 以下', () => {
    const MAX_BYTES = 300 * 1024
    const tooLarge = [
      ...new Set(
        collectSourceFiles(appDir).flatMap((file) =>
          findMediaReferences(readFileSync(file, 'utf8')),
        ),
      ),
    ]
      .filter((path) => path.startsWith('/media/images/'))
      .filter((path) => statSync(join(publicDir, path)).size > MAX_BYTES)
    expect(tooLarge).toEqual([])
  })
})
