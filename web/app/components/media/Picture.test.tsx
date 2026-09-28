import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Picture } from './Picture'

describe('Picture', () => {
  it('small / large の webp を srcset に並べ、large を src にする', () => {
    render(<Picture slug="wf-079" alt="安全朝礼" />)
    const img = screen.getByRole('img', { name: '安全朝礼' })
    expect(img).toHaveAttribute('src', '/media/photos/large/wf-079.webp')
    expect(img).toHaveAttribute(
      'srcset',
      '/media/photos/small/wf-079.webp 768w, /media/photos/large/wf-079.webp 1600w',
    )
  })

  it('既定では遅延読み込みし、sizes は 100vw', () => {
    render(<Picture slug="wf-079" alt="安全朝礼" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(img).toHaveAttribute('sizes', '100vw')
    expect(img).not.toHaveAttribute('fetchpriority')
  })

  it('priority 指定時は即時読み込みし、優先度を上げる', () => {
    render(<Picture slug="wf-112" alt="" priority />)
    const img = document.querySelector('img')
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })

  it('loading="eager" だけ指定した場合は優先度を変えない', () => {
    render(<Picture slug="wf-112" alt="" loading="eager" />)
    const img = document.querySelector('img')
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).not.toHaveAttribute('fetchpriority')
  })

  it('alt 空の装飾画像は画像として読み上げない', () => {
    render(<Picture slug="wf-112" alt="" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(document.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('className と sizes を img に渡す', () => {
    render(<Picture slug="wf-079" alt="x" className="h-full w-full object-cover" sizes="50vw" />)
    const img = screen.getByRole('img')
    expect(img).toHaveClass('h-full', 'w-full', 'object-cover')
    expect(img).toHaveAttribute('sizes', '50vw')
  })
})
