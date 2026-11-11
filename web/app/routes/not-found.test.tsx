import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import NotFoundPage, { meta } from './not-found'

describe('404 ページ', () => {
  it('見出しとトップページへのリンクを表示する', () => {
    render(
      <MemoryRouter initialEntries={['/no-such-page/']}>
        <NotFoundPage />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'ページが見つかりません' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'トップページへ戻る' })).toHaveAttribute('href', '/')
  })

  it('noindex を指定する', () => {
    expect(meta()).toContainEqual({ name: 'robots', content: 'noindex' })
  })
})
