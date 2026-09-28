import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { FONT_STYLESHEET_URL } from './lib/fonts'
import { links } from './root'

const PUBLIC_DIR = join(import.meta.dirname, '../public')

describe('root の links', () => {
  // LinkDescriptor は rel を持たない形（prefetch 用の page 指定）も含むため、rel のあるものに絞る
  const icons = links().flatMap((link) =>
    'rel' in link && (link.rel === 'icon' || link.rel === 'apple-touch-icon') ? [link] : [],
  )

  it('favicon（ico と svg）と apple-touch-icon を指定する', () => {
    expect(icons).toEqual([
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ])
  })

  it('指定したアイコンが web/public に実在する', () => {
    icons.forEach((icon) => {
      const href = icon.href ?? ''
      expect(href).not.toBe('')
      expect(existsSync(join(PUBLIC_DIR, href)), href).toBe(true)
    })
  })
})

describe('root の links（フォント）', () => {
  it('フォントの stylesheet を <link> で直接読み込まない（描画を止めるため。lib/fonts.ts のスクリプトで追加する）', () => {
    const hrefs = links().flatMap((link) => ('href' in link && link.href ? [link.href] : []))
    expect(hrefs).not.toContain(FONT_STYLESHEET_URL)
  })

  it('フォントの配信元へ先に接続する', () => {
    const preconnects = links().flatMap((link) =>
      'rel' in link && link.rel === 'preconnect' ? [link.href] : [],
    )
    expect(preconnects).toEqual(['https://fonts.googleapis.com', 'https://fonts.gstatic.com'])
  })
})
