import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HONEYPOT_FIELD } from '@wf/shared'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { submitInquiry } from '~/lib/submitInquiry'
import { SafetyForm } from './SafetyForm'

vi.mock('~/lib/submitInquiry', () => ({
  submitInquiry: vi.fn(),
  prepareSubmitInquiry: vi.fn(),
}))

const submitMock = vi.mocked(submitInquiry)

beforeEach(() => {
  submitMock.mockResolvedValue({ status: 'ok' })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('SafetyForm', () => {
  it('枠の見出しをフォームの名前にする', () => {
    render(<SafetyForm />)
    expect(
      screen.getByRole('form', { name: 'メールフォームからのお問い合わせ' }),
    ).toBeInTheDocument()
  })

  it('旧フォームと同じ 6 項目を持ち、担当者名と電話番号だけを必須にする', () => {
    render(<SafetyForm />)
    const required = [/担当者名/, /電話番号/]
    const optional = ['フリガナ', '会社名', 'メールアドレス', '問い合わせ内容']
    required.forEach((name) => expect(screen.getByRole('textbox', { name })).toBeRequired())
    optional.forEach((name) => expect(screen.getByRole('textbox', { name })).not.toBeRequired())
  })

  it('メールアドレスは入力された場合だけ形式を確かめる', async () => {
    const user = userEvent.setup()
    render(<SafetyForm />)
    await user.type(screen.getByRole('textbox', { name: /担当者名/ }), '田中 太郎')
    await user.type(screen.getByRole('textbox', { name: /電話番号/ }), '045-123-4567')
    await user.type(screen.getByRole('textbox', { name: 'メールアドレス' }), 'taro@')
    await user.click(screen.getByRole('button', { name: /送信する/ }))

    expect(screen.getByRole('textbox', { name: 'メールアドレス' })).toHaveAccessibleDescription(
      'メールアドレスを正しく入力してください',
    )
    expect(submitMock).not.toHaveBeenCalled()
  })

  it('formType を safety にして送信し、完了のダイアログを出す', async () => {
    const user = userEvent.setup()
    render(<SafetyForm />)
    await user.type(screen.getByRole('textbox', { name: /担当者名/ }), '田中 太郎')
    await user.type(screen.getByRole('textbox', { name: /電話番号/ }), '045-123-4567')
    await user.click(screen.getByRole('button', { name: /送信する/ }))

    expect(submitMock).toHaveBeenCalledWith({
      formType: 'safety',
      name: '田中 太郎',
      kana: '',
      company: '',
      tel: '045-123-4567',
      email: '',
      message: '',
      [HONEYPOT_FIELD]: '',
    })
    expect(await screen.findByRole('dialog', { name: '送信完了' })).toBeInTheDocument()
  })

  it('見積無料・秘密厳守を添える', () => {
    render(<SafetyForm />)
    expect(screen.getByText('見積無料')).toBeInTheDocument()
    expect(screen.getByText('秘密厳守')).toBeInTheDocument()
  })
})
