import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HONEYPOT_FIELD } from '@wf/shared'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { submitInquiry } from '~/lib/submitInquiry'
import { RecruitForm } from './RecruitForm'

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

type User = ReturnType<typeof userEvent.setup>

const REQUIRED = [
  ['お名前', '田中 太郎'],
  ['フリガナ', 'タナカ タロウ'],
  ['ご住所', '神奈川県横浜市'],
  ['電話番号', '090-1234-5678'],
  ['メールアドレス', 'taro@example.jp'],
  ['メールアドレス（確認用）', 'taro@example.jp'],
  ['希望職種', '作業員'],
  ['最終学歴', '大学卒業'],
  ['備考', '平日の日中が連絡のつきやすい時間です。'],
] as const

// 名前は「ラベル」または「ラベル必須」（必須バッジの文字を含む）
const field = (label: string) =>
  screen.getByRole('textbox', { name: new RegExp(`^${label}(必須)?$`) })

const fillRequired = async (user: User) => {
  for (const [label, value] of REQUIRED) {
    await user.type(field(label), value)
  }
}

describe('RecruitForm', () => {
  it('枠の見出しをフォームの名前にする', () => {
    render(<RecruitForm />)
    expect(screen.getByRole('form', { name: 'メールフォームからのご応募' })).toBeInTheDocument()
  })

  it('旧フォームの必須項目を必須にし、学校名・卒業学部・卒業年月・職歴は任意にする', () => {
    render(<RecruitForm />)
    REQUIRED.forEach(([label]) => expect(field(label)).toBeRequired())
    ;['学校名', '卒業学部・学科', '卒業年月', '職歴'].forEach((label) =>
      expect(field(label)).not.toBeRequired(),
    )
  })

  it('確認用のメールアドレスが一致しなければ、確認欄にエラーを出して送らない', async () => {
    const user = userEvent.setup()
    render(<RecruitForm />)
    await fillRequired(user)
    await user.clear(field('メールアドレス（確認用）'))
    await user.type(field('メールアドレス（確認用）'), 'jiro@example.jp')
    await user.click(screen.getByRole('checkbox', { name: /同意する/ }))
    await user.click(screen.getByRole('button', { name: /応募する/ }))

    expect(field('メールアドレス（確認用）')).toHaveAccessibleDescription(
      expect.stringContaining('メールアドレスが一致しません'),
    )
    expect(submitMock).not.toHaveBeenCalled()
  })

  it('個人情報の取り扱いに同意しなければ送らない', async () => {
    const user = userEvent.setup()
    render(<RecruitForm />)
    await fillRequired(user)
    await user.click(screen.getByRole('button', { name: /応募する/ }))

    const consent = screen.getByRole('checkbox', { name: /同意する/ })
    expect(consent).toHaveAttribute('aria-invalid', 'true')
    expect(consent).toHaveAccessibleDescription(
      expect.stringContaining('個人情報の取り扱いに同意してください'),
    )
    expect(submitMock).not.toHaveBeenCalled()
  })

  it('formType を recruit にして送信し、応募完了のダイアログを出す', async () => {
    const user = userEvent.setup()
    render(<RecruitForm />)
    await fillRequired(user)
    await user.click(screen.getByRole('checkbox', { name: /同意する/ }))
    await user.click(screen.getByRole('button', { name: /応募する/ }))

    expect(submitMock).toHaveBeenCalledWith({
      formType: 'recruit',
      name: '田中 太郎',
      kana: 'タナカ タロウ',
      address: '神奈川県横浜市',
      tel: '090-1234-5678',
      email: 'taro@example.jp',
      emailConfirm: 'taro@example.jp',
      job: '作業員',
      education: '大学卒業',
      school: '',
      faculty: '',
      graduation: '',
      career: '',
      note: '平日の日中が連絡のつきやすい時間です。',
      privacyConsent: true,
      [HONEYPOT_FIELD]: '',
    })
    expect(await screen.findByRole('dialog', { name: '応募完了' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /同意する/ })).not.toBeChecked()
  })
})
