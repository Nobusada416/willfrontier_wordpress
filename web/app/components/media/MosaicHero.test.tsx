import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MosaicHero } from './MosaicHero'

const SLUGS = ['wf-112', 'wf-114', 'wf-079', 'wf-086', 'wf-087', 'wf-092']

const tiles = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-tile]'))

describe('MosaicHero', () => {
  it('写真をタイル状に並べ、装飾として扱う', () => {
    const { container } = render(<MosaicHero slugs={SLUGS} columns={3} />)
    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveAttribute('aria-hidden', 'true')
    expect(root.style.gridTemplateColumns).toBe('repeat(3, 1fr)')
    expect(root.style.gridTemplateRows).toBe('repeat(2, 1fr)')
    expect(tiles(container)).toHaveLength(6)
  })

  it('タイルを 1 秒ずつずらして明滅させ、1 周は枚数ぶんの秒数', () => {
    const { container } = render(<MosaicHero slugs={SLUGS} columns={3} />)
    expect(tiles(container).map((tile) => tile.style.animationDelay)).toEqual([
      '0s',
      '1s',
      '2s',
      '3s',
      '4s',
      '5s',
    ])
    tiles(container).forEach((tile) => {
      expect(tile.style.animationDuration).toBe('6s')
      expect(tile).toHaveClass('motion-safe:animate-wf-tile-pulse')
    })
  })

  it('priority 指定時は先頭タイルだけ優先度を上げ、残りは即時読み込み', () => {
    const { container } = render(<MosaicHero slugs={SLUGS} columns={3} priority />)
    const images = container.querySelectorAll('img')
    expect(images[0]).toHaveAttribute('fetchpriority', 'high')
    expect(images[5]).toHaveAttribute('loading', 'eager')
    expect(images[5]).not.toHaveAttribute('fetchpriority')
  })
})
