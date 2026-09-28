import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CONTACT_FAQ, CONTACT_HERO_PHOTOS, CONTACT_STEPS } from '~/content/contact'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import ContactPage, { meta } from './contact'

vi.mock('~/lib/submitInquiry', () => ({
  submitInquiry: vi.fn(),
  prepareSubmitInquiry: vi.fn(),
}))

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
      <ContactPage />
    </MemoryRouter>,
  )

describe('お問い合わせページ', () => {
  it('h1 はちょうど 1 つ', () => {
    renderPage()
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('CONTACT')
  })

  it('各セクションは重なり順を閉じ込める', () => {
    renderPage()
    document.querySelectorAll('section').forEach((section) => {
      expect(section).toHaveClass('isolate')
    })
  })

  it('ヒーローは content の 3 枚を切り替え、1 枚目を優先して読み込む', () => {
    renderPage()
    const frames = [...document.querySelectorAll('[data-frame] img')]
    expect(frames.map((image) => image.getAttribute('src'))).toEqual(
      CONTACT_HERO_PHOTOS.map((slug) => `/media/photos/large/${slug}.webp`),
    )
    expect(frames[0]).toHaveAttribute('fetchpriority', 'high')
  })

  it('お問い合わせ後の流れを順序のある一覧で示す', () => {
    renderPage()
    const steps = screen.getByRole('list', { name: 'お問い合わせ後の流れ' })
    expect(steps.tagName).toBe('OL')
    const items = within(steps).getAllByRole('listitem')
    expect(items).toHaveLength(CONTACT_STEPS.length)
    CONTACT_STEPS.forEach((step, index) => {
      expect(items[index]).toHaveTextContent(`STEP ${index + 1}`)
      expect(items[index]).toHaveTextContent(step.title)
    })
  })

  it('よくあるご質問を質問と答えの組で示す', () => {
    renderPage()
    const heading = screen.getByRole('heading', { name: 'よくあるご質問' })
    const list = document.getElementById(heading.id)?.nextElementSibling
    expect(list?.tagName).toBe('DL')
    expect([...(list?.querySelectorAll('dt') ?? [])].map((term) => term.textContent)).toEqual(
      CONTACT_FAQ.map((faq) => faq.question),
    )
    expect([...(list?.querySelectorAll('dd') ?? [])].map((detail) => detail.textContent)).toEqual(
      CONTACT_FAQ.map((faq) => faq.answer),
    )
  })

  it('お問い合わせフォームを置く', () => {
    renderPage()
    expect(screen.getByRole('form', { name: 'お問い合わせフォーム' })).toBeInTheDocument()
  })

  it('ページ名を title に使う', () => {
    expect(meta()).toContainEqual({ title: 'CONTACT・お問い合わせ｜ウィルフロンティア' })
  })
})
