import { render, screen } from '@testing-library/react'
import type { ComponentType } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContactForm } from './ContactForm'
import { RecruitForm } from './RecruitForm'
import { SafetyForm } from './SafetyForm'

vi.mock('~/lib/submitInquiry', () => ({
  submitInquiry: vi.fn(),
  prepareSubmitInquiry: vi.fn(),
}))

afterEach(() => {
  vi.clearAllMocks()
})

// 例示用に予約されたドメイン（RFC 2606: example.com / example.net / example.org とそのサブドメイン）
const RESERVED_EXAMPLE_DOMAIN = /@(?:[a-z0-9-]+\.)*example\.(?:com|net|org)$/

// 入力例に含まれるメールアドレス（「例）」などの前置きを除く）
const emailsInPlaceholders = () =>
  [...document.querySelectorAll('[placeholder]')]
    .map((element) => element.getAttribute('placeholder') ?? '')
    .flatMap((placeholder) => placeholder.match(/[^\s）)]+@[^\s（(]+/g) ?? [])

describe('フォームの入力例', () => {
  const forms: [string, ComponentType][] = [
    ['ContactForm', ContactForm],
    ['SafetyForm', SafetyForm],
    ['RecruitForm', RecruitForm],
  ]

  // 実在しうるドメイン（会社のドメインなど）を例にすると、そのまま送られたときに第三者へ届くおそれがある
  it.each(forms)('%s のメールアドレスの入力例は例示用のドメインを使う', (_, Form) => {
    render(<Form />)
    for (const email of emailsInPlaceholders()) {
      expect(email).toMatch(RESERVED_EXAMPLE_DOMAIN)
    }
  })

  it('採用フォームのメールアドレス欄に入力例を示す', () => {
    render(<RecruitForm />)
    const email = screen.getByRole('textbox', { name: /^メールアドレス(必須)?$/ })
    expect(email.getAttribute('placeholder')).toMatch(/^例）\S+@example\.com$/)
  })
})
