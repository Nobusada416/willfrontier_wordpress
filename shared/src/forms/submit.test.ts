import { describe, expect, it } from 'vitest'
import { isInquiryErrorDetails, SUBMIT_INQUIRY_FUNCTION } from './submit'

describe('SUBMIT_INQUIRY_FUNCTION', () => {
  it('送信処理の Cloud Functions の関数名', () => {
    expect(SUBMIT_INQUIRY_FUNCTION).toBe('submitInquiry')
  })
})

describe('isInquiryErrorDetails', () => {
  it('項目ごとのエラーの一覧なら true', () => {
    expect(
      isInquiryErrorDetails({ issues: [{ path: 'name', message: '担当者名を入力してください' }] }),
    ).toBe(true)
  })

  it('エラーが 0 件でも形式が合っていれば true', () => {
    expect(isInquiryErrorDetails({ issues: [] })).toBe(true)
  })

  it.each([
    undefined,
    null,
    'error',
    {},
    { issues: 'name' },
    { issues: [{ path: 'name' }] },
    { issues: [{ path: 1, message: 'x' }] },
    { issues: [null] },
  ])('形式が違えば false（%j）', (value) => {
    expect(isInquiryErrorDetails(value)).toBe(false)
  })
})
