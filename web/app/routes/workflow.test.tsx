import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NETWORK_DESCRIPTION, PROCESS_STEPS } from '~/content/workflow'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import WorkflowPage, { meta } from './workflow'

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
      <WorkflowPage />
    </MemoryRouter>,
  )

describe('処理の流れページ', () => {
  it('h1 はちょうど 1 つで、処理ネットワークの見出しにする', () => {
    renderPage()
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('ウィルフロンティア 処理ネットワーク')
  })

  it('各セクションは重なり順を閉じ込める', () => {
    renderPage()
    document.querySelectorAll('section').forEach((section) => {
      expect(section).toHaveClass('isolate')
    })
  })

  it('処理ネットワークの図に、図の内容を文章にした説明を付ける', () => {
    renderPage()
    const image = screen.getByRole('img', { name: 'ウィルフロンティア 処理ネットワークの図' })
    expect(image).toHaveAttribute('src', '/media/images/network.svg')
    expect(image).toHaveAccessibleDescription(NETWORK_DESCRIPTION)
  })

  it('スマホで横にスクロールする図の枠は、キーボードでも操作できる', () => {
    renderPage()
    expect(screen.getByRole('region', { name: '処理ネットワークの図' })).toHaveAttribute(
      'tabindex',
      '0',
    )
  })

  it('処理の 5 ステップを順番付きの一覧で表示する', () => {
    renderPage()
    const list = screen.getByRole('list', { name: '処理の5ステップ' })
    expect(list.tagName).toBe('OL')
    expect(
      within(list)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(PROCESS_STEPS.map((step) => step.title))
  })

  it('お問い合わせへ誘導する', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { level: 2, name: '処理フローのご相談はこちら' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'お問い合わせ' })).toHaveAttribute('href', '/contact/')
  })

  it('ページ名を title に使う', () => {
    expect(meta()).toContainEqual({ title: 'WORKFLOW・処理の流れ｜ウィルフロンティア' })
  })
})
