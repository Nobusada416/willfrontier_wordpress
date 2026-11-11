import { describe, expect, it } from 'vitest'
import { CONTACT_LINK, FOOTER_NAV, GLOBAL_NAV } from './navigation'
import { SITE } from './site'
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

  // 検索結果の説明文は PC で 90〜100 字、スマホで 80 字ほど表示される。短すぎると情報が足りず、
  // 長すぎると要点が切れる（docs/architecture.md の「meta はページ定義から生成する」）
  it('全ページに検索結果用の説明文（70〜120 字）がある', () => {
    for (const page of PAGES) {
      expect([...page.description].length, page.id).toBeGreaterThanOrEqual(70)
      expect([...page.description].length, page.id).toBeLessThanOrEqual(120)
    }
  })

  // 検索結果の title は PC で 30 字前後までしか表示されない（「｜ウィルフロンティア」を含めた長さ）
  it('title（「ページ名｜サイト名」）は 32 字以内', () => {
    for (const page of PAGES) {
      expect([...`${page.title}｜${SITE.name}`].length, page.id).toBeLessThanOrEqual(32)
    }
  })

  it('title と説明文はページごとに異なる', () => {
    const titles = PAGES.map((page) => page.title)
    const descriptions = PAGES.map((page) => page.description)
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })

  // 画面の英語の見出し（SERVICE など）ではなく、検索で使われる日本語を先に置く
  it('title は英語の見出しで始めない', () => {
    for (const page of PAGES) {
      expect(page.title, page.id).not.toMatch(/^[A-Za-z]/)
    }
  })

  // 全ページの title に地域名を付けると同じ言葉の繰り返しになるため、地域名はトップだけ（説明文には入れてよい）
  it('title に地域名（横浜・神奈川）を入れるのはトップだけ', () => {
    const withRegion = PAGES.filter((page) => /横浜|神奈川/.test(page.title)).map((page) => page.id)
    expect(withRegion).toEqual(['home'])
  })

  it('title は社名を含めない（「｜サイト名」は buildMeta が付ける）', () => {
    for (const page of PAGES) {
      expect(page.title, page.id).not.toContain(SITE.name)
    }
  })

  // 報道（2026-10 の厚木の施設の火災）を受け、検索結果の文言に施設名・地名を出さない（docs/architecture.md）
  it('title と説明文に厚木の施設名（WF-A.BASE）・地名を出さない', () => {
    for (const page of PAGES) {
      expect(`${page.title}${page.description}`, page.id).not.toMatch(/厚木|WF-A\.BASE/)
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
