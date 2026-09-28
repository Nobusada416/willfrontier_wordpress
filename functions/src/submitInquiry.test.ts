import type { FormType } from '@wf/shared'
import { HttpsError } from 'firebase-functions/v2/https'
import { describe, expect, it, vi } from 'vitest'
import type { Write } from './handleInquiry'
import { commitWrites, createSubmitInquiryHandler, type SubmitInquiryDeps } from './submitInquiry'

const contact = {
  formType: 'contact',
  company: '',
  name: '山田 太郎',
  tel: '03-1234-5678',
  message: 'お見積りをお願いします',
}

const createDeps = (overrides: Partial<SubmitInquiryDeps> = {}) => {
  const logger = { info: vi.fn(), error: vi.fn() }
  const save = vi.fn<(writes: Write[]) => Promise<void>>(async () => {})
  const deps: SubmitInquiryDeps = {
    now: () => new Date('2026-09-28T01:00:00.000Z'),
    newId: () => 'abc123',
    mailTo: (formType: FormType) => `${formType}@example.com`,
    save,
    logger,
    ...overrides,
  }
  return { deps, save, logger }
}

// ハンドラーが投げた HttpsError を取り出す
const catchHttpsError = async (promise: Promise<unknown>) => {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  )
  if (!(error instanceof HttpsError)) throw new Error('HttpsError が投げられていません')
  return error
}

describe('createSubmitInquiryHandler', () => {
  it('受け付けたら { ok: true } を返し、ID と種別だけを記録する', async () => {
    const { deps, save, logger } = createDeps()
    await expect(createSubmitInquiryHandler(deps)({ data: contact })).resolves.toEqual({ ok: true })
    expect(save).toHaveBeenCalledTimes(1)
    expect(logger.info).toHaveBeenCalledWith('問い合わせを受け付けました', {
      id: 'abc123',
      formType: 'contact',
    })
  })

  it('ボットと判定したら保存せず、受け付けたときと同じ応答を返す', async () => {
    const { deps, save } = createDeps()
    const response = await createSubmitInquiryHandler(deps)({
      data: { ...contact, website: 'https://spam.example.com' },
    })
    expect(response).toEqual({ ok: true })
    expect(save).not.toHaveBeenCalled()
  })

  it('入力エラーは invalid-argument にし、details に項目ごとのエラーを入れる', async () => {
    const { deps } = createDeps()
    const error = await catchHttpsError(
      createSubmitInquiryHandler(deps)({ data: { ...contact, name: '' } }),
    )
    expect(error.code).toBe('invalid-argument')
    expect(error.details).toEqual({
      issues: [{ path: 'name', message: '担当者名を入力してください' }],
    })
  })

  it('想定外のエラーは記録して internal にする（原因はクライアントに返さない）', async () => {
    const cause = new Error('Firestore unavailable')
    const { deps, logger } = createDeps({ save: () => Promise.reject(cause) })
    const error = await catchHttpsError(createSubmitInquiryHandler(deps)({ data: contact }))
    expect(error.code).toBe('internal')
    expect(error.message).not.toContain('Firestore')
    expect(error.details).toBeUndefined()
    expect(logger.error).toHaveBeenCalledWith('問い合わせの受け付けに失敗しました', cause)
  })
})

describe('commitWrites', () => {
  it('すべての書き込みを 1 つの batch にまとめて 1 回だけ commit する', async () => {
    const sets: { path: string; data: Record<string, unknown> }[] = []
    const commit = vi.fn(async () => [])
    const db = {
      doc: (path: string) => ({ path }),
      batch: () => ({
        set: (ref: { path: string }, data: Record<string, unknown>) => {
          sets.push({ path: ref.path, data })
        },
        commit,
      }),
    }
    const writes: Write[] = [
      { path: 'inquiries/abc123', data: { formType: 'contact' } },
      { path: 'mail/abc123', data: { to: 'contact@example.com' } },
    ]
    await commitWrites(db, writes)
    expect(sets).toEqual(writes)
    expect(commit).toHaveBeenCalledTimes(1)
  })
})
