import { render, screen, waitFor } from '@testing-library/react'
import { HONEYPOT_FIELD } from '@wf/shared'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { prepareSubmitInquiry, submitInquiry, type SubmitResult } from '~/lib/submitInquiry'
import { ContactForm } from './ContactForm'

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

const fillValid = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByRole('textbox', { name: '会社名' }), '株式会社テスト')
  await user.type(screen.getByRole('textbox', { name: /担当者名/ }), '田中 太郎')
  await user.type(screen.getByRole('textbox', { name: /電話番号/ }), '０４５ー１２３ー４５６７')
  await user.type(screen.getByRole('textbox', { name: /内容/ }), '見積もりをお願いします。')
}

describe('ContactForm', () => {
  it('旧フォームと同じ 4 項目を持ち、担当者名・電話番号・内容を必須にする', () => {
    render(<ContactForm />)
    expect(screen.getByRole('textbox', { name: '会社名' })).not.toBeRequired()
    for (const name of [/担当者名/, /電話番号/, /内容/]) {
      expect(screen.getByRole('textbox', { name })).toBeRequired()
    }
  })

  it('未入力で送信すると項目ごとにエラーを出し、最初の項目へフォーカスを移して送らない', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.click(screen.getByRole('button', { name: /送信する/ }))

    const name = screen.getByRole('textbox', { name: /担当者名/ })
    expect(name).toHaveAccessibleDescription('担当者名を入力してください')
    expect(screen.getByRole('textbox', { name: /電話番号/ })).toHaveAccessibleDescription(
      '電話番号を入力してください',
    )
    expect(name).toHaveFocus()
    expect(submitMock).not.toHaveBeenCalled()
  })

  it('入力を正規化して送信し、完了のダイアログを出して入力欄を空にする', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: /送信する/ }))

    expect(submitMock).toHaveBeenCalledWith({
      formType: 'contact',
      company: '株式会社テスト',
      name: '田中 太郎',
      tel: '045-123-4567',
      message: '見積もりをお願いします。',
      [HONEYPOT_FIELD]: '',
    })
    expect(await screen.findByRole('dialog', { name: '送信完了' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /担当者名/ })).toHaveValue('')
  })

  it('送信中はボタンを押せなくし、二重に送らない', async () => {
    let finish: (result: SubmitResult) => void = () => undefined
    submitMock.mockReturnValue(new Promise((resolve) => (finish = resolve)))
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: /送信する/ }))

    const button = screen.getByRole('button', { name: /送信中/ })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(submitMock).toHaveBeenCalledTimes(1)

    finish({ status: 'ok' })
    await waitFor(() => expect(screen.getByRole('button', { name: /送信する/ })).toBeEnabled())
  })

  it('送信処理の入力チェックで弾かれたら、その項目にエラーを出す', async () => {
    submitMock.mockResolvedValue({
      status: 'invalid',
      fieldErrors: { tel: '電話番号を正しく入力してください' },
    })
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: /送信する/ }))

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /電話番号/ })).toHaveAccessibleDescription(
        '電話番号を正しく入力してください',
      ),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('送信に失敗したら入力を残したまま、電話での連絡先を含む案内を出す', async () => {
    submitMock.mockResolvedValue({ status: 'error' })
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillValid(user)
    await user.click(screen.getByRole('button', { name: /送信する/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('送信に失敗しました')
    expect(screen.getByRole('textbox', { name: /担当者名/ })).toHaveValue('田中 太郎')
  })

  it('入力を始めたら送信の準備（Firebase の読み込み）を始める', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.click(screen.getByRole('textbox', { name: '会社名' }))
    expect(vi.mocked(prepareSubmitInquiry)).toHaveBeenCalled()
  })

  it('見積無料・秘密厳守を添える', () => {
    render(<ContactForm />)
    expect(screen.getByText('見積無料')).toBeInTheDocument()
    expect(screen.getByText('秘密厳守')).toBeInTheDocument()
  })
})
