import { describe, expect, it } from 'vitest'
import { CONTACT_LINK, FOOTER_NAV, GLOBAL_NAV } from './navigation'
import {
  ADMIN_PAGES,
  NOT_FOUND_PATH,
  PAGES,
  adminEditPath,
  getAdminPage,
  getPage,
  isAdminPath,
  prerenderPaths,
} from './pages'

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

describe('ADMIN_PAGES（管理画面）', () => {
  it('ログイン兼一覧・新規作成・編集の 3 画面', () => {
    expect(ADMIN_PAGES.map((page) => page.path)).toEqual([
      '/admin/',
      '/admin/case-studies/new/',
      '/admin/case-studies/edit/',
    ])
  })

  it('サイトのページ一覧（PAGES。sitemap・ナビの対象）には含めない', () => {
    expect(PAGES.some((page) => isAdminPath(page.path))).toBe(false)
  })

  it('静的に書き出すため、パスに動的なセグメントを使わない', () => {
    for (const page of ADMIN_PAGES) expect(page.path).toMatch(/^\/admin\/([a-z-]+\/)*$/)
  })

  it('getAdminPage は id に対応する画面を返す', () => {
    expect(getAdminPage('admin-new').path).toBe('/admin/case-studies/new/')
  })
})

describe('isAdminPath', () => {
  it.each(['/admin', '/admin/', '/admin/case-studies/edit/'])('%s は管理画面', (path) => {
    expect(isAdminPath(path)).toBe(true)
  })

  it.each(['/', '/administrator/', '/casestudy/', '/contact/admin/'])(
    '%s は管理画面ではない',
    (path) => {
      expect(isAdminPath(path)).toBe(false)
    },
  )
})

describe('adminEditPath', () => {
  it('編集画面の URL は事例の ID をクエリで渡す（静的に書き出すため）', () => {
    expect(adminEditPath('abc_123')).toBe('/admin/case-studies/edit/?id=abc_123')
  })

  it('ID は URL エンコードする', () => {
    expect(adminEditPath('a b')).toBe('/admin/case-studies/edit/?id=a%20b')
  })
})

describe('getPage', () => {
  it('id に対応するページ定義を返す', () => {
    expect(getPage('contact').path).toBe('/contact/')
  })
})

describe('prerenderPaths', () => {
  it('全ページ（管理画面を含む）のパスを末尾スラッシュなしで返す', () => {
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
      '/admin',
      '/admin/case-studies/new',
      '/admin/case-studies/edit',
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
