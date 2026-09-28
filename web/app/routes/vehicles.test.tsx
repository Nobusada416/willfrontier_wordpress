import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { VEHICLE_GALLERY, VEHICLE_HERO_PHOTOS, VEHICLE_LINEUP } from '~/content/vehicles'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import VehiclesPage, { meta } from './vehicles'

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
      <VehiclesPage />
    </MemoryRouter>,
  )

describe('車両ページ', () => {
  it('h1 はちょうど 1 つ', () => {
    renderPage()
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('VEHICLES')
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
      VEHICLE_HERO_PHOTOS.map((slug) => `/media/photos/large/${slug}.webp`),
    )
    expect(frames[0]).toHaveAttribute('fetchpriority', 'high')
  })

  it('主要車両を content から描画する', () => {
    renderPage()
    const section = screen.getByRole('region', { name: '主要車両' })
    expect(
      within(section)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(VEHICLE_LINEUP.map((vehicle) => vehicle.name))
  })

  it('背景動画は一時停止できる', () => {
    renderPage()
    const section = screen.getByRole('region', { name: '現場を動かす、その姿。' })
    expect(within(section).getByRole('button', { name: '動画を一時停止' })).toBeInTheDocument()
  })

  it('車両ギャラリーの写真一覧を表示する', () => {
    renderPage()
    const list = screen.getByRole('list', { name: '車両ギャラリーの写真' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(VEHICLE_GALLERY.length)
  })

  it('お問い合わせへ誘導する', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { level: 2, name: '車両配車のご相談はこちら' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'お問い合わせ' })).toHaveAttribute('href', '/contact/')
  })

  it('ページ名を title に使う', () => {
    expect(meta()).toContainEqual({ title: 'VEHICLES・保有車両｜ウィルフロンティア' })
  })
})
