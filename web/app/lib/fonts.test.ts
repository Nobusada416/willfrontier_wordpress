import { afterEach, describe, expect, it } from 'vitest'
import { FONT_LOADER_SCRIPT, FONT_STYLESHEET_URL } from './fonts'

// <head> に埋め込むインラインスクリプトをテスト内で実行する
const runFontLoader = () => new Function(FONT_LOADER_SCRIPT)()

afterEach(() => {
  document.head.innerHTML = ''
})

describe('FONT_STYLESHEET_URL', () => {
  it('Google Fonts の Zen Maru Gothic と Quicksand を font-display: swap で読み込む', () => {
    const url = new URL(FONT_STYLESHEET_URL)
    expect(url.origin).toBe('https://fonts.googleapis.com')
    expect(url.searchParams.getAll('family')).toEqual([
      'Quicksand:wght@300..700',
      'Zen Maru Gothic:wght@400;500;700;900',
    ])
    expect(url.searchParams.get('display')).toBe('swap')
  })
})

describe('FONT_LOADER_SCRIPT', () => {
  it('フォントの stylesheet を <head> に追加する（スクリプトから追加した link は描画を止めない）', () => {
    runFontLoader()
    const links = document.head.querySelectorAll('link[rel="stylesheet"]')
    expect(links).toHaveLength(1)
    expect(links[0]?.getAttribute('href')).toBe(FONT_STYLESHEET_URL)
  })

  it('2 回実行しても stylesheet を重複して追加しない', () => {
    runFontLoader()
    runFontLoader()
    expect(document.head.querySelectorAll('link[rel="stylesheet"]')).toHaveLength(1)
  })
})
