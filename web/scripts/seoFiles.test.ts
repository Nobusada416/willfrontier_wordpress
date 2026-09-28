import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { imageSize } from 'image-size'
import { describe, expect, it } from 'vitest'
import { PAGES } from '../app/content/pages'
import { LOGO_PATH, OG_IMAGE } from '../app/content/site'
import { buildRobotsTxt, buildSitemapXml, escapeXml, sitemapUrls } from './seoFiles'

const SITE_URL = 'https://example.com'
const PUBLIC_DIR = join(import.meta.dirname, '../public')

describe('escapeXml', () => {
  it('XML の特殊文字をエスケープする', () => {
    expect(escapeXml(`a&b<c>d"e'f`)).toBe('a&amp;b&lt;c&gt;d&quot;e&apos;f')
  })

  it('& を最初に置き換える（二重エスケープしない）', () => {
    expect(escapeXml('&lt;')).toBe('&amp;lt;')
  })
})

describe('sitemapUrls', () => {
  it('サイトの URL にページのパスを付ける（末尾スラッシュ形式を維持）', () => {
    expect(
      sitemapUrls(SITE_URL, [
        { path: '/' },
        { path: '/mission/' },
        { path: '/contact/' },
      ]),
    ).toEqual(['https://example.com/', 'https://example.com/mission/', 'https://example.com/contact/'])
  })

  it('サイトの全ページ（404 を除く）を含む', () => {
    const urls = sitemapUrls(SITE_URL, PAGES)
    expect(urls).toHaveLength(PAGES.length)
    expect(urls.every((url) => url.endsWith('/'))).toBe(true)
    expect(urls.some((url) => url.includes('404'))).toBe(false)
  })
})

describe('buildSitemapXml', () => {
  const xml = buildSitemapXml(SITE_URL, [{ path: '/' }, { path: '/mission/' }])

  it('XML 宣言と sitemaps.org の名前空間を持つ', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true)
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true)
  })

  it('ページごとに <url><loc> を出力する', () => {
    expect(xml).toContain('<url><loc>https://example.com/</loc></url>')
    expect(xml).toContain('<url><loc>https://example.com/mission/</loc></url>')
    expect(xml.match(/<url>/g)).toHaveLength(2)
  })

  it('URL 中の特殊文字をエスケープする', () => {
    expect(buildSitemapXml(SITE_URL, [{ path: '/a?b=1&c=2/' }])).toContain(
      '<loc>https://example.com/a?b=1&amp;c=2/</loc>',
    )
  })
})

describe('buildRobotsTxt', () => {
  it('インデックス禁止（既定）のときは全体をクロール禁止にし、sitemap を案内しない', () => {
    const txt = buildRobotsTxt(SITE_URL, false)
    expect(txt).toBe('User-agent: *\nDisallow: /\n')
  })

  it('インデックスを許可したときは全体を許可し、sitemap の URL を載せる', () => {
    const txt = buildRobotsTxt(SITE_URL, true)
    expect(txt).toBe('User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\n')
  })
})

describe('web/public の SEO 用画像', () => {
  const sizeOf = (path: string) => imageSize(readFileSync(join(PUBLIC_DIR, path)))

  it('OGP 画像は site.ts の寸法（1200×630）の jpg', () => {
    const size = sizeOf(OG_IMAGE.path)
    expect(size).toMatchObject({ width: OG_IMAGE.width, height: OG_IMAGE.height, type: 'jpg' })
  })

  it('apple-touch-icon は 180×180 の png', () => {
    expect(sizeOf('/apple-touch-icon.png')).toMatchObject({ width: 180, height: 180, type: 'png' })
  })

  it('構造化データのロゴは 112px 以上の png（Google の推奨）', () => {
    const size = sizeOf(LOGO_PATH)
    expect(size.type).toBe('png')
    expect(size.width).toBeGreaterThanOrEqual(112)
    expect(size.height).toBeGreaterThanOrEqual(112)
  })

  it('favicon（svg と ico）がある', () => {
    expect(existsSync(join(PUBLIC_DIR, 'favicon.svg'))).toBe(true)
    expect(existsSync(join(PUBLIC_DIR, 'favicon.ico'))).toBe(true)
  })
})
