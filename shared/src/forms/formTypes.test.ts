import { describe, expect, it } from 'vitest'
import { FORM_TYPES, isFormType } from './formTypes'

describe('FORM_TYPES', () => {
  it('お問い合わせ・安全ページ・採用応募の 3 種類', () => {
    expect(FORM_TYPES).toEqual(['contact', 'safety', 'recruit'])
  })
})

describe('isFormType', () => {
  it.each(['contact', 'safety', 'recruit'])('%s はフォーム種別として有効', (value) => {
    expect(isFormType(value)).toBe(true)
  })

  it.each(['', 'Contact', 'other', 1, null, undefined])('%s は無効', (value) => {
    expect(isFormType(value)).toBe(false)
  })
})
