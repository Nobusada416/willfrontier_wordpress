import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TextField } from './TextField'

// react-hook-form の register() の戻り値の代わり
const registration = (name: string) => ({
  name,
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
})

describe('TextField', () => {
  it('ラベルと入力欄を結び付ける', () => {
    render(<TextField label="会社名" registration={registration('company')} />)
    expect(screen.getByRole('textbox', { name: '会社名' })).toHaveAttribute('name', 'company')
  })

  it('必須の項目は「必須」を表示し、支援技術にも必須と伝える', () => {
    render(<TextField label="担当者名" required registration={registration('name')} />)
    const input = screen.getByRole('textbox', { name: /担当者名/ })
    expect(input).toBeRequired()
    expect(screen.getByText('必須')).toBeInTheDocument()
  })

  it('エラーがあれば入力欄を invalid にし、エラー文を説明として結び付ける', () => {
    render(
      <TextField
        label="電話番号"
        type="tel"
        registration={registration('tel')}
        error="電話番号を入力してください"
      />,
    )
    const input = screen.getByRole('textbox', { name: '電話番号' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('電話番号を入力してください')
  })

  it('エラーが無ければ invalid にしない', () => {
    render(<TextField label="電話番号" type="tel" registration={registration('tel')} />)
    expect(screen.getByRole('textbox', { name: '電話番号' })).toHaveAttribute(
      'aria-invalid',
      'false',
    )
  })

  it('補足の説明も入力欄の説明として読み上げる', () => {
    render(
      <TextField
        label="メールアドレス"
        type="email"
        registration={registration('email')}
        description="確認のため、もう一度ご入力ください。"
      />,
    )
    expect(screen.getByRole('textbox', { name: 'メールアドレス' })).toHaveAccessibleDescription(
      '確認のため、もう一度ご入力ください。',
    )
  })

  it('multiline なら複数行の入力欄にする', () => {
    render(<TextField label="内容" multiline rows={4} registration={registration('message')} />)
    const textarea = screen.getByRole('textbox', { name: '内容' })
    expect(textarea.tagName).toBe('TEXTAREA')
    expect(textarea).toHaveAttribute('rows', '4')
  })

  it('入力の種類と自動入力の種類を入力欄に付ける', () => {
    render(
      <TextField
        label="メールアドレス"
        type="email"
        autoComplete="email"
        registration={registration('email')}
      />,
    )
    const input = screen.getByRole('textbox', { name: 'メールアドレス' })
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('autocomplete', 'email')
  })
})
