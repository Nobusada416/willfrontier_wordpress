import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { stubMatchMedia } from '~/test/matchMedia'
import { ContactCta } from './ContactCta'

describe('ContactCta', () => {
  it('見出しとお問い合わせページへのリンクを表示する', () => {
    stubMatchMedia()
    render(
      <MemoryRouter>
        <ContactCta title="サービスのご相談はこちら" />
      </MemoryRouter>,
    )
    const section = screen.getByRole('region', { name: 'サービスのご相談はこちら' })
    expect(section).toHaveClass('isolate')
    expect(
      screen.getByRole('heading', { level: 2, name: 'サービスのご相談はこちら' }),
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'お問い合わせ' })).toHaveAttribute('href', '/contact/')
  })
})
