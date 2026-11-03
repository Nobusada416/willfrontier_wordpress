import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { createFakeAdminApi, type FakeAdminApi } from '~/test/fakeAdminApi'
import type { AdminApi } from './api'
import { AdminShell } from './AdminShell'

const renderShell = (loadApi: () => Promise<AdminApi>, path = '/admin/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AdminShell loadApi={loadApi}>
        <p>管理画面の中身</p>
      </AdminShell>
    </MemoryRouter>,
  )

const loaded = async (api: FakeAdminApi, path?: string) => {
  renderShell(async () => api, path)
  // 読み込みが終わり、ログイン状態の監視が始まるのを待つ
  await waitFor(() => expect(api.onAuthChange).toHaveBeenCalled())
}

describe('管理画面の共通の枠（ログインの判定）', () => {
  it('ログイン状態が分かるまでは「読み込み中」', () => {
    renderShell(() => new Promise(() => undefined))
    expect(screen.getByRole('status')).toHaveTextContent('読み込み中')
    expect(screen.queryByText('管理画面の中身')).not.toBeInTheDocument()
  })

  it('ログインしていなければログイン画面を出す', async () => {
    const api = createFakeAdminApi()
    await loaded(api)
    act(() => api.emit({ type: 'signedOut' }))

    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.queryByText('管理画面の中身')).not.toBeInTheDocument()
  })

  it('管理者でログインしていれば、ヘッダー（タイトル・メールアドレス・ログアウト）と中身を出す', async () => {
    const api = createFakeAdminApi()
    await loaded(api)
    act(() => api.emit({ type: 'admin', user: { uid: 'u1', email: 'soumu@example.com' } }))

    expect(screen.getByText('管理画面の中身')).toBeInTheDocument()
    const banner = screen.getByRole('banner')
    expect(banner).toHaveTextContent('ウィルフロンティアホームページ管理画面')
    expect(banner).toHaveTextContent('soumu@example.com')

    await userEvent.click(screen.getByRole('button', { name: 'ログアウト' }))
    expect(api.signOut).toHaveBeenCalled()
  })

  it('編集画面のヘッダーにはログアウトを置かない（未保存の内容を失わないため）', async () => {
    const api = createFakeAdminApi()
    await loaded(api, '/admin/case-studies/edit/')
    act(() => api.emit({ type: 'admin', user: { uid: 'u1', email: 'soumu@example.com' } }))

    expect(screen.getByRole('banner')).toHaveTextContent('soumu@example.com')
    expect(screen.queryByRole('button', { name: 'ログアウト' })).not.toBeInTheDocument()
  })

  it('管理者でないアカウントは「権限がありません」と出してログイン画面に戻す', async () => {
    const api = createFakeAdminApi()
    await loaded(api)
    act(() => api.emit({ type: 'forbidden' }))
    // ログアウトの通知が続けて来ても、お知らせは消さない
    act(() => api.emit({ type: 'signedOut' }))

    expect(screen.getByRole('alert')).toHaveTextContent('権限がありません')
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.queryByText('管理画面の中身')).not.toBeInTheDocument()
  })

  it('Firebase を読み込めなければ案内を出す', async () => {
    renderShell(async () => {
      throw new Error('Firebase の設定がありません')
    })
    expect(await screen.findByRole('alert')).toHaveTextContent('管理画面を読み込めませんでした')
  })
})
