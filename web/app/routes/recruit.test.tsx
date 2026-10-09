import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  RECRUIT_APPLY_STEPS,
  RECRUIT_DAY_FLOW,
  RECRUIT_JOBS,
  RECRUIT_VIDEOS,
  RECRUIT_VOICES,
  RECRUIT_WORKPLACE_PHOTOS,
} from '~/content/recruit'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import RecruitPage, { meta } from './recruit'

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
      <RecruitPage />
    </MemoryRouter>,
  )

describe('採用ページ', () => {
  it('h1 はちょうど 1 つ', () => {
    renderPage()
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('RECRUIT')
  })

  it('各セクションは重なり順を閉じ込める', () => {
    renderPage()
    const sections = document.querySelectorAll('section')
    expect(sections.length).toBeGreaterThan(0)
    sections.forEach((section) => {
      expect(section).toHaveClass('isolate')
    })
  })

  it('募集職種を content から描画する', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 2, name: '【募集職種】' })).toBeInTheDocument()
    const list = screen.getByRole('list', { name: '【募集職種】' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(RECRUIT_JOBS.length)
    RECRUIT_JOBS.forEach((job, index) => {
      const item = items[index]
      if (!item) throw new Error(`${index} 番目の職種がありません`)
      expect(within(item).getByRole('heading', { level: 3 })).toHaveTextContent(job.title)
      expect(item).toHaveTextContent(job.salary)
      // アイコンは装飾として読み上げない
      expect(item.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('1 日の流れを順序付きの一覧で描画する', () => {
    renderPage()
    const list = screen.getByRole('list', { name: '1日の安全管理・業務の流れ' })
    expect(list.tagName).toBe('OL')
    const items = within(list).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(
      RECRUIT_DAY_FLOW.map((step) => expect.stringContaining(step.label) as string),
    )
  })

  it('従業員の声を content から描画する', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 2, name: '【従業員の声】' })).toBeInTheDocument()
    const list = screen.getByRole('list', { name: '【従業員の声】' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(RECRUIT_VOICES.length)
    RECRUIT_VOICES.forEach((voice, index) => {
      const item = items[index]
      if (!item) throw new Error(`${index} 番目の声がありません`)
      expect(item).toHaveTextContent(voice.name)
      expect(item).toHaveTextContent(voice.quote)
      expect(item.querySelector('img')).toHaveAttribute(
        'src',
        `/media/photos/large/${voice.photo}.webp`,
      )
    })
  })

  it('作業員の声は副工場長としてのコメントを載せる', () => {
    renderPage()
    const list = screen.getByRole('list', { name: '【従業員の声】' })
    const worker = within(list).getAllByRole('listitem')[1]
    expect(worker).toHaveTextContent('S さん（入社 10年目）')
    expect(worker).toHaveTextContent('職種：作業員（副工場長）')
    expect(worker).toHaveTextContent('「諸先輩方に教えてもらってステップアップができる会社です。」')
  })

  it('応募の流れを順序付きの一覧で描画する', () => {
    renderPage()
    const list = screen.getByRole('list', { name: '応募の流れ' })
    expect(list.tagName).toBe('OL')
    const items = within(list).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(
      RECRUIT_APPLY_STEPS.map((step) => expect.stringContaining(step) as string),
    )
  })

  it('ある日の動画は 1 本ずつ区別して一時停止できる', () => {
    renderPage()
    const section = screen.getByRole('region', { name: '仲間たちの、ある日。' })
    const buttons = within(section).getAllByRole('button', { name: /を一時停止$/ })
    expect(buttons).toHaveLength(RECRUIT_VIDEOS.length)
    expect(new Set(buttons.map((button) => button.textContent)).size).toBe(RECRUIT_VIDEOS.length)
  })

  it('職場環境の写真一覧を表示する', () => {
    renderPage()
    const section = screen.getByRole('region', { name: '職場環境' })
    const list = within(section).getByRole('list', { name: '職場環境の写真' })
    const images = within(list)
      .getAllByRole('listitem')
      .map((item) => item.querySelector('img')?.getAttribute('src'))
    expect(images).toEqual(
      RECRUIT_WORKPLACE_PHOTOS.map((slug) => `/media/photos/large/${slug}.webp`),
    )
  })

  it('旧ページと同じく末尾のお問い合わせ誘導は置かない', () => {
    renderPage()
    expect(screen.queryByRole('link', { name: 'お問い合わせ' })).not.toBeInTheDocument()
  })

  it('ページ下部に応募フォームを置く', () => {
    renderPage()
    expect(screen.getByRole('form', { name: 'メールフォームからのご応募' })).toBeInTheDocument()
  })

  it('ページ名を title に使う', () => {
    expect(meta()).toContainEqual({ title: 'RECRUIT・採用情報｜ウィルフロンティア' })
  })
})
