import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { COMMUNITY_GALLERY, MISSION_PHOTOS } from '~/content/mission'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import MissionPage, { meta } from './mission'

beforeEach(() => {
  stubMatchMedia()
  stubIntersectionObserver()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <MissionPage />
    </MemoryRouter>,
  )

describe('ミッションページ', () => {
  it('h1 はちょうど 1 つで、ミッションの一文を読み上げられる', () => {
    renderPage()
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveAccessibleName(
      '当社は、環境＝地球＋Forest＋水＋Animal＋街＋人を重要なテーマとして捉えています。',
    )
  })

  it('各セクションは重なり順を閉じ込める', () => {
    renderPage()
    document.querySelectorAll('section').forEach((section) => {
      expect(section).toHaveClass('isolate')
    })
  })

  it('スマイル宣言・地域と共に・地域の美化運動の本文を表示する', () => {
    renderPage()
    expect(screen.getByRole('img', { name: 'スマイル宣言' })).toBeInTheDocument()
    // 本文の小見出し「地域と共に」と、写真一覧のセクション見出し「地域と共に」の 2 つ
    expect(screen.getAllByRole('heading', { level: 2, name: '地域と共に' })).toHaveLength(2)
    expect(screen.getByRole('heading', { level: 2, name: '地域の美化運動' })).toBeInTheDocument()
    expect(screen.getByText(/環境クリエイターという名に恥じぬ様/)).toBeInTheDocument()
  })

  it('写真の切り替えは content の 3 枚を使う', () => {
    renderPage()
    const frames = document.querySelectorAll('[data-frame] img')
    expect([...frames].map((image) => image.getAttribute('src'))).toEqual(
      MISSION_PHOTOS.map((slug) => `/media/photos/large/${slug}.webp`),
    )
  })

  it('「地域と共に」の写真一覧を表示する', () => {
    renderPage()
    const section = screen.getByRole('region', { name: '地域と共に' })
    expect(within(section).getAllByRole('listitem')).toHaveLength(COMMUNITY_GALLERY.length)
  })

  it('ページ名を title に使う', () => {
    expect(meta()).toContainEqual({ title: 'MISSION・会社概要｜ウィルフロンティア' })
  })
})
