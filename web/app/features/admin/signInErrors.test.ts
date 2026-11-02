import { describe, expect, it } from 'vitest'
import { signInErrorFromCode, signInErrorMessage } from './signInErrors'

describe('signInErrorFromCode（Firebase Auth のエラーの分類）', () => {
  it.each([
    ['auth/invalid-credential', 'invalid-credentials'],
    ['auth/wrong-password', 'invalid-credentials'],
    ['auth/user-not-found', 'invalid-credentials'],
    ['auth/invalid-email', 'invalid-email'],
    ['auth/too-many-requests', 'too-many-requests'],
    ['auth/user-disabled', 'user-disabled'],
    ['auth/network-request-failed', 'network'],
    ['auth/internal-error', 'unknown'],
    [undefined, 'unknown'],
  ] as const)('%s → %s', (code, expected) => {
    expect(signInErrorFromCode(code)).toBe(expected)
  })
})

describe('signInErrorMessage（画面に出す文言と場所）', () => {
  it('メールアドレスかパスワードの誤りは、どちらが違うかを明かさずパスワードの下に出す', () => {
    expect(signInErrorMessage('invalid-credentials')).toEqual({
      field: 'password',
      message: 'メールアドレスかパスワードが違います。',
    })
  })

  it('メールアドレスの形式の誤りはメールアドレスの下に出す', () => {
    expect(signInErrorMessage('invalid-email')).toEqual({
      field: 'email',
      message: 'メールアドレスの形式が正しくありません。',
    })
  })

  it('管理者でないアカウントは「権限がありません」', () => {
    expect(signInErrorMessage('forbidden')).toEqual({
      field: 'form',
      message: 'このアカウントには管理画面を使う権限がありません。制作担当にご連絡ください。',
    })
  })

  it.each(['too-many-requests', 'user-disabled', 'network', 'unknown'] as const)(
    '%s はフォーム全体のエラーとして出す',
    (error) => {
      const result = signInErrorMessage(error)
      expect(result.field).toBe('form')
      expect(result.message.length).toBeGreaterThan(0)
    },
  )
})
