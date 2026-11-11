import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OFFICES } from '~/content/company'
import { FOOTER_NAV } from '~/content/navigation'
import { resetIntroForTest } from '~/lib/motion/intro'
import { resetScrollLockForTest } from '~/lib/motion/scrollLock'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import HomePage from './home'

beforeEach(() => {
  stubMatchMedia()
  stubIntersectionObserver()
})

afterEach(() => {
  vi.unstubAllGlobals()
  resetIntroForTest()
  resetScrollLockForTest()
  sessionStorage.clear()
})

const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )

describe('トップページ', () => {
  it('各セクションは重なり順を閉じ込め、葉などが固定ヘッダーの上に出ない', () => {
    renderHome()
    document.querySelectorAll('main section, section').forEach((section) => {
      expect(section, section.id).toHaveClass('isolate')
    })
  })

  it('h1 はちょうど 1 つ', () => {
    renderHome()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('各セクションの見出しを旧サイトの順で表示する（CAMPANY の誤字は COMPANY に直す）', () => {
    renderHome()
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual([
      'MISSION',
      'SERVICE',
      'WORKFLOW',
      'VEHICLE LINEUP',
      'GALLERY',
      'CASE STUDY',
      'SAFETY',
      'RECRUIT',
      'COMPANY',
    ])
    expect(document.body).not.toHaveTextContent('CAMPANY')
  })

  it('フッターナビのリンク先（/#section）がすべてページ内に存在する', () => {
    renderHome()
    FOOTER_NAV.forEach(({ href }) => {
      const id = href.replace('/#', '')
      expect(document.getElementById(id), id).not.toBeNull()
    })
  })

  it.each([
    ['MISSION', '/mission/'],
    ['SERVICE', '/service/'],
    ['WORKFLOW', '/workflow/'],
    ['VEHICLE LINEUP', '/vehicles/'],
    ['CASE STUDY', '/casestudy/'],
  ])('%s の「もっと見る」は %s へ移動し、リンク名で行き先がわかる', (section, href) => {
    renderHome()
    expect(screen.getByRole('link', { name: `もっと見る（${section}）` })).toHaveAttribute(
      'href',
      href,
    )
  })

  it('安全・採用のボタンはそれぞれのページへ移動する', () => {
    renderHome()
    expect(screen.getByRole('link', { name: /お問い合わせ（SAFETY）/ })).toHaveAttribute(
      'href',
      '/safety/',
    )
    expect(screen.getByRole('link', { name: '応募する' })).toHaveAttribute('href', '/recruit/')
  })

  it('SERVICE の 5 項目を一覧として表示する', () => {
    renderHome()
    const list = screen.getByRole('list', { name: 'サービスの特長' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
    expect(list).toHaveTextContent('鉄・非鉄買い取ります。')
  })

  it('WORKFLOW の 5 ステップを順序付きの一覧で表示する', () => {
    renderHome()
    const list = screen.getByRole('list', { name: '導入までの流れ' })
    expect(list.tagName).toBe('OL')
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
  })

  it('会社概要を 1 つの定義リストにまとめ、拠点ごとの連絡先を表示する', () => {
    renderHome()
    const section = document.getElementById('company')
    if (!section) throw new Error('COMPANY セクションがありません')
    expect(section.querySelectorAll('dl')).toHaveLength(1)
    expect(within(section).getByText('COMPANY NAME')).toHaveProperty('tagName', 'DT')
    OFFICES.forEach((office) => {
      expect(section).toHaveTextContent(office.address)
      expect(section).toHaveTextContent(office.tel)
    })
    expect(
      within(section).getByRole('link', { name: 'eco-will@kvj.biglobe.ne.jp' }),
    ).toHaveAttribute('href', 'mailto:eco-will@kvj.biglobe.ne.jp')
  })
})
