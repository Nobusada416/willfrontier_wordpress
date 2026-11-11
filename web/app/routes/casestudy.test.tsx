import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CASE_HERO_PHOTOS } from '~/content/cases'
import { fetchPublishedCaseStudies } from '~/lib/caseStudies'
import { testCaseStudy, testPhoto } from '~/test/caseStudies'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import CaseStudyPage, { meta } from './casestudy'

vi.mock('~/lib/caseStudies', () => ({ fetchPublishedCaseStudies: vi.fn() }))
const fetchMock = vi.mocked(fetchPublishedCaseStudies)

beforeEach(() => {
  stubMatchMedia()
  stubIntersectionObserver()
  fetchMock.mockReset()
  // 既定は読み込み中のまま
  fetchMock.mockReturnValue(new Promise(() => undefined))
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

const projects = () => screen.getByRole('region', { name: '主要施工事例' })

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

  it('読み込み中はスケルトンを出し、読み込み中であることを伝える', async () => {
    renderPage()
    const section = projects()
    expect(within(section).getByText('施工事例を読み込んでいます')).toBeInTheDocument()
    expect(section.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(section.querySelector('[data-skeleton]')).not.toBeNull()
    expect(within(section).queryByRole('article')).not.toBeInTheDocument()
    // 一覧はすべて読む
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(expect.objectContaining({ limit: undefined })),
    )
  })

  it('公開中の事例を表示順に CASE 01, 02… として描画し、各事例に写真を添える', async () => {
    fetchMock.mockResolvedValue([
      testCaseStudy('a', { description: '1 行目\n2 行目' }),
      testCaseStudy('b'),
    ])
    renderPage()
    const list = await within(projects()).findByRole('list', { name: '主要施工事例' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    const articles = within(list).getAllByRole('article')
    expect(articles).toHaveLength(2)

    const [first, second] = articles as [HTMLElement, HTMLElement]
    expect(within(first).getByText('CASE 01')).toBeInTheDocument()
    expect(within(second).getByText('CASE 02')).toBeInTheDocument()
    expect(within(first).getByRole('heading', { level: 3 })).toHaveTextContent('事例 a のタイトル')
    expect(within(first).getByText('産業廃棄物 / 金属類')).toBeInTheDocument()
    // 本文の改行を保つ
    const description = within(first).getByText(/1 行目/)
    expect(description.textContent).toBe('1 行目\n2 行目')
    expect(description).toHaveClass('whitespace-pre-line')

    const images = first.querySelectorAll('img')
    expect(images).toHaveLength(4)
    expect(images[0]).toHaveAttribute(
      'src',
      'https://firebasestorage.googleapis.com/a-0-large.webp',
    )
    expect(images[0]).toHaveAttribute('width', '1600')
    expect(projects().querySelector('[aria-busy="true"]')).toBeNull()
  })

  it('写真の説明が空なら、タイトルと何枚目かで補う', async () => {
    fetchMock.mockResolvedValue([
      testCaseStudy('a', { photos: [testPhoto('a', 0, '解体前の工場'), testPhoto('a', 1)] }),
    ])
    renderPage()
    const article = await within(projects()).findByRole('article')
    expect(within(article).getByRole('img', { name: '解体前の工場' })).toBeInTheDocument()
    expect(
      within(article).getByRole('img', { name: '事例 a のタイトルの写真（2 枚目）' }),
    ).toBeInTheDocument()
  })

  it.each([1, 2, 3, 4])('写真が %i 枚でも、すべて表示する', async (count) => {
    fetchMock.mockResolvedValue([
      testCaseStudy('a', {
        photos: Array.from({ length: count }, (_, index) => testPhoto('a', index)),
      }),
    ])
    renderPage()
    const article = await within(projects()).findByRole('article')
    expect(article.querySelectorAll('img')).toHaveLength(count)
  })

  it('0 件なら準備中の案内を出す', async () => {
    fetchMock.mockResolvedValue([])
    renderPage()
    expect(
      await within(projects()).findByText(
        '施工事例は準備中です。お問い合わせからお気軽にご相談ください。',
      ),
    ).toBeInTheDocument()
    expect(within(projects()).queryByRole('list')).not.toBeInTheDocument()
  })

  it('失敗したら案内と「再読み込み」を出し、押すと読み込み直す', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network'))
    renderPage()
    expect(
      await within(projects()).findByText(
        '施工事例を読み込めませんでした。時間をおいて再度お試しください。',
      ),
    ).toBeInTheDocument()

    fetchMock.mockResolvedValueOnce([testCaseStudy('a')])
    await userEvent.click(within(projects()).getByRole('button', { name: '再読み込み' }))

    expect(await within(projects()).findByRole('article')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(within(projects()).queryByRole('button', { name: '再読み込み' })).toBeNull()
  })

  it('再読み込みを押した後も、フォーカスは事例の一覧の場所に残る', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network'))
    renderPage()
    const button = await within(projects()).findByRole('button', { name: '再読み込み' })
    await userEvent.click(button)
    await waitFor(() => expect(document.activeElement).not.toBe(document.body))
    expect(projects().contains(document.activeElement)).toBe(true)
  })

  it('お問い合わせへ誘導する', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { level: 2, name: 'あなたの現場、ご相談ください。' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'お問い合わせ' })).toHaveAttribute('href', '/contact/')
  })

  it('ページ名を title に使う', () => {
    expect(meta()).toContainEqual({ title: '施工事例｜ウィルフロンティア' })
  })
})
