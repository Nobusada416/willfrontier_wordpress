import { render, screen } from '@testing-library/react'
import { HONEYPOT_FIELD } from '@wf/shared'
import { describe, expect, it, vi } from 'vitest'
import { Honeypot } from './Honeypot'

describe('Honeypot', () => {
  it('ボット対策の隠し項目は、支援技術からもキーボード操作からも外す', () => {
    render(
      <Honeypot
        registration={{ name: HONEYPOT_FIELD, onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() }}
      />,
    )
    // 読み上げ対象から外れているため、role では見つからない
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    const input = document.querySelector(`input[name="${HONEYPOT_FIELD}"]`)
    expect(input).toHaveAttribute('tabindex', '-1')
    expect(input).toHaveAttribute('autocomplete', 'off')
    // aria-hidden の中にフォーカスできる要素を残さない
    expect(input?.closest('[aria-hidden="true"]')).toHaveAttribute('inert')
  })
})
