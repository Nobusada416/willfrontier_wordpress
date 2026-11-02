import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchPublishedCaseStudies } from '~/lib/caseStudies'
import { testCaseStudy } from '~/test/caseStudies'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import { CaseStudy } from './CaseStudy'

vi.mock('~/lib/caseStudies', () => ({ fetchPublishedCaseStudies: vi.fn() }))
const fetchMock = vi.mocked(fetchPublishedCaseStudies)

let observer: ReturnType<typeof stubIntersectionObserver>

beforeEach(() => {
  stubMatchMedia()
  observer = stubIntersectionObserver()
  fetchMock.mockReset()
  fetchMock.mockReturnValue(new Promise(() => undefined))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const renderSection = () =>
  render(
    <MemoryRouter>
      <CaseStudy />
    </MemoryRouter>,
  )

const section = () => screen.getByRole('region', { name: 'CASE STUDY' })
const target = () => {
  const element = section().querySelector('[data-case-studies]')
  if (!element) throw new Error('事例の一覧の枠がありません')
  return element
}

// 一覧の枠が画面に近づいたことを通知する
const approach = () => act(() => observer.trigger(target(), true))

describe('トップの CASE STUDY', () => {
  it('画面に近づくまでは読み込まず、スケルトンを出しておく', () => {
    renderSection()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(section().querySelector('[data-skeleton]')).not.toBeNull()
    expect(within(section()).getByText('施工事例を読み込んでいます')).toBeInTheDocument()
  })

  it('画面に近づいたら、公開中の新しい 4 件を読み込む（監視はやめる）', async () => {
    renderSection()
    await approach()
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith(expect.objectContaining({ limit: 4 }))
    expect(observer.count).toBe(0)
  })

  it('日付（YYYY.MM.DD）・社名・分類を並べ、各行は事例一覧へ移動する', async () => {
    fetchMock.mockResolvedValue([
      testCaseStudy('a', { date: '2026-10-05', company: '株式会社A', tag: '運用開始' }),
      testCaseStudy('b', { date: '2026-09-01', company: '株式会社B', tag: '構築' }),
    ])
    renderSection()
    await approach()

    const links = await within(section()).findAllByRole('link', { name: /株式会社/ })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveTextContent('2026.10.05')
    // 社名と分類の間は全角の空白（旧サイトと同じ）
    expect(links[0]?.textContent).toContain('株式会社A　運用開始')
    expect(links[1]).toHaveTextContent('2026.09.01')
    links.forEach((link) => expect(link).toHaveAttribute('href', '/casestudy/'))
    expect(section().querySelector('[data-skeleton]')).toBeNull()
  })

  it('0 件なら準備中の案内を出す（「もっと見る」は残す）', async () => {
    fetchMock.mockResolvedValue([])
    renderSection()
    await approach()
    expect(
      await within(section()).findByText(
        '施工事例は準備中です。お問い合わせからお気軽にご相談ください。',
      ),
    ).toBeInTheDocument()
    expect(within(section()).getByRole('link', { name: 'もっと見る（CASE STUDY）' })).toBeVisible()
  })

  it('失敗したら案内と「再読み込み」を出し、押すと読み込み直す', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network'))
    renderSection()
    await approach()
    expect(
      await within(section()).findByText(
        '施工事例を読み込めませんでした。時間をおいて再度お試しください。',
      ),
    ).toBeInTheDocument()

    fetchMock.mockResolvedValueOnce([testCaseStudy('a', { company: '株式会社A' })])
    await userEvent.click(within(section()).getByRole('button', { name: '再読み込み' }))
    expect(await within(section()).findByRole('link', { name: /株式会社A/ })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
