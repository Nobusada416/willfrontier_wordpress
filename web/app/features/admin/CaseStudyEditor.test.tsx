import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createFakeAdminApi,
  makeCaseStudy,
  makePhoto,
  type FakeAdminApi,
} from '~/test/fakeAdminApi'
import { AdminApiContext, type AdminCaseStudy } from './api'
import { CaseStudyEditor } from './CaseStudyEditor'
import type * as PhotosModule from './photos'
import { PhotoError, processPhotoFile } from './photos'

vi.mock('./photos', async (importOriginal) => ({
  ...(await importOriginal<typeof PhotosModule>()),
  processPhotoFile: vi.fn(),
}))

const processed = {
  width: 1600,
  height: 1200,
  files: {
    small: new Blob(['s'], { type: 'image/webp' }),
    large: new Blob(['l'], { type: 'image/webp' }),
  },
}

beforeEach(() => {
  vi.mocked(processPhotoFile).mockResolvedValue(processed)
})

afterEach(() => {
  vi.mocked(processPhotoFile).mockReset()
})

// 一覧（保存後の移動先）。渡された通知を表示する
function ListProbe() {
  const location = useLocation()
  const state = location.state as { notice?: string } | null
  return <p>一覧の画面 {state?.notice}</p>
}

const renderEditor = (
  api: FakeAdminApi,
  { initial = null, caseId = 'newCase' }: { initial?: AdminCaseStudy | null; caseId?: string } = {},
) => {
  const path = initial ? '/admin/case-studies/edit/' : '/admin/case-studies/new/'
  const router = createMemoryRouter(
    [
      {
        path,
        element: (
          <AdminApiContext.Provider value={api}>
            <CaseStudyEditor caseId={caseId} initial={initial} />
          </AdminApiContext.Provider>
        ),
      },
      { path: '/admin/', element: <ListProbe /> },
    ],
    { initialEntries: [path] },
  )
  render(<RouterProvider router={router} />)
  return router
}

const photoFile = (name = 'genba.jpg') => new File(['x'], name, { type: 'image/jpeg' })

const fillValidForm = async () => {
  fireEvent.change(screen.getByLabelText(/^日付/), { target: { value: '2026-08-12' } })
  await userEvent.type(screen.getByLabelText(/^分類/), '定期回収')
  await userEvent.type(screen.getByLabelText(/^社名/), '株式会社テスト')
  await userEvent.type(screen.getByLabelText(/^タイトル/), '工場の定期回収')
  await userEvent.type(screen.getByLabelText(/^工事の種類・内容/), '産業廃棄物 / 金属類')
  await userEvent.type(screen.getByLabelText(/^本文/), '1 行目{enter}2 行目')
  await userEvent.upload(screen.getByLabelText('写真を追加'), photoFile())
  await screen.findByLabelText('写真の説明（1 枚目）')
}

describe('施工事例の編集（新規作成）', () => {
  it('見出し・一覧に戻るリンク・基本情報の項目・写真・ボタン', () => {
    renderEditor(createFakeAdminApi())
    expect(
      screen.getByRole('heading', { level: 1, name: '施工事例の新規作成' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '一覧に戻る' })).toHaveAttribute('href', '/admin/')
    for (const label of [
      /^日付/,
      /^分類（トップに表示）/,
      /^社名/,
      /^タイトル/,
      /^工事の種類・内容/,
      /^本文/,
    ]) {
      expect(screen.getByLabelText(label)).toBeRequired()
    }
    expect(screen.getByLabelText(/^日付/)).toHaveAttribute('type', 'date')
    expect(screen.getByRole('heading', { level: 2, name: '基本情報' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /写真/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下書き保存' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '公開して保存' })).toBeInTheDocument()
    // まだ保存していないため削除は出さない
    expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument()
  })

  it('本文の文字数を「n / 400 文字」で出す', async () => {
    renderEditor(createFakeAdminApi())
    const description = screen.getByLabelText(/^本文/)
    expect(description).toHaveAccessibleDescription('0 / 400 文字')
    await userEvent.type(description, 'あいう')
    expect(description).toHaveAccessibleDescription('3 / 400 文字')
  })

  it('未入力のまま保存すると、項目の下にエラーを出して保存しない', async () => {
    const api = createFakeAdminApi()
    renderEditor(api)
    fireEvent.change(screen.getByLabelText(/^日付/), { target: { value: '' } })
    await userEvent.click(screen.getByRole('button', { name: '下書き保存' }))

    expect(await screen.findByText('社名を入力してください')).toBeInTheDocument()
    expect(screen.getByLabelText(/^社名/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/^社名/)).toHaveAccessibleDescription('社名を入力してください')
    expect(screen.getByLabelText(/^日付/)).toHaveAccessibleDescription('日付を入力してください')
    expect(screen.getByText('写真を1枚以上追加してください')).toBeInTheDocument()
    expect(api.saveCaseStudy).not.toHaveBeenCalled()
  })

  it('写真を選ぶと縮小してアップロードし、1 枚目をメインとして説明の欄を出す', async () => {
    const api = createFakeAdminApi()
    renderEditor(api)
    const file = photoFile()
    await userEvent.upload(screen.getByLabelText('写真を追加'), file)

    expect(processPhotoFile).toHaveBeenCalledWith(file)
    expect(api.uploadPhoto).toHaveBeenCalledWith('newCase', processed)
    expect(await screen.findByLabelText('写真の説明（1 枚目）')).toBeInTheDocument()
    expect(screen.getByText('メイン')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1 枚目の写真を外す' })).toBeInTheDocument()
  })

  it('写真は 4 枚まで（4 枚になったら追加のボタンを出さない）', async () => {
    renderEditor(createFakeAdminApi())
    await userEvent.upload(screen.getByLabelText('写真を追加'), [
      photoFile('1.jpg'),
      photoFile('2.jpg'),
      photoFile('3.jpg'),
      photoFile('4.jpg'),
      photoFile('5.jpg'),
    ])
    expect(await screen.findByLabelText('写真の説明（4 枚目）')).toBeInTheDocument()
    expect(screen.queryByLabelText('写真の説明（5 枚目）')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('写真を追加')).not.toBeInTheDocument()
    expect(processPhotoFile).toHaveBeenCalledTimes(4)
  })

  it('写真の処理に失敗したら理由を出す', async () => {
    vi.mocked(processPhotoFile).mockRejectedValue(
      new PhotoError('JPEG・PNG・HEIC の写真を選んでください。'),
    )
    renderEditor(createFakeAdminApi())
    await userEvent.upload(screen.getByLabelText('写真を追加'), photoFile())
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '「genba.jpg」: JPEG・PNG・HEIC の写真を選んでください。',
    )
  })

  it('アップロードしたばかりの写真を外すと、Storage からもすぐ消す', async () => {
    const api = createFakeAdminApi()
    renderEditor(api)
    await userEvent.upload(screen.getByLabelText('写真を追加'), photoFile())
    await userEvent.click(await screen.findByRole('button', { name: '1 枚目の写真を外す' }))

    expect(screen.queryByLabelText('写真の説明（1 枚目）')).not.toBeInTheDocument()
    expect(api.deletePhotos).toHaveBeenCalledWith(['case-studies/newCase/photo101'])
  })

  it('「公開して保存」で、整えた値と status=published を新規として保存し、一覧に戻って通知する', async () => {
    const api = createFakeAdminApi()
    renderEditor(api)
    await fillValidForm()
    await userEvent.type(screen.getByLabelText('写真の説明（1 枚目）'), '回収コンテナ')
    await userEvent.click(screen.getByRole('button', { name: '公開して保存' }))

    await screen.findByText(/一覧の画面/)
    expect(api.saveCaseStudy).toHaveBeenCalledWith({
      id: 'newCase',
      isNew: true,
      status: 'published',
      values: {
        date: '2026-08-12',
        tag: '定期回収',
        company: '株式会社テスト',
        title: '工場の定期回収',
        category: '産業廃棄物 / 金属類',
        description: '1 行目\n2 行目',
        photos: [{ ...makePhoto('newCase', 101), alt: '回収コンテナ' }],
      },
    })
    expect(
      screen.getByText(/「工場の定期回収」を公開しました。サイトにすぐ反映されます。/),
    ).toBeInTheDocument()
  })

  it('「下書き保存」は status=draft で保存する', async () => {
    const api = createFakeAdminApi()
    renderEditor(api)
    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: '下書き保存' }))

    await screen.findByText(/「工場の定期回収」を下書きとして保存しました。/)
    expect(api.saveCaseStudy).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft', isNew: true }),
    )
  })

  it('保存に失敗したら画面に残り、エラーを出す', async () => {
    const api = createFakeAdminApi()
    api.saveCaseStudy.mockRejectedValue(new Error('permission-denied'))
    renderEditor(api)
    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: '下書き保存' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('保存できませんでした')
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('未保存のまま一覧に戻ろうとすると確認を出す', async () => {
    renderEditor(createFakeAdminApi())
    await userEvent.type(screen.getByLabelText(/^タイトル/), '途中')
    await userEvent.click(screen.getByRole('link', { name: '一覧に戻る' }))

    const dialog = await screen.findByRole('dialog', { name: '保存していない変更があります' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'このページに残る' }))
    expect(screen.getByLabelText(/^タイトル/)).toHaveValue('途中')

    await userEvent.click(screen.getByRole('link', { name: '一覧に戻る' }))
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: '保存していない変更があります' })).getByRole(
        'button',
        { name: '保存せずに離れる' },
      ),
    )
    expect(await screen.findByText(/一覧の画面/)).toBeInTheDocument()
  })

  it('変更が無ければ確認せずに戻る', async () => {
    renderEditor(createFakeAdminApi())
    await userEvent.click(screen.getByRole('link', { name: '一覧に戻る' }))
    expect(await screen.findByText(/一覧の画面/)).toBeInTheDocument()
  })
})

describe('施工事例の編集（既存）', () => {
  const existing = () =>
    makeCaseStudy({
      id: 'factory',
      status: 'published',
      title: '工場の定期回収',
      photos: [makePhoto('factory', 1, '1 枚目'), makePhoto('factory', 2, '2 枚目')],
    })

  it('見出しと状態のバッジ、保存済みの値を出す', () => {
    const initial = existing()
    renderEditor(createFakeAdminApi([initial]), { initial, caseId: initial.id })
    expect(screen.getByRole('heading', { level: 1, name: '施工事例の編集' })).toBeInTheDocument()
    expect(screen.getByText('公開中')).toBeInTheDocument()
    expect(screen.getByLabelText(/^タイトル/)).toHaveValue('工場の定期回収')
    expect(screen.getByLabelText('写真の説明（2 枚目）')).toHaveValue('2 枚目')
  })

  it('保存済みの写真を外して保存すると、保存のあとで Storage から消す', async () => {
    const initial = existing()
    const api = createFakeAdminApi([initial])
    renderEditor(api, { initial, caseId: initial.id })
    await userEvent.click(screen.getByRole('button', { name: '2 枚目の写真を外す' }))
    // 保存するまでは消さない（保存をやめた場合に、保存済みの事例の写真が壊れないように）
    expect(api.deletePhotos).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: '公開して保存' }))
    await screen.findByText(/一覧の画面/)
    expect(api.saveCaseStudy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'factory', isNew: false, status: 'published' }),
    )
    expect(api.saveCaseStudy.mock.calls[0]?.[0].values.photos).toEqual([
      makePhoto('factory', 1, '1 枚目'),
    ])
    expect(api.deletePhotos).toHaveBeenCalledWith(['case-studies/factory/photo2'])
  })

  it('「削除」は確認ダイアログを出し、「削除する」で写真ごと消して一覧に戻る', async () => {
    const initial = existing()
    const api = createFakeAdminApi([initial])
    renderEditor(api, { initial, caseId: initial.id })
    await userEvent.click(screen.getByRole('button', { name: '削除' }))

    const dialog = await screen.findByRole('dialog', { name: 'この施工事例を削除しますか？' })
    expect(dialog).toHaveTextContent('「工場の定期回収」と写真 2 枚を削除します。元に戻せません。')
    await userEvent.click(within(dialog).getByRole('button', { name: 'やめる' }))
    expect(api.deleteCaseStudy).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: '削除' }))
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'この施工事例を削除しますか？' })).getByRole(
        'button',
        { name: '削除する' },
      ),
    )
    await screen.findByText(/「工場の定期回収」を削除しました。/)
    expect(api.deleteCaseStudy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'factory', photos: initial.photos }),
    )
  })

  it('削除に失敗したらエラーを出す', async () => {
    const initial = existing()
    const api = createFakeAdminApi([initial])
    api.deleteCaseStudy.mockRejectedValue(new Error('unavailable'))
    renderEditor(api, { initial, caseId: initial.id })
    await userEvent.click(screen.getByRole('button', { name: '削除' }))
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'この施工事例を削除しますか？' })).getByRole(
        'button',
        { name: '削除する' },
      ),
    )
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('削除できませんでした'))
  })
})
