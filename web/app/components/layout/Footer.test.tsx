import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { CONTACT_LINK, FOOTER_NAV } from '~/content/navigation'
import { Footer } from './Footer'

const renderFooter = () =>
  render(
    <MemoryRouter initialEntries={['/mission/']}>
      <Footer />
    </MemoryRouter>,
  )

describe('Footer', () => {
  it('ロゴはトップページへのリンク', () => {
    renderFooter()
    const footer = screen.getByRole('contentinfo')
    expect(
      within(footer).getByRole('link', { name: 'ウィルフロンティア トップへ' }),
    ).toHaveAttribute('href', '/')
  })

  it('フッターナビは下層ページからでもトップの各セクションへ移動できる（/#section 形式）', () => {
    renderFooter()
    const nav = screen.getByRole('navigation', { name: 'フッターナビ' })
    for (const item of FOOTER_NAV) {
      expect(within(nav).getByRole('link', { name: item.label })).toHaveAttribute('href', item.href)
    }
  })

  it('CONTACT ボタンはお問い合わせページを指す', () => {
    renderFooter()
    expect(
      within(screen.getByRole('contentinfo')).getByRole('link', { name: /CONTACT/ }),
    ).toHaveAttribute('href', CONTACT_LINK.href)
  })

  it('著作権表示に会社名を含む', () => {
    renderFooter()
    expect(screen.getByText(/株式会社ウィルフロンティア/)).toBeInTheDocument()
  })
})
