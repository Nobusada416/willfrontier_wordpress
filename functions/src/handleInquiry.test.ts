import type { FormType } from '@wf/shared'
import { describe, expect, it, vi } from 'vitest'
import {
  handleInquiry,
  INQUIRY_RETENTION_DAYS,
  MAIL_RETENTION_DAYS,
  type InquiryDeps,
  type Write,
} from './handleInquiry'

const NOW = new Date('2026-09-28T01:00:00.000Z')
const DAY = 24 * 60 * 60 * 1000

const createDeps = (overrides: Partial<InquiryDeps> = {}) => {
  const save = vi.fn<(writes: Write[]) => Promise<void>>(async () => {})
  const deps: InquiryDeps = {
    now: () => NOW,
    newId: () => 'abc123',
    mailTo: (formType: FormType) => `${formType}@example.com`,
    save,
    ...overrides,
  }
  return { deps, save }
}

const contact = {
  formType: 'contact',
  company: '株式会社テスト',
  name: '  山田 太郎  ',
  tel: '０３ー１２３４ー５６７８',
  message: 'お見積りをお願いします',
}

const recruit = {
  formType: 'recruit',
  name: '鈴木 一郎',
  kana: 'スズキ イチロウ',
  address: '神奈川県横浜市',
  tel: '080-1234-5678',
  email: 'ichiro@example.com',
  emailConfirm: 'ichiro@example.com',
  job: 'ドライバー',
  education: '高校卒業',
  note: 'よろしくお願いします',
  privacyConsent: true,
}

// save に渡された書き込みを取り出す
const savedWrites = (save: ReturnType<typeof createDeps>['save']) => {
  expect(save).toHaveBeenCalledTimes(1)
  const writes = save.mock.calls[0]?.[0]
  if (!writes) throw new Error('save が呼ばれていません')
  return writes
}

const findWrite = (writes: Write[], collection: string) => {
  const write = writes.find((item) => item.path.startsWith(`${collection}/`))
  if (!write) throw new Error(`${collection} への書き込みがありません`)
  return write
}

describe('handleInquiry', () => {
  describe('入力チェック', () => {
    it('必須項目が欠けていれば項目ごとのエラーを返し、保存しない', async () => {
      const { deps, save } = createDeps()
      const result = await handleInquiry({ ...contact, name: '', message: ' ' }, deps)
      expect(result).toEqual({
        kind: 'invalid',
        issues: [
          { path: 'name', message: '担当者名を入力してください' },
          { path: 'message', message: '内容を入力してください' },
        ],
      })
      expect(save).not.toHaveBeenCalled()
    })

    it('確認用メールアドレスの不一致は確認欄のエラーにする', async () => {
      const { deps } = createDeps()
      const result = await handleInquiry({ ...recruit, emailConfirm: 'other@example.com' }, deps)
      expect(result).toEqual({
        kind: 'invalid',
        issues: [{ path: 'emailConfirm', message: 'メールアドレスが一致しません' }],
      })
    })

    it('オブジェクトでない値は項目のないエラーにする', async () => {
      const { deps, save } = createDeps()
      const result = await handleInquiry(null, deps)
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') expect(result.issues[0]?.path).toBe('')
      expect(save).not.toHaveBeenCalled()
    })

    it('未知のフォーム種別は formType のエラーにする', async () => {
      const { deps } = createDeps()
      const result = await handleInquiry({ ...contact, formType: 'unknown' }, deps)
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') expect(result.issues[0]?.path).toBe('formType')
    })
  })

  describe('ボット対策（honeypot）', () => {
    it('隠し項目に値があれば保存せず spam を返す', async () => {
      const { deps, save } = createDeps()
      const result = await handleInquiry({ ...contact, website: 'https://spam.example.com' }, deps)
      expect(result).toEqual({ kind: 'spam' })
      expect(save).not.toHaveBeenCalled()
    })

    it('隠し項目が空白だけなら通常どおり受け付ける', async () => {
      const { deps } = createDeps()
      const result = await handleInquiry({ ...contact, website: ' ' }, deps)
      expect(result).toEqual({ kind: 'accepted', id: 'abc123', formType: 'contact' })
    })
  })

  describe('受け付けた内容の保存', () => {
    it('inquiries と mail の 2 ドキュメントを同じ ID で 1 回の save（batch）に渡す', async () => {
      const { deps, save } = createDeps()
      const result = await handleInquiry(contact, deps)
      expect(result).toEqual({ kind: 'accepted', id: 'abc123', formType: 'contact' })
      expect(savedWrites(save).map((write) => write.path)).toEqual([
        'inquiries/abc123',
        'mail/abc123',
      ])
    })

    it('inquiries には種別・検証後（正規化済み）の値・受付日時・TTL を保存する', async () => {
      const { deps, save } = createDeps()
      await handleInquiry({ ...contact, extra: '不要な項目', website: '' }, deps)
      const inquiry = findWrite(savedWrites(save), 'inquiries')
      expect(inquiry.data).toEqual({
        formType: 'contact',
        values: {
          company: '株式会社テスト',
          name: '山田 太郎',
          tel: '03-1234-5678',
          message: 'お見積りをお願いします',
        },
        receivedAt: NOW,
        expireAt: new Date(NOW.getTime() + INQUIRY_RETENTION_DAYS * DAY),
      })
    })

    it('採用応募は確認用メールアドレスを保存せず、同意を記録する', async () => {
      const { deps, save } = createDeps()
      await handleInquiry(recruit, deps)
      const { values } = findWrite(savedWrites(save), 'inquiries').data as {
        values: Record<string, unknown>
      }
      expect(values).not.toHaveProperty('emailConfirm')
      expect(values).not.toHaveProperty('website')
      expect(values.privacyConsent).toBe(true)
    })

    it('inquiries の保持期間は 180 日', () => {
      expect(INQUIRY_RETENTION_DAYS).toBe(180)
    })

    it('mail には Trigger Email 拡張の形式（to・message）と TTL を保存する', async () => {
      const { deps, save } = createDeps()
      await handleInquiry(contact, deps)
      const mail = findWrite(savedWrites(save), 'mail')
      expect(mail.data).toEqual({
        to: 'contact@example.com',
        message: {
          subject: '【ウィルフロンティア】お問い合わせ：山田 太郎 様',
          text: expect.stringContaining('担当者名：山田 太郎'),
        },
        expireAt: new Date(NOW.getTime() + MAIL_RETENTION_DAYS * DAY),
      })
    })

    it('mail の保持期間は inquiries より短い 30 日', () => {
      expect(MAIL_RETENTION_DAYS).toBe(30)
    })

    it.each([
      ['contact', contact],
      ['recruit', recruit],
    ])('宛先はフォーム種別（%s）ごとに解決する', async (formType, payload) => {
      const mailTo = vi.fn((type: FormType) => `${type}@example.com`)
      const { deps, save } = createDeps({ mailTo })
      await handleInquiry(payload, deps)
      expect(mailTo).toHaveBeenCalledWith(formType)
      expect(findWrite(savedWrites(save), 'mail').data).toMatchObject({
        to: `${formType}@example.com`,
      })
    })

    it('メールアドレスがあれば返信先に入れる', async () => {
      const { deps, save } = createDeps()
      await handleInquiry(recruit, deps)
      expect(findWrite(savedWrites(save), 'mail').data).toMatchObject({
        replyTo: 'ichiro@example.com',
      })
    })

    it('宛先が未設定なら保存せずエラーを投げる', async () => {
      const { deps, save } = createDeps({ mailTo: () => ' ' })
      await expect(handleInquiry(contact, deps)).rejects.toThrow('宛先')
      expect(save).not.toHaveBeenCalled()
    })

    it('保存に失敗したらエラーをそのまま投げる', async () => {
      const { deps } = createDeps({
        save: async () => {
          throw new Error('Firestore unavailable')
        },
      })
      await expect(handleInquiry(contact, deps)).rejects.toThrow('Firestore unavailable')
    })
  })
})
