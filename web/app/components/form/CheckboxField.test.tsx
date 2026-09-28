import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CheckboxField } from './CheckboxField'

const registration = { name: 'privacyConsent', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() }

describe('CheckboxField', () => {
  it('ラベルと結び付け、必須なら「必須」を表示して支援技術にも伝える', () => {
    render(<CheckboxField label="同意する" required registration={registration} />)
    const checkbox = screen.getByRole('checkbox', { name: /同意する/ })
    expect(checkbox).toBeRequired()
    expect(screen.getByText('必須')).toBeInTheDocument()
  })

  it('説明とエラー文をチェックボックスの説明として読み上げさせる', () => {
    render(
      <CheckboxField
        label="同意する"
        registration={registration}
        description="採用選考にのみ利用します。"
        error="同意してください"
      />,
    )
    const checkbox = screen.getByRole('checkbox', { name: '同意する' })
    expect(checkbox).toHaveAttribute('aria-invalid', 'true')
    expect(checkbox).toHaveAccessibleDescription('採用選考にのみ利用します。 同意してください')
  })
})
