import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormFrame } from './FormFrame'

describe('FormFrame', () => {
  it('見出しを legend にして項目のまとまりに名前を付け、id で参照できるようにする', () => {
    render(
      <FormFrame titleId="frame-title" title="メールフォームからのご応募">
        <input aria-label="お名前" />
      </FormFrame>,
    )
    expect(screen.getByRole('group', { name: 'メールフォームからのご応募' })).toBeInTheDocument()
    expect(document.getElementById('frame-title')?.tagName).toBe('LEGEND')
  })
})
