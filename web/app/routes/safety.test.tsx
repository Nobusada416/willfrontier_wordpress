import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { INQUIRY_STEPS, SAFETY_FAQS, SAFETY_GALLERY, SAFETY_PRACTICES } from '~/content/safety'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import SafetyPage, { meta } from './safety'

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
      <SafetyPage />
    </MemoryRouter>,
  )

describe('安全ページ', () => {
  it('h1 はちょうど 1 つ', () => {
    renderPage()
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('SAFETY・安全への取り組み')
  })

  it('各セクションは重なり順を閉じ込める', () => {
    renderPage()
    const sections = document.querySelectorAll('section')
    expect(sections.length).toBeGreaterThan(0)
    sections.forEach((section) => {
      expect(section).toHaveClass('isolate')
    })
  })

  it('安全の取り組みを写真と文で content から描画する', () => {
    renderPage()
    const list = screen.getByRole('list', { name: '安全の取り組み' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(SAFETY_PRACTICES.length)
    SAFETY_PRACTICES.forEach((practice, index) => {
      const item = items[index]
      if (!item) throw new Error(`${index} 番目の取り組みがありません`)
      expect(item).toHaveTextContent(practice.title)
      expect(item).toHaveTextContent(practice.text)
      expect(item.querySelector('img')).toHaveAttribute(
        'src',
        `/media/photos/large/${practice.photo}.webp`,
      )
    })
  })

  it('背景動画は一時停止できる', () => {
    renderPage()
    const section = screen.getByRole('region', { name: '毎日の積み重ねが、現場を守る。' })
    expect(within(section).getByRole('button', { name: '動画を一時停止' })).toBeInTheDocument()
  })

  it('装備・点検ギャラリーの写真一覧を表示する', () => {
    renderPage()
    expect(screen.getByRole('region', { name: '装備・点検ギャラリー' })).toBeInTheDocument()
    const list = screen.getByRole('list', { name: '装備・点検ギャラリーの写真' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(SAFETY_GALLERY.length)
  })

  it('お問い合わせ後の流れを順番付きの一覧で表示する', () => {
    const { container } = renderPage()
    const section = screen.getByRole('region', { name: 'はじめてのお問い合わせも安心です。' })
    const list = within(section).getByRole('list', { name: 'お問い合わせ後の流れ' })
    expect(list.tagName).toBe('OL')
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(INQUIRY_STEPS.length)
    INQUIRY_STEPS.forEach((step, index) => {
      expect(items[index]).toHaveTextContent(step.label)
      expect(items[index]).toHaveTextContent(step.note)
    })
    // アイコンと矢印は装飾として読み上げない
    list.querySelectorAll('svg, img').forEach((icon) => {
      expect(icon.closest('[aria-hidden="true"]') ?? icon).toHaveAttribute('aria-hidden', 'true')
    })
    expect(container.querySelector('[data-step-arrow]')).not.toBeNull()
  })

  it('よくあるご質問を質問と回答の組で表示する', () => {
    renderPage()
    const section = screen.getByRole('region', { name: 'はじめてのお問い合わせも安心です。' })
    const terms = within(section).getAllByRole('term')
    const definitions = within(section).getAllByRole('definition')
    expect(terms.map((term) => term.textContent)).toEqual(SAFETY_FAQS.map((faq) => faq.question))
    expect(definitions).toHaveLength(SAFETY_FAQS.length)
    SAFETY_FAQS.forEach((faq, index) => {
      expect(definitions[index]).toHaveTextContent(faq.answer)
    })
  })

  it('フォームの枠見出しと末尾のお問い合わせ誘導は置かない（フォーム側で作る）', () => {
    renderPage()
    expect(screen.queryByText('メールフォームからのお問い合わせ')).toBeNull()
    expect(screen.queryByRole('link', { name: 'お問い合わせ' })).toBeNull()
  })

  it('ページ名を title に使う', () => {
    expect(meta()).toContainEqual({ title: 'SAFETY・安全への取り組み｜ウィルフロンティア' })
  })
})
