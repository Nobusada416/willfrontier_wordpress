import { HONEYPOT_FIELD, SUBMIT_INQUIRY_FUNCTION, type InquiryPayload } from '@wf/shared'
import { deleteApp as deleteClientApp, initializeApp as initializeClientApp } from 'firebase/app'
import {
  connectFunctionsEmulator,
  FunctionsError,
  getFunctions,
  httpsCallable,
} from 'firebase/functions'
import { deleteApp, initializeApp, type App } from 'firebase-admin/app'
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseEnv } from 'node:util'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

// フォームの送信（callable 関数 submitInquiry）から Firestore への保存までを、
// Functions・Firestore の Emulator で確かめる（npm run test:integration）。
// 画面と同じく Firebase JS SDK の httpsCallable で呼ぶ。App Check のトークンは付けない
// （Functions Emulator では強制しない。functions/src/params.ts の shouldEnforceAppCheck）

// npm run test:integration の --project と同じ（demo- のため実在のリソースには接続しない）
const PROJECT_ID = 'demo-willfrontier'
const REGION = 'asia-northeast1'
const DAY_MS = 24 * 60 * 60 * 1000

const root = resolve(__dirname, '../..')

// Functions Emulator のポートは firebase.json の設定を使う
const firebaseConfig: { emulators: { functions: { port: number } } } = JSON.parse(
  readFileSync(resolve(root, 'firebase.json'), 'utf8'),
)

// 関数が読む宛先。Emulator と同じく .env → .env.<プロジェクト ID> → .env.local の順に重ねる
// （既定は functions/.env.demo-willfrontier。手元に functions/.env.local があればそちらが優先される）
const loadMailTo = () => {
  const env: Record<string, string | undefined> = {}
  for (const file of ['.env', `.env.${PROJECT_ID}`, '.env.local']) {
    const path = resolve(root, 'functions', file)
    if (existsSync(path)) Object.assign(env, parseEnv(readFileSync(path, 'utf8')))
  }
  const value = (key: string) => {
    const to = env[key]
    if (!to) throw new Error(`functions/.env.${PROJECT_ID} に ${key} がありません`)
    return to
  }
  return {
    contact: value('CONTACT_MAIL_TO'),
    safety: value('SAFETY_MAIL_TO'),
    recruit: value('RECRUIT_MAIL_TO'),
  }
}
const mailTo = loadMailTo()

const firestoreHost = () => {
  const host = process.env.FIRESTORE_EMULATOR_HOST
  if (!host) throw new Error('Emulator 上で実行してください（npm run test:integration）')
  return host
}

let adminApp: App
let db: Firestore
const clientApp = initializeClientApp({ projectId: PROJECT_ID, apiKey: 'demo-api-key' })
const functions = getFunctions(clientApp, REGION)
connectFunctionsEmulator(functions, '127.0.0.1', firebaseConfig.emulators.functions.port)
const submitInquiry = httpsCallable<unknown, unknown>(functions, SUBMIT_INQUIRY_FUNCTION)

beforeAll(() => {
  firestoreHost()
  // Admin SDK は FIRESTORE_EMULATOR_HOST（emulators:exec が設定する）の Emulator につなぐ
  adminApp = initializeApp({ projectId: PROJECT_ID }, 'integration-test')
  db = getFirestore(adminApp)
})

afterAll(async () => {
  await deleteApp(adminApp)
  await deleteClientApp(clientApp)
})

beforeEach(async () => {
  // Firestore Emulator のデータをすべて消す
  const response = await fetch(
    `http://${firestoreHost()}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  )
  expect(response.ok).toBe(true)
})

const docsOf = async (collection: string) => (await db.collection(collection).get()).docs

// 1 件だけ保存されたことを確かめ、inquiries と mail のドキュメントを返す
const savedInquiry = async () => {
  const inquiries = await docsOf('inquiries')
  const mails = await docsOf('mail')
  expect(inquiries).toHaveLength(1)
  expect(mails).toHaveLength(1)
  const [inquiry] = inquiries
  const [mail] = mails
  if (!inquiry || !mail) throw new Error('保存されていません')
  // inquiries と mail は同じ ID
  expect(mail.id).toBe(inquiry.id)
  return { inquiry: inquiry.data(), mail: mail.data() }
}

const toDate = (value: unknown) => {
  expect(value).toBeInstanceOf(Timestamp)
  return (value as Timestamp).toDate()
}

// receivedAt は送信の前後の時刻の間で、expireAt は inquiries が 180 日後・mail が 30 日後
const expectRetention = (
  saved: Awaited<ReturnType<typeof savedInquiry>>,
  sentFrom: Date,
  sentTo: Date,
) => {
  const receivedAt = toDate(saved.inquiry.receivedAt)
  expect(receivedAt.getTime()).toBeGreaterThanOrEqual(sentFrom.getTime())
  expect(receivedAt.getTime()).toBeLessThanOrEqual(sentTo.getTime())
  expect(toDate(saved.inquiry.expireAt).getTime() - receivedAt.getTime()).toBe(180 * DAY_MS)
  expect(toDate(saved.mail.expireAt).getTime() - receivedAt.getTime()).toBe(30 * DAY_MS)
}

// 送信して受け付けられたことを確かめ、保存された内容を返す
const submitAccepted = async (payload: Record<string, unknown>) => {
  const sentFrom = new Date()
  const result = await submitInquiry(payload)
  const sentTo = new Date()
  expect(result.data).toEqual({ ok: true })
  const saved = await savedInquiry()
  expectRetention(saved, sentFrom, sentTo)
  return saved
}

// 送信して FunctionsError になることを確かめ、そのエラーを返す
const submitRejected = async (payload: unknown) => {
  const error: unknown = await submitInquiry(payload).then(
    () => undefined,
    (reason: unknown) => reason,
  )
  expect(error).toBeInstanceOf(FunctionsError)
  return error as FunctionsError
}

const expectNothingSaved = async () => {
  expect(await docsOf('inquiries')).toHaveLength(0)
  expect(await docsOf('mail')).toHaveLength(0)
}

const contact = {
  formType: 'contact',
  company: '株式会社テスト',
  name: '山田 太郎',
  tel: '03-1234-5678',
  message: 'お見積りをお願いします',
  [HONEYPOT_FIELD]: '',
} satisfies InquiryPayload

const safety = {
  formType: 'safety',
  name: '佐藤 花子',
  kana: 'サトウ ハナコ',
  company: '株式会社安全',
  tel: '045-123-4567',
  email: 'hanako@example.com',
  message: '安全講習について',
  [HONEYPOT_FIELD]: '',
} satisfies InquiryPayload

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
  school: '',
  faculty: '',
  graduation: '',
  career: '',
  note: 'よろしくお願いします',
  privacyConsent: true,
  [HONEYPOT_FIELD]: '',
} satisfies InquiryPayload

describe('submitInquiry（Emulator）', () => {
  describe('お問い合わせ（contact）', () => {
    it('検証・正規化した値を inquiries に、通知メールを mail に保存する', async () => {
      const { inquiry, mail } = await submitAccepted({
        ...contact,
        // 1 行の項目の改行は空白 1 つにする（件名に入る担当者名）
        name: '  山田\r\n太郎  ',
        // 全角の数字・ハイフンに似た文字は半角にそろえる
        tel: '０３ー１２３４ー５６７８',
        // 複数行の項目の改行コードは LF にそろえる
        message: 'お見積りを\r\nお願いします',
        // スキーマに無い項目は保存しない
        admin: true,
      })

      expect(inquiry.formType).toBe('contact')
      expect(inquiry.values).toEqual({
        company: '株式会社テスト',
        name: '山田 太郎',
        tel: '03-1234-5678',
        message: 'お見積りを\nお願いします',
      })
      // contact はメールアドレスの項目が無いため replyTo を付けない
      expect(mail).not.toHaveProperty('replyTo')
      expect(mail.to).toBe(mailTo.contact)
      expect(mail.message).toEqual({
        subject: '【ウィルフロンティア】お問い合わせ：山田 太郎 様',
        text: [
          '会社名：株式会社テスト',
          '担当者名：山田 太郎',
          '電話番号：03-1234-5678',
          '内容：',
          'お見積りを',
          'お願いします',
          '',
        ].join('\n'),
      })
    })

    it('件名に入る担当者名の改行などの制御文字は空白にする', async () => {
      const { mail } = await submitAccepted({ ...contact, name: '山田\n\n\tBcc: x@example.com' })
      const { subject } = mail.message as { subject: string }
      expect(subject).toBe('【ウィルフロンティア】お問い合わせ：山田 Bcc: x@example.com 様')
      expect(subject).not.toMatch(/[\r\n]/)
    })
  })

  describe('安全ページの問い合わせ（safety）', () => {
    it('メールアドレスを全角から半角にそろえ、返信先にする', async () => {
      const { inquiry, mail } = await submitAccepted({
        ...safety,
        email: 'ｈａｎａｋｏ＠ｅｘａｍｐｌｅ．ｃｏｍ',
      })

      expect(inquiry.formType).toBe('safety')
      expect(inquiry.values).toEqual({
        name: '佐藤 花子',
        kana: 'サトウ ハナコ',
        company: '株式会社安全',
        tel: '045-123-4567',
        email: 'hanako@example.com',
        message: '安全講習について',
      })
      expect(mail.to).toBe(mailTo.safety)
      expect(mail.replyTo).toBe('hanako@example.com')
      expect(mail.message).toEqual({
        subject: '【ウィルフロンティア】お問い合わせ',
        text: [
          '担当者名：佐藤 花子',
          'フリガナ：サトウ ハナコ',
          '会社名：株式会社安全',
          '電話番号：045-123-4567',
          'メールアドレス：hanako@example.com',
          '問い合わせ内容：安全講習について',
          '',
        ].join('\n'),
      })
    })

    it('任意項目を省略でき、メールアドレスが無ければ返信先を付けない', async () => {
      const { inquiry, mail } = await submitAccepted({
        formType: 'safety',
        name: '佐藤 花子',
        tel: '045-123-4567',
      })

      expect(inquiry.values).toEqual({
        name: '佐藤 花子',
        kana: '',
        company: '',
        tel: '045-123-4567',
        email: '',
        message: '',
      })
      expect(mail).not.toHaveProperty('replyTo')
      expect(mail.to).toBe(mailTo.safety)
    })
  })

  describe('採用応募（recruit）', () => {
    it('確認用メールアドレスは保存せず、同意は記録として残し、応募者を返信先にする', async () => {
      const { inquiry, mail } = await submitAccepted({
        ...recruit,
        // 確認用は大文字と小文字の違いを許す
        emailConfirm: 'Ichiro@Example.com',
        career: '運送会社で5年\r\n現職で3年',
      })

      expect(inquiry.formType).toBe('recruit')
      expect(inquiry.values).toEqual({
        name: '鈴木 一郎',
        kana: 'スズキ イチロウ',
        address: '神奈川県横浜市',
        tel: '080-1234-5678',
        email: 'ichiro@example.com',
        job: 'ドライバー',
        education: '高校卒業',
        school: '',
        faculty: '',
        graduation: '',
        career: '運送会社で5年\n現職で3年',
        note: 'よろしくお願いします',
        privacyConsent: true,
      })
      expect(mail.to).toBe(mailTo.recruit)
      expect(mail.replyTo).toBe('ichiro@example.com')
      expect(mail.message).toEqual({
        subject: '【ウィルフロンティア】採用応募',
        text: [
          'お名前：鈴木 一郎',
          'フリガナ：スズキ イチロウ',
          'ご住所：神奈川県横浜市',
          '電話番号：080-1234-5678',
          'メールアドレス：ichiro@example.com',
          '希望職種：ドライバー',
          '最終学歴：高校卒業',
          '学校名：',
          '卒業学部・学科：',
          '卒業年月：',
          '職歴：',
          '運送会社で5年',
          '現職で3年',
          '備考：よろしくお願いします',
          '',
        ].join('\n'),
      })
    })
  })

  describe('ボット対策（隠し項目）', () => {
    it.each([
      ['contact', contact],
      ['safety', safety],
      ['recruit', recruit],
    ])('%s: 隠し項目に値があれば成功と同じ応答を返し、保存しない', async (_, payload) => {
      const result = await submitInquiry({
        ...payload,
        [HONEYPOT_FIELD]: 'https://spam.example.com',
      })
      expect(result.data).toEqual({ ok: true })
      await expectNothingSaved()
    })

    it('入力に誤りがあっても、隠し項目に値があれば成功と同じ応答を返す', async () => {
      const result = await submitInquiry({ formType: 'contact', [HONEYPOT_FIELD]: 'spam' })
      expect(result.data).toEqual({ ok: true })
      await expectNothingSaved()
    })
  })

  describe('入力エラー', () => {
    it('invalid-argument と項目ごとのエラー（details.issues）を返し、保存しない', async () => {
      const error = await submitRejected({ ...contact, name: ' ', tel: '123' })

      expect(error.code).toBe('functions/invalid-argument')
      // SDK はメッセージの末尾に HTTP のステータス（[400]）を付ける
      expect(error.message).toContain('入力内容に誤りがあります。')
      expect(error.details).toEqual({
        issues: [
          { path: 'name', message: '担当者名を入力してください' },
          { path: 'tel', message: '電話番号を正しく入力してください' },
        ],
      })
      await expectNothingSaved()
    })

    it('採用応募の未同意とメールアドレスの不一致は、両方をそれぞれの項目のエラーにする', async () => {
      const error = await submitRejected({
        ...recruit,
        emailConfirm: 'other@example.com',
        privacyConsent: false,
      })

      expect(error.code).toBe('functions/invalid-argument')
      expect(error.details).toEqual({
        issues: [
          { path: 'privacyConsent', message: '個人情報の取り扱いに同意してください' },
          { path: 'emailConfirm', message: 'メールアドレスが一致しません' },
        ],
      })
      await expectNothingSaved()
    })

    it('採用応募の確認用メールアドレスが一致しなければ確認欄のエラーにする', async () => {
      const error = await submitRejected({ ...recruit, emailConfirm: 'other@example.com' })

      expect(error.code).toBe('functions/invalid-argument')
      expect(error.details).toEqual({
        issues: [{ path: 'emailConfirm', message: 'メールアドレスが一致しません' }],
      })
      await expectNothingSaved()
    })

    it.each([
      ['未知のフォーム種別', { ...contact, formType: 'unknown' }],
      ['フォーム種別なし', { name: '山田 太郎' }],
      ['オブジェクトでない値', 'hello'],
    ])('%s は invalid-argument にする', async (_, payload) => {
      const error = await submitRejected(payload)
      expect(error.code).toBe('functions/invalid-argument')
      await expectNothingSaved()
    })
  })
})
