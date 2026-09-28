import { describe, expect, it } from 'vitest'
import { CONTACT_LINK, FOOTER_NAV, GLOBAL_NAV } from './navigation'
import { NOT_FOUND_PATH, PAGES, getPage, prerenderPaths } from './pages'

// ナビゲーションの href からパス部分（ハッシュと末尾スラッシュを除く）を取り出す
const pathnameOf = (href: string) =>
  new URL(href, 'https://example.com').pathname.replace(/(.)\/$/, '$1')

describe('PAGES（ページ定義）', () => {
  it('id とパスが重複しない', () => {
    const ids = PAGES.map((page) => page.id)
    const paths = PAGES.map((page) => page.path)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('トップ以外のパスは末尾スラッシュ付きで定義されている', () => {
    for (const page of PAGES) {
      expect(page.path).toMatch(/^\/([a-z0-9-]+\/)*$/)
    }
  })

  it('現行サイトの 9 ページをすべて含む', () => {
    expect(PAGES.map((page) => page.path)).toEqual(
      expect.arrayContaining([
        '/',
        '/mission/',
        '/service/',
        '/workflow/',
        '/vehicles/',
        '/casestudy/',
        '/safety/',
        '/recruit/',
        '/contact/',
      ]),
    )
  })

  it('全ページに検索結果用の説明文（120 字以内）がある', () => {
    for (const page of PAGES) {
      expect(page.description.length).toBeGreaterThan(0)
      expect(page.description.length).toBeLessThanOrEqual(120)
    }
  })
})

describe('getPage', () => {
  it('id に対応するページ定義を返す', () => {
    expect(getPage('contact').path).toBe('/contact/')
  })
})

describe('prerenderPaths', () => {
  it('全ページのパスを末尾スラッシュなしで返す', () => {
    // 末尾スラッシュ付き（'/mission/'）で渡すと React Router が中身の空の HTML を出力するため
    expect(prerenderPaths()).toEqual([
      '/',
      '/mission',
      '/service',
      '/workflow',
      '/vehicles',
      '/casestudy',
      '/safety',
      '/recruit',
      '/contact',
      '/404',
    ])
  })

  it('404 ページはサイトのページ一覧（PAGES）には含めない', () => {
    expect(PAGES.map((page) => page.path)).not.toContain(NOT_FOUND_PATH)
  })
})

describe('ナビゲーションのリンク先', () => {
  const allLinks = [...GLOBAL_NAV, ...FOOTER_NAV, CONTACT_LINK]

  it.each(allLinks)('$label ($href) がプリレンダー対象のページを指す', ({ href }) => {
    expect(prerenderPaths()).toContain(pathnameOf(href))
  })

  it('CONTACT ボタンはお問い合わせページを指す', () => {
    expect(CONTACT_LINK.href).toBe('/contact/')
  })

  it('フッターのアンカーリンクは下層ページからも機能するようトップページ基準になっている', () => {
    for (const item of FOOTER_NAV) {
      expect(item.href).toMatch(/^\/(#[a-z-]+)?$|^\/[a-z-]+\/$/)
    }
  })
})
