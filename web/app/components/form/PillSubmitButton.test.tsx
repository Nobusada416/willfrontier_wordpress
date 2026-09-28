import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PillSubmitButton } from './PillSubmitButton'

describe('PillSubmitButton', () => {
  it('送信ボタンとして表示し、矢印は読み上げない', () => {
    render(<PillSubmitButton label="応募する" submitting={false} />)
    const button = screen.getByRole('button', { name: '応募する' })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toBeEnabled()
  })

  it('送信中は「送信中…」にして押せなくする', () => {
    render(<PillSubmitButton label="応募する" submitting />)
    expect(screen.getByRole('button', { name: '送信中…' })).toBeDisabled()
  })
})
