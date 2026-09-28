import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { gsap, MOTION_OK_QUERY, useMotion } from '~/lib/motion/gsap'
import { REDUCED_MOTION_QUERY } from '~/lib/useReducedMotion'
import { stubMatchMedia } from '~/test/matchMedia'
import { FadeUp } from './FadeUp'
import { HeadingReveal } from './HeadingReveal'
import { Leaf } from './Leaf'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// 実際のブラウザと同じく、2 つのクエリの一方だけが一致する状態にする
const stubMotion = (reduced: boolean) =>
  stubMatchMedia({ [REDUCED_MOTION_QUERY]: reduced, [MOTION_OK_QUERY]: !reduced })

const revealTarget = (container: HTMLElement) => {
  const target = container.querySelector('[data-reveal]')
  if (!target) throw new Error('data-reveal の要素がありません')
  return target
}

describe('アニメーションの登録', () => {
  it.each([
    ['HeadingReveal', <HeadingReveal as="h2">見出し</HeadingReveal>],
    ['FadeUp', <FadeUp>本文</FadeUp>],
    ['FadeUp（ページ表示時）', <FadeUp trigger="load">本文</FadeUp>],
    ['Leaf', <Leaf side="left" position="bottom" />],
    ['Leaf（ページ表示時）', <Leaf side="right" position="top" trigger="load" />],
  ])('%s: 動きを減らす設定でなければ data-reveal の要素をアニメーションする', (_, element) => {
    stubMotion(false)
    const { container } = render(element)
    expect(gsap.getTweensOf(revealTarget(container))).toHaveLength(1)
  })

  it.each([
    ['HeadingReveal', <HeadingReveal as="h2">見出し</HeadingReveal>],
    ['FadeUp', <FadeUp>本文</FadeUp>],
    ['Leaf', <Leaf side="left" position="bottom" />],
  ])('%s: 動きを減らす設定ではアニメーションを登録しない', (_, element) => {
    stubMotion(true)
    const { container } = render(element)
    expect(gsap.getTweensOf(revealTarget(container))).toHaveLength(0)
  })
})

describe('useMotion', () => {
  function Broken() {
    const ref = { current: null as HTMLDivElement | null }
    useMotion(ref, () => {
      throw new Error('設定の失敗')
    })
    return (
      <div
        ref={(element) => {
          ref.current = element
        }}
        data-reveal
      >
        <span data-reveal>中身</span>
      </div>
    )
  }

  it('アニメーションの設定に失敗しても、要素を隠したままにしない', () => {
    stubMotion(false)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { container } = render(<Broken />)
    container.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
      expect(element.style.opacity).toBe('1')
    })
    expect(console.error).toHaveBeenCalled()
  })
})

describe('HeadingReveal', () => {
  it('指定した見出しレベルで描画し、文字はそのまま読み上げられる', () => {
    stubMatchMedia()
    render(
      <HeadingReveal as="h2" className="text-6xl">
        MISSION
      </HeadingReveal>,
    )
    const heading = screen.getByRole('heading', { level: 2, name: 'MISSION' })
    expect(heading).toHaveClass('text-6xl')
  })

  it('マスク用の要素を JSX で描画し、中身をスクロールで表示する対象にする', () => {
    stubMatchMedia()
    render(<HeadingReveal as="h3">SERVICE</HeadingReveal>)
    const heading = screen.getByRole('heading', { level: 3 })
    const mask = heading.firstElementChild
    expect(mask).toHaveClass('overflow-hidden')
    expect(mask?.firstElementChild).toHaveAttribute('data-reveal')
    expect(mask?.firstElementChild).toHaveTextContent('SERVICE')
  })
})

describe('FadeUp', () => {
  it('子要素をスクロールで表示する対象として包む', () => {
    stubMatchMedia()
    render(
      <FadeUp className="mb-4">
        <p>本文</p>
      </FadeUp>,
    )
    const wrapper = screen.getByText('本文').parentElement
    expect(wrapper).toHaveAttribute('data-reveal')
    expect(wrapper).toHaveClass('mb-4')
  })

  it('as で要素を変えられる', () => {
    stubMatchMedia()
    render(
      <FadeUp as="li">
        <span>項目</span>
      </FadeUp>,
    )
    expect(screen.getByText('項目').parentElement?.tagName).toBe('LI')
  })
})

describe('Leaf', () => {
  it('装飾として描画し、左右の画像を使い分ける', () => {
    stubMatchMedia()
    const { container } = render(
      <>
        <Leaf side="left" position="bottom" />
        <Leaf side="right" position="bottom" />
      </>,
    )
    const leaves = container.querySelectorAll('[aria-hidden="true"]')
    expect(leaves).toHaveLength(2)
    const images = container.querySelectorAll('img')
    expect(images[0]).toHaveAttribute('src', '/media/images/plant-bottom-left.png')
    expect(images[1]).toHaveAttribute('src', '/media/images/plant-bottom-right.png')
    images.forEach((img) => {
      expect(img).toHaveAttribute('alt', '')
      expect(img).toHaveAttribute('data-reveal')
    })
  })

  it('上側の葉は top の画像を使う', () => {
    stubMatchMedia()
    const { container } = render(<Leaf side="left" position="top" />)
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/media/images/plant-top-left.png',
    )
  })
})
