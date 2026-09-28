import { describe, expect, it, vi } from 'vitest'
import { submitInquiry } from './submitInquiry'

const payload = {
  formType: 'contact' as const,
  company: '',
  name: '田中 太郎',
  tel: '045-123-4567',
  message: '見積もりをお願いします。',
}

// firebase/functions の FirebaseError と同じ形（code と details を持つ Error）
const functionsError = (code: string, details?: unknown) =>
  Object.assign(new Error(code), { code: `functions/${code}`, details })

describe('submitInquiry', () => {
  it('送信処理に値をそのまま渡し、受け付けられたら ok を返す', async () => {
    const call = vi.fn().mockResolvedValue({ data: { ok: true } })
    await expect(submitInquiry(payload, call)).resolves.toEqual({ status: 'ok' })
    expect(call).toHaveBeenCalledWith(payload)
  })

  it('送信処理の入力チェックで弾かれたら、項目ごとのエラーを返す', async () => {
    const call = vi.fn().mockRejectedValue(
      functionsError('invalid-argument', {
        issues: [
          { path: 'tel', message: '電話番号を正しく入力してください' },
          { path: 'name', message: '担当者名を入力してください' },
          // 同じ項目の 2 件目以降は最初のものを優先する
          { path: 'tel', message: '別のエラー' },
          // 項目に紐づかないエラー（path が空文字）は項目のエラーにしない
          { path: '', message: '項目に紐づかないエラー' },
        ],
      }),
    )
    await expect(submitInquiry(payload, call)).resolves.toEqual({
      status: 'invalid',
      fieldErrors: {
        tel: '電話番号を正しく入力してください',
        name: '担当者名を入力してください',
      },
    })
  })

  it('項目のわからない入力エラーは送信の失敗として扱う', async () => {
    const call = vi.fn().mockRejectedValue(functionsError('invalid-argument'))
    await expect(submitInquiry(payload, call)).resolves.toEqual({ status: 'error' })
  })

  it.each(['internal', 'unavailable', 'unauthenticated', 'resource-exhausted'])(
    '%s などのエラーは送信の失敗として扱う',
    async (code) => {
      const call = vi.fn().mockRejectedValue(functionsError(code))
      await expect(submitInquiry(payload, call)).resolves.toEqual({ status: 'error' })
    },
  )

  it('Firebase の読み込みに失敗した場合（通信エラーなど）も送信の失敗として扱う', async () => {
    const call = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(submitInquiry(payload, call)).resolves.toEqual({ status: 'error' })
  })
})
