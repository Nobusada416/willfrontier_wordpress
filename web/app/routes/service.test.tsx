import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SERVICE_BUSINESSES, SERVICE_FEATURES } from '~/content/service'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import ServicePage, { meta } from './service'

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
      <ServicePage />
    </MemoryRouter>,
  )

describe('サービスページ', () => {
  it('h1 はちょうど 1 つ', () => {
    renderPage()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('各セクションは重なり順を閉じ込める', () => {
    renderPage()
    document.querySelectorAll('section').forEach((section) => {
      expect(section).toHaveClass('isolate')
    })
  })

  it('図の 5 つの特長は、画像の文字を代替テキストで読み上げられる', () => {
    renderPage()
    const list = screen.getByRole('list', { name: 'サービスの特長' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(SERVICE_FEATURES.length)
    SERVICE_FEATURES.forEach((feature, index) => {
      const item = items[index]
      if (!item) throw new Error(`${index} 番目の特長がありません`)
      expect(within(item).getByRole('img', { name: feature.badge.alt })).toBeInTheDocument()
      expect(within(item).getByRole('img', { name: feature.detail.alt })).toBeInTheDocument()
    })
  })

  it('事業内容のカードを content から描画する', () => {
    renderPage()
    const section = screen.getByRole('region', { name: '事業内容' })
    expect(
      within(section)
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(SERVICE_BUSINESSES.map((business) => business.name))
  })

  it('お問い合わせへ誘導する', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { level: 2, name: 'サービスのご相談はこちら' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'お問い合わせ' })).toHaveAttribute('href', '/contact/')
  })

  it('ページ名を title に使う', () => {
    expect(meta()).toContainEqual({ title: 'SERVICE・事業内容｜ウィルフロンティア' })
  })
})
