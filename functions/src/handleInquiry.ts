import {
  HONEYPOT_FIELD,
  inquirySchema,
  isSpam,
  type FieldIssue,
  type FormType,
  type Inquiry,
} from '@wf/shared'
import { buildMail } from './buildMail'

// 問い合わせの受け付け処理（Firebase に依存しない部分）。
// ボット判定 → 入力チェック → 保存するドキュメントの組み立て → 保存 の順に行う

// 保持期間（Firestore の TTL で削除する）。
// inquiries は問い合わせへの対応に必要な期間として 180 日（提案。確定は docs/forms.md の確認事項）。
// mail は本文に同じ個人情報を含み、送信結果の確認にしか使わないため短くする
export const INQUIRY_RETENTION_DAYS = 180
export const MAIL_RETENTION_DAYS = 30

export const INQUIRIES_COLLECTION = 'inquiries'
export const MAIL_COLLECTION = 'mail'

const DAY_MS = 24 * 60 * 60 * 1000

// 1 件の書き込み（ドキュメントのパスと内容）。日時は Date で渡し、Admin SDK が Timestamp に変換する
export type Write = { path: string; data: Record<string, unknown> }

export type InquiryDeps = {
  now: () => Date
  // inquiries と mail で共通のドキュメント ID を払い出す
  newId: () => string
  // フォーム種別ごとの通知先メールアドレス
  mailTo: (formType: FormType) => string
  // すべての書き込みを 1 つの batch でまとめて行う（どちらか一方だけ保存されることを防ぐ）
  save: (writes: Write[]) => Promise<void>
}

export type InquiryResult =
  | { kind: 'accepted'; id: string; formType: FormType }
  | { kind: 'spam' }
  | { kind: 'invalid'; issues: FieldIssue[] }

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS)

// 保存しない項目。確認用メールアドレスは同じ値の重複、隠し項目はボット対策用。formType は別に保存する
const EXCLUDED_KEYS: ReadonlySet<string> = new Set(['formType', 'emailConfirm', HONEYPOT_FIELD])

const valuesToStore = (inquiry: Inquiry) =>
  Object.fromEntries(Object.entries(inquiry).filter(([key]) => !EXCLUDED_KEYS.has(key)))

// 検証の前に、受け取った値の隠し項目だけを見てボットかを判定する
// （検証エラーの詳細を返すと、ボットにどの項目が必要かを教えてしまうため）
const isSpamPayload = (data: unknown) => {
  if (typeof data !== 'object' || data === null) return false
  const honeypot: unknown = Reflect.get(data, HONEYPOT_FIELD)
  return typeof honeypot === 'string' && isSpam({ [HONEYPOT_FIELD]: honeypot })
}

export const handleInquiry = async (data: unknown, deps: InquiryDeps): Promise<InquiryResult> => {
  // ボットには成功と同じ応答を返し、保存もメール送信もしない
  if (isSpamPayload(data)) return { kind: 'spam' }

  const parsed = inquirySchema.safeParse(data)
  if (!parsed.success) {
    return {
      kind: 'invalid',
      // 項目はネストしないが、zod の path は配列のため `.` で連結する（項目に紐づかないエラーは空文字）
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.map(String).join('.'),
        message: issue.message,
      })),
    }
  }

  const inquiry = parsed.data

  const to = deps.mailTo(inquiry.formType).trim()
  if (to === '') throw new Error(`${inquiry.formType} の宛先（通知先メールアドレス）が未設定です`)

  const id = deps.newId()
  const receivedAt = deps.now()
  await deps.save([
    {
      path: `${INQUIRIES_COLLECTION}/${id}`,
      data: {
        formType: inquiry.formType,
        values: valuesToStore(inquiry),
        receivedAt,
        expireAt: addDays(receivedAt, INQUIRY_RETENTION_DAYS),
      },
    },
    {
      path: `${MAIL_COLLECTION}/${id}`,
      data: {
        ...buildMail(inquiry, to),
        expireAt: addDays(receivedAt, MAIL_RETENTION_DAYS),
      },
    },
  ])
  return { kind: 'accepted', id, formType: inquiry.formType }
}
