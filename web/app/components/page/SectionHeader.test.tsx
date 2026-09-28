import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { stubMatchMedia } from '~/test/matchMedia'
import { SectionHeader } from './SectionHeader'

describe('SectionHeader', () => {
  it('英字の小見出し・見出し・説明文を表示し、見出しに id を付ける', () => {
    stubMatchMedia()
    render(
      <SectionHeader id="community-heading" eyebrow="WITH THE COMMUNITY" lead="説明文">
        地域と共に
      </SectionHeader>,
    )
    const heading = screen.getByRole('heading', { level: 2, name: '地域と共に' })
    expect(heading).toHaveAttribute('id', 'community-heading')
    expect(screen.getByText('WITH THE COMMUNITY')).toBeInTheDocument()
    expect(screen.getByText('説明文')).toBeInTheDocument()
  })

  it('写真・動画の上に置く場合（tone="white"）は見出しを白、英字を淡い水色にする', () => {
    stubMatchMedia()
    render(
      <SectionHeader id="motion-heading" eyebrow="IN MOTION" tone="white">
        現場を動かす、その姿。
      </SectionHeader>,
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-white')
    expect(screen.getByText('IN MOTION')).toHaveClass('text-wf-sky')
  })
})
