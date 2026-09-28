import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { CONTACT_LINK, GLOBAL_NAV } from '~/content/navigation'
import { Header } from './Header'

const renderHeader = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  )

const menuButton = () => screen.getByRole('button', { name: 'メニュー' })

describe('Header（PC 表示のナビ）', () => {
  it('ロゴはトップページへのリンク', () => {
    renderHeader('/service/')
    expect(screen.getByRole('link', { name: 'ウィルフロンティア トップへ' })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('グローバルナビに全項目を表示し、各下層ページを指す', () => {
    renderHeader()
    const nav = screen.getByRole('navigation', { name: 'グローバルナビ' })
    for (const item of GLOBAL_NAV) {
      expect(within(nav).getByRole('link', { name: item.label })).toHaveAttribute('href', item.href)
    }
  })

  it('CONTACT ボタンはお問い合わせページを指す（旧実装の /safety/ から修正）', () => {
    renderHeader()
    expect(
      within(screen.getByRole('banner')).getByRole('link', { name: 'CONTACT' }),
    ).toHaveAttribute('href', CONTACT_LINK.href)
  })

  it('表示中のページのリンクに aria-current="page" を付ける', () => {
    renderHeader('/vehicles/')
    const nav = screen.getByRole('navigation', { name: 'グローバルナビ' })
    expect(within(nav).getByRole('link', { name: 'VEHICLES' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(nav).getByRole('link', { name: 'SERVICE' })).not.toHaveAttribute('aria-current')
  })
})

describe('Header（スマホ表示のメニュー）', () => {
  it('初期状態ではメニューは閉じている', () => {
    renderHeader()
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('メニューボタンで開閉し、aria-expanded と aria-controls が連動する', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(menuButton())
    const dialog = screen.getByRole('dialog', { name: 'メニュー' })
    expect(menuButton()).toHaveAttribute('aria-expanded', 'true')
    expect(menuButton()).toHaveAttribute('aria-controls', dialog.id)

    await user.click(within(dialog).getByRole('button', { name: 'メニューを閉じる' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('メニューにはグローバルナビと CONTACT のリンクがある', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(menuButton())

    const dialog = screen.getByRole('dialog')
    for (const item of [...GLOBAL_NAV, CONTACT_LINK]) {
      expect(within(dialog).getByRole('link', { name: item.label })).toHaveAttribute(
        'href',
        item.href,
      )
    }
  })

  it('開くとメニュー内の閉じるボタンにフォーカスが移る', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(menuButton())

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('button', { name: 'メニューを閉じる' })).toHaveFocus()
  })

  it('Esc で閉じ、フォーカスがメニューボタンに戻る', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(menuButton())

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(menuButton()).toHaveFocus()
  })

  it('Tab 移動はメニューの中で循環する（フォーカストラップ）', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(menuButton())

    const dialog = screen.getByRole('dialog')
    const focusables = [
      within(dialog).getByRole('button', { name: 'メニューを閉じる' }),
      ...within(dialog).getAllByRole('link'),
    ]
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    // 最後の要素から Tab で先頭へ
    last?.focus()
    await user.tab()
    expect(first).toHaveFocus()

    // 先頭の要素から Shift+Tab で最後へ
    await user.tab({ shift: true })
    expect(last).toHaveFocus()
  })

  it('メニュー内のリンクを押すと閉じる', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(menuButton())

    await user.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'WORKFLOW' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('開いている間はメニュー以外を操作できないようにし（inert）、閉じると元に戻す', async () => {
    const user = userEvent.setup()
    const { container } = renderHeader()

    await user.click(menuButton())
    // タッチ端末のスクリーンリーダーは Tab キーを使わないため、背面を inert にして読み上げ対象から外す
    expect(container).toHaveAttribute('inert')
    expect(screen.getByRole('dialog').closest('[inert]')).toBeNull()

    await user.keyboard('{Escape}')
    expect(container).not.toHaveAttribute('inert')
  })

  it('開いている間は背面のスクロールを止め、閉じると元に戻す', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(menuButton())
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    expect(document.body.style.overflow).toBe('')
  })
})
