import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CrossfadeHero } from './CrossfadeHero'

const SLUGS = ['wf-097', 'wf-007', 'wf-042'] as const

const renderHero = (props: Partial<Parameters<typeof CrossfadeHero>[0]> = {}) =>
  render(<CrossfadeHero slugs={SLUGS} {...props} />)

const frames = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-frame]'))

describe('CrossfadeHero', () => {
  it('3 枚の写真を装飾として重ねて描画する', () => {
    const { container } = renderHero()
    const root = container.firstElementChild
    expect(root).toHaveAttribute('aria-hidden', 'true')
    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(3)
    images.forEach((img) => expect(img).toHaveAttribute('alt', ''))
    expect(images[0]).toHaveAttribute('src', '/media/photos/large/wf-097.webp')
  })

  it('各フレームを 1 枚分ずつずらした遅延で同じアニメーションを再生する', () => {
    const { container } = renderHero()
    expect(frames(container).map((frame) => frame.style.animationDelay)).toEqual([
      '-1s',
      '-9s',
      '-5s',
    ])
    frames(container).forEach((frame) =>
      expect(frame).toHaveClass('motion-safe:animate-wf-crossfade'),
    )
  })

  it('動きを減らす設定ではアニメーションせず 1 枚目だけを見せる', () => {
    // motion-safe: のため設定時はアニメーションが付かず、2 枚目以降は opacity-0 のまま
    const { container } = renderHero()
    const [first, ...rest] = frames(container)
    expect(first).not.toHaveClass('opacity-0')
    rest.forEach((frame) => expect(frame).toHaveClass('opacity-0'))
  })

  it('priority 指定時は 1 枚目だけ優先度を上げ、残りは即時読み込みにする', () => {
    const { container } = renderHero({ priority: true })
    const images = container.querySelectorAll('img')
    expect(images[0]).toHaveAttribute('fetchpriority', 'high')
    expect(images[1]).toHaveAttribute('loading', 'eager')
    expect(images[1]).not.toHaveAttribute('fetchpriority')
  })

  it('priority 無しでは遅延読み込み', () => {
    const { container } = renderHero()
    container
      .querySelectorAll('img')
      .forEach((img) => expect(img).toHaveAttribute('loading', 'lazy'))
  })

  it('imageClassName を写真に付ける', () => {
    const { container } = renderHero({ imageClassName: 'opacity-40' })
    container.querySelectorAll('img').forEach((img) => expect(img).toHaveClass('opacity-40'))
  })
})
