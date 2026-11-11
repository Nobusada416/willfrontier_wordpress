import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createFakeAdminApi, type FakeAdminApi } from '~/test/fakeAdminApi'
import { AdminApiContext } from './api'
import { LoginScreen } from './LoginScreen'

const renderLogin = (api: FakeAdminApi, notice?: string) =>
  render(
    <AdminApiContext.Provider value={api}>
      <LoginScreen notice={notice} />
    </AdminApiContext.Provider>,
  )

describe('ログイン画面', () => {
  it('タイトルは「ウィルフロンティア」「ホームページ管理画面」の 2 行', () => {
    renderLogin(createFakeAdminApi())
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('ウィルフロンティアホームページ管理画面')
    expect(heading.querySelector('br')).not.toBeNull()
  })

  it('メールアドレスとパスワードで入る。新規登録・パスワード再設定のリンクは置かない', () => {
    renderLogin(createFakeAdminApi())
    expect(screen.getByLabelText('メールアドレス')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('パスワード')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.queryAllByRole('link')).toEqual([])
    expect(screen.getByText('アカウントの追加は制作担当にご連絡ください。')).toBeInTheDocument()
  })

  it('未入力なら項目の下にエラーを出し、ログインしない', async () => {
    const api = createFakeAdminApi()
    renderLogin(api)
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(screen.getByLabelText('メールアドレス')).toHaveAccessibleDescription(
      'メールアドレスを入力してください',
    )
    expect(screen.getByLabelText('パスワード')).toHaveAccessibleDescription(
      'パスワードを入力してください',
    )
    expect(screen.getByLabelText('メールアドレス')).toHaveAttribute('aria-invalid', 'true')
    expect(api.signIn).not.toHaveBeenCalled()
  })

  it('入力したメールアドレス（前後の空白を除く）とパスワードでログインする', async () => {
    const api = createFakeAdminApi()
    renderLogin(api)
    await userEvent.type(screen.getByLabelText('メールアドレス'), ' soumu@example.com ')
    await userEvent.type(screen.getByLabelText('パスワード'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(api.signIn).toHaveBeenCalledWith('soumu@example.com', 'secret')
  })

  it('メールアドレスかパスワードが違えば、パスワードの下に赤字で出す', async () => {
    const api = createFakeAdminApi()
    api.signIn.mockResolvedValue({ ok: false, error: 'invalid-credentials' })
    renderLogin(api)
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'soumu@example.com')
    await userEvent.type(screen.getByLabelText('パスワード'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    const password = screen.getByLabelText('パスワード')
    expect(password).toHaveAccessibleDescription('メールアドレスかパスワードが違います。')
    expect(password).toHaveAttribute('aria-invalid', 'true')
  })

  it('管理者でないアカウントは「権限がありません」と出す', async () => {
    const api = createFakeAdminApi()
    api.signIn.mockResolvedValue({ ok: false, error: 'forbidden' })
    renderLogin(api)
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'staff@example.com')
    await userEvent.type(screen.getByLabelText('パスワード'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'このアカウントには管理画面を使う権限がありません。',
    )
  })

  it('外から渡されたお知らせ（権限なしでログアウトした等）を出す', () => {
    renderLogin(createFakeAdminApi(), '権限がありません。')
    expect(screen.getByRole('alert')).toHaveTextContent('権限がありません。')
  })
})
