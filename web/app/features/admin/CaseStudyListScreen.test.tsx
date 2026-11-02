import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { createFakeAdminApi, makeCaseStudy, type FakeAdminApi } from '~/test/fakeAdminApi'
import { AdminApiContext } from './api'
import { CaseStudyListScreen } from './CaseStudyListScreen'

const renderList = (api: FakeAdminApi, state?: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/admin/', state }]}>
      <AdminApiContext.Provider value={api}>
        <CaseStudyListScreen />
      </AdminApiContext.Provider>
    </MemoryRouter>,
  )

const SAMPLE = [
  makeCaseStudy({
    id: 'factory',
    title: '工場の定期回収',
    company: '[社名]',
    tag: '定期回収',
    date: '2026-08-12',
    status: 'draft',
  }),
  makeCaseStudy({
    id: 'demolition',
    title: '解体工事の産廃一括処理',
    company: '株式会社〇〇建設',
    tag: '解体工事',
    date: '2026-10-20',
    status: 'published',
  }),
  makeCaseStudy({
    id: 'newbuild',
    title: '新築現場の分別回収',
    company: '△△工務店',
    tag: '新築工事',
    date: '2026-09-05',
    status: 'published',
  }),
]

const rows = async () => {
  const table = await screen.findByRole('table')
  return within(table).getAllByRole('row').slice(1)
}

describe('施工事例の一覧', () => {
  it('見出し・件数・新規作成', async () => {
    renderList(createFakeAdminApi(SAMPLE))
    expect(screen.getByRole('heading', { level: 1, name: '施工事例' })).toBeInTheDocument()
    expect(
      await screen.findByText('公開中 2 件・下書き 1 件。「公開中」の事例がサイトに表示されます。'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '新規作成' })).toHaveAttribute(
      'href',
      '/admin/case-studies/new/',
    )
  })

  it('下書き・公開の両方を日付の新しい順に並べる', async () => {
    renderList(createFakeAdminApi(SAMPLE))
    const titles = (await rows()).map((row) => within(row).getByRole('link').textContent)
    expect(titles).toEqual(['解体工事の産廃一括処理', '新築現場の分別回収', '工場の定期回収'])
  })

  it('行に写真・タイトル（編集へのリンク）・社名と分類・日付・状態を出す', async () => {
    renderList(createFakeAdminApi(SAMPLE))
    const [first] = await rows()
    if (!first) throw new Error('行がありません')
    const row = within(first)
    expect(row.getByRole('link', { name: '解体工事の産廃一括処理' })).toHaveAttribute(
      'href',
      '/admin/case-studies/edit/?id=demolition',
    )
    expect(first).toHaveTextContent('株式会社〇〇建設')
    expect(first).toHaveTextContent('解体工事')
    expect(first).toHaveTextContent('2026.10.20')
    expect(first).toHaveTextContent('公開中')
    // サムネイルは小さい方の画像。説明はタイトルと重複するため読み上げない
    const image = first.querySelector('img')
    expect(image).toHaveAttribute('src', SAMPLE[1]?.photos[0]?.smallUrl)
    expect(image).toHaveAttribute('alt', '')
  })

  it('横にはみ出す表は、キーボードでもスクロールできる枠に入れる', async () => {
    renderList(createFakeAdminApi(SAMPLE))
    const region = await screen.findByRole('region', { name: '施工事例の一覧' })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(within(region).getByRole('table')).toBeInTheDocument()
  })

  it('「公開する」で公開に切り替え、通知を出す', async () => {
    const api = createFakeAdminApi(SAMPLE)
    renderList(api)
    const draftRow = (await rows())[2]
    if (!draftRow) throw new Error('行がありません')
    await userEvent.click(
      within(draftRow).getByRole('button', { name: '「工場の定期回収」を公開する' }),
    )

    expect(api.setStatus).toHaveBeenCalledWith('factory', 'published')
    expect(await screen.findByRole('status')).toHaveTextContent(
      '「工場の定期回収」を公開しました。サイトにすぐ反映されます。',
    )
    expect(draftRow).toHaveTextContent('公開中')
    expect(
      within(draftRow).getByRole('button', { name: '「工場の定期回収」を非公開にする' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('公開中 3 件・下書き 0 件。「公開中」の事例がサイトに表示されます。'),
    ).toBeInTheDocument()
  })

  it('「非公開にする」で下書きに戻す', async () => {
    const api = createFakeAdminApi(SAMPLE)
    renderList(api)
    const [first] = await rows()
    if (!first) throw new Error('行がありません')
    await userEvent.click(
      within(first).getByRole('button', { name: '「解体工事の産廃一括処理」を非公開にする' }),
    )

    expect(api.setStatus).toHaveBeenCalledWith('demolition', 'draft')
    expect(await screen.findByRole('status')).toHaveTextContent(
      '「解体工事の産廃一括処理」を非公開にしました。サイトには表示されなくなります。',
    )
    expect(first).toHaveTextContent('下書き')
  })

  it('切り替えに失敗したら状態を変えずにエラーを出す', async () => {
    const api = createFakeAdminApi(SAMPLE)
    api.setStatus.mockRejectedValue(new Error('permission-denied'))
    renderList(api)
    const [first] = await rows()
    if (!first) throw new Error('行がありません')
    await userEvent.click(within(first).getByRole('button', { name: /非公開にする/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '「解体工事の産廃一括処理」を切り替えられませんでした。',
    )
    expect(first).toHaveTextContent('公開中')
  })

  it('保存・削除のあとの通知（画面の移動で渡されたもの）を出す', async () => {
    renderList(createFakeAdminApi(SAMPLE), { notice: '「新しい事例」を保存しました。' })
    expect(screen.getByRole('status')).toHaveTextContent('「新しい事例」を保存しました。')
  })

  it('事例が無ければ案内を出す', async () => {
    renderList(createFakeAdminApi([]))
    expect(await screen.findByText(/まだ施工事例がありません/)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('読み込みに失敗したら案内を出し、やり直せる', async () => {
    const api = createFakeAdminApi(SAMPLE)
    api.listCaseStudies.mockRejectedValueOnce(new Error('unavailable'))
    renderList(api)
    expect(await screen.findByRole('alert')).toHaveTextContent('一覧を読み込めませんでした')

    await userEvent.click(screen.getByRole('button', { name: 'もう一度読み込む' }))
    expect(await rows()).toHaveLength(3)
  })
})
