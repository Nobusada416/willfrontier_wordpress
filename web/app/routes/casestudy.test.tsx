import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CASE_HERO_PHOTOS, CASE_STUDIES } from '~/content/cases'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import CaseStudyPage, { meta } from './casestudy'

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
      <CaseStudyPage />
    </MemoryRouter>,
  )

describe('施工事例ページ', () => {
  it('h1 はちょうど 1 つ', () => {
    renderPage()
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('CASE STUDY')
  })

  it('各セクションは重なり順を閉じ込める', () => {
    renderPage()
    document.querySelectorAll('section').forEach((section) => {
      expect(section).toHaveClass('isolate')
    })
  })

  it('ヒーローは content の 6 枚をタイル状に並べる', () => {
    renderPage()
    const tiles = [...document.querySelectorAll('[data-tile] img')]
    expect(tiles.map((image) => image.getAttribute('src'))).toEqual(
      CASE_HERO_PHOTOS.map((slug) => `/media/photos/large/${slug}.webp`),
    )
  })

  it('主要施工事例を content から描画し、各事例に写真 4 枚を添える', () => {
    renderPage()
    const section = screen.getByRole('region', { name: '主要施工事例' })
    const list = within(section).getByRole('list', { name: '主要施工事例' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(CASE_STUDIES.length)
    const articles = within(list).getAllByRole('article')
    expect(articles).toHaveLength(CASE_STUDIES.length)
    CASE_STUDIES.forEach((study, index) => {
      const article = articles[index]
      if (!article) throw new Error(`${index} 番目の事例がありません`)
      expect(within(article).getByRole('heading', { level: 3 })).toHaveTextContent(study.title)
      expect(within(article).getByText(study.meta)).toBeInTheDocument()
      expect(article.querySelectorAll('img')).toHaveLength(4)
    })
  })

  it('お問い合わせへ誘導する', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { level: 2, name: 'あなたの現場、ご相談ください。' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'お問い合わせ' })).toHaveAttribute('href', '/contact/')
  })

  it('ページ名を title に使う', () => {
    expect(meta()).toContainEqual({ title: 'CASE STUDY・施工事例｜ウィルフロンティア' })
  })
})
