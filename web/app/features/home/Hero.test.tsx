import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { gsap, MOTION_OK_QUERY } from '~/lib/motion/gsap'
import { markIntroDone, resetIntroForTest } from '~/lib/motion/intro'
import { REDUCED_MOTION_QUERY } from '~/lib/useReducedMotion'
import { stubMatchMedia } from '~/test/matchMedia'
import { Hero } from './Hero'

afterEach(() => {
  vi.unstubAllGlobals()
  resetIntroForTest()
})

const stubMotion = (reduced: boolean) =>
  stubMatchMedia({ [REDUCED_MOTION_QUERY]: reduced, [MOTION_OK_QUERY]: !reduced })

const renderHero = () =>
  render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>,
  )

const heroItems = () => Array.from(document.querySelectorAll('[data-hero-item]'))

describe('Hero', () => {
  it('ページの見出し（h1）とお問い合わせへのリンクを表示する', () => {
    stubMotion(false)
    renderHero()
    expect(
      screen.getByRole('heading', { level: 1, name: '都市インフラを支える、産業廃棄物テック。' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /CONTACT/ })).toHaveAttribute('href', '/contact/')
  })

  it('背景の写真 9 枚は装飾として扱い、1 枚目を優先して読み込む', () => {
    stubMotion(false)
    renderHero()
    const tiles = document.querySelectorAll('[data-tile] img')
    expect(tiles).toHaveLength(9)
    expect(tiles[0]).toHaveAttribute('fetchpriority', 'high')
  })

  it('左上の生成AI画像（wf-112）に合わせ、残り 8 枚は明るく加工した -hero 版を使う', () => {
    stubMotion(false)
    renderHero()
    const sources = Array.from(document.querySelectorAll('[data-tile] img'), (img) =>
      img.getAttribute('src'),
    )
    expect(sources[0]).toBe('/media/photos/large/wf-112.webp')
    sources
      .slice(1)
      .forEach((src) => expect(src).toMatch(/^\/media\/photos\/large\/wf-\d{3}-hero\.webp$/))
  })

  it('写真の上に黒の暗幕を重ねない（加工した写真の明るさをそのまま見せる）', () => {
    stubMotion(false)
    const { container } = renderHero()
    expect(container.querySelector('[class*="bg-black"]')).toBeNull()
  })

  it('イントロが終わってから文字を順に表示する', () => {
    stubMotion(false)
    renderHero()
    expect(heroItems().length).toBeGreaterThan(0)
    heroItems().forEach((item) => {
      expect(item).toHaveAttribute('data-reveal')
      expect(gsap.getTweensOf(item)).toHaveLength(0)
    })

    act(() => markIntroDone())
    heroItems().forEach((item) => expect(gsap.getTweensOf(item)).toHaveLength(1))
  })

  it('動きを減らす設定ではアニメーションしない', () => {
    stubMotion(true)
    renderHero()
    act(() => markIntroDone())
    heroItems().forEach((item) => expect(gsap.getTweensOf(item)).toHaveLength(0))
  })
})
