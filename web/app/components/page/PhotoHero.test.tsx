import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { stubMatchMedia } from '~/test/matchMedia'
import { PhotoHero } from './PhotoHero'

beforeEach(() => {
  stubMatchMedia()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('PhotoHero', () => {
  it('ページの見出し（h1）と副題を、写真と暗い幕の上に表示する', () => {
    render(
      <PhotoHero background={<div data-testid="background" />} title="VEHICLES" subtitle="副題" />,
    )
    const heading = screen.getByRole('heading', { level: 1, name: 'VEHICLES' })
    expect(screen.getByText('副題')).toBeInTheDocument()
    expect(screen.getByTestId('background')).toBeInTheDocument()

    const section = heading.closest('section')
    expect(section).toHaveClass('isolate')
    const overlay = section?.querySelector('.bg-black\\/55')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    // 文字の枠は幕より手前
    expect(heading.closest('.z-30')).not.toBeNull()
  })
})
