import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { MoreLink } from './MoreLink'

const renderLink = (element: React.ReactElement) => render(<MemoryRouter>{element}</MemoryRouter>)

describe('MoreLink', () => {
  it('行き先の補足をリンク名に含め、矢印は読み上げない', () => {
    renderLink(
      <MoreLink to="/service/" context="SERVICE">
        もっと見る
      </MoreLink>,
    )
    const link = screen.getByRole('link', { name: 'もっと見る（SERVICE）' })
    expect(link).toHaveAttribute('href', '/service/')
    expect(link.querySelector('[aria-hidden="true"]')).toHaveTextContent('▼')
  })

  it('文字サイズを指定すると既定の文字サイズを付けない（同じ種類のクラスを並べて競合させない）', () => {
    renderLink(
      <MoreLink to="/safety/" textClassName="text-base sm:text-lg">
        もっと見る
      </MoreLink>,
    )
    const link = screen.getByRole('link')
    expect(link).toHaveClass('text-base', 'sm:text-lg')
    expect(link).not.toHaveClass('text-xl')
  })

  it('既定の文字サイズは種類ごとに決まる', () => {
    renderLink(
      <MoreLink to="/recruit/" variant="block">
        応募する
      </MoreLink>,
    )
    expect(screen.getByRole('link')).toHaveClass('text-2xl')
  })
})
