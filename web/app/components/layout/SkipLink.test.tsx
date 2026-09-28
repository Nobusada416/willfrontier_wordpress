import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MAIN_CONTENT_ID, SkipLink } from './SkipLink'

describe('SkipLink', () => {
  it('本文（main）へのページ内リンクになっている', () => {
    render(<SkipLink />)
    expect(screen.getByRole('link', { name: '本文へスキップ' })).toHaveAttribute(
      'href',
      `#${MAIN_CONTENT_ID}`,
    )
  })
})
