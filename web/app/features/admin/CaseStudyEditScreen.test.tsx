import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { createFakeAdminApi, makeCaseStudy, type FakeAdminApi } from '~/test/fakeAdminApi'
import { AdminApiContext } from './api'
import { CaseStudyEditScreen, CaseStudyNewScreen } from './CaseStudyEditScreen'

const renderAt = (api: FakeAdminApi, url: string, element: React.ReactNode) => {
  const router = createMemoryRouter(
    [
      {
        path: new URL(url, 'http://localhost').pathname,
        element: <AdminApiContext.Provider value={api}>{element}</AdminApiContext.Provider>,
      },
    ],
    { initialEntries: [url] },
  )
  render(<RouterProvider router={router} />)
}

describe('編集画面（?id= で事例を開く）', () => {
  it('ID の事例を読み込んで編集画面を出す', async () => {
    const api = createFakeAdminApi([makeCaseStudy({ id: 'factory', title: '工場の定期回収' })])
    renderAt(api, '/admin/case-studies/edit/?id=factory', <CaseStudyEditScreen />)

    expect(await screen.findByLabelText(/^タイトル/)).toHaveValue('工場の定期回収')
    expect(api.getCaseStudy).toHaveBeenCalledWith('factory')
  })

  it('事例が無ければ案内と一覧へのリンクを出す', async () => {
    renderAt(createFakeAdminApi(), '/admin/case-studies/edit/?id=missing', <CaseStudyEditScreen />)
    expect(
      await screen.findByRole('heading', { level: 1, name: '施工事例が見つかりません' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '一覧に戻る' })).toHaveAttribute('href', '/admin/')
  })

  it('ID が無い・形が正しくなければ読み込まずに案内を出す', async () => {
    const api = createFakeAdminApi()
    renderAt(api, '/admin/case-studies/edit/?id=../x', <CaseStudyEditScreen />)
    expect(await screen.findByText('施工事例が見つかりません')).toBeInTheDocument()
    expect(api.getCaseStudy).not.toHaveBeenCalled()
  })

  it('読み込みに失敗したらエラーを出す', async () => {
    const api = createFakeAdminApi()
    api.getCaseStudy.mockRejectedValue(new Error('unavailable'))
    renderAt(api, '/admin/case-studies/edit/?id=factory', <CaseStudyEditScreen />)
    expect(await screen.findByRole('alert')).toHaveTextContent('読み込めませんでした')
  })
})

describe('新規作成の画面', () => {
  it('新しい ID を決めてから編集画面を出す（写真のアップロード先に使う）', async () => {
    const api = createFakeAdminApi()
    renderAt(api, '/admin/case-studies/new/', <CaseStudyNewScreen />)
    expect(
      await screen.findByRole('heading', { level: 1, name: '施工事例の新規作成' }),
    ).toBeInTheDocument()
    expect(api.newCaseStudyId).toHaveBeenCalledTimes(1)
  })
})
