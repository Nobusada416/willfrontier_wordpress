import { z } from 'zod'
import type { FormType } from './formTypes'
import { normalizeEmail, normalizeTel } from './normalize'

// 3 つのフォームの入力チェック。画面（react-hook-form）と送信処理（Cloud Functions）の両方で同じものを使う。
// 必須項目は旧フォーム（page-contact.php / page-safety.php / page-recruit.php）の必須チェックに合わせる

const requiredMessage = (label: string) => `${label}を入力してください`
const maxMessage = (label: string, max: number) => `${label}は${max}文字以内で入力してください`

// 1 行の項目に入った改行・タブ・制御文字を空白にする。
// 旧実装の sanitize_text_field と同じく、メールの件名や「項目名：値」の行を偽装されないようにする
// eslint-disable-next-line no-control-regex -- 制御文字を取り除くための正規表現
const CONTROL_CHARS = /[\u0000-\u001f\u007f]+/g
const toSingleLine = (value: string) => value.replace(CONTROL_CHARS, ' ')

// 複数行の項目は改行（\n）だけを残し、そのほかの制御文字を取り除く
// eslint-disable-next-line no-control-regex -- 制御文字を取り除くための正規表現
const CONTROL_CHARS_EXCEPT_NEWLINE = /[\u0000-\u0009\u000b-\u001f\u007f]/g
const toMultiline = (value: string) =>
  value.replace(/\r\n?/g, '\n').replace(CONTROL_CHARS_EXCEPT_NEWLINE, '')

type TextOptions = { multiline?: boolean }

const cleanText = ({ multiline = false }: TextOptions) =>
  z.string().transform((value) => (multiline ? toMultiline(value) : toSingleLine(value)).trim())

// 必須の文字列。前後の空白を除いてから判定し、未入力のときは「入力してください」だけを出す
const requiredText = (label: string, max: number, options: TextOptions = {}) =>
  cleanText(options).pipe(
    z
      .string()
      .min(1, { error: requiredMessage(label), abort: true })
      .max(max, maxMessage(label, max)),
  )

// 任意の文字列（未入力は空文字として扱う）
const optionalText = (label: string, max: number, options: TextOptions = {}) =>
  z
    .string()
    .default('')
    .pipe(cleanText(options))
    .pipe(z.string().max(max, maxMessage(label, max)))

// 電話番号: 数字・ハイフン・括弧・空白（国番号の + も可）で 25 文字以内、数字が 10〜15 桁
const TEL_MAX = 25
const isTel = (value: string) => {
  const digits = value.replace(/\D/g, '').length
  return (
    value.length <= TEL_MAX && /^\+?[\d\-() ]+$/.test(value) && digits >= 10 && digits <= 15
  )
}

const telField = (label: string) =>
  z
    .string()
    .transform(normalizeTel)
    .pipe(
      z
        .string()
        .min(1, { error: requiredMessage(label), abort: true })
        .refine(isTel, `${label}を正しく入力してください`),
    )

const EMAIL_MAX = 254
const EMAIL_MESSAGE = 'メールアドレスを正しく入力してください'
const emailFormat = z.email()
const isEmail = (value: string) => value.length <= EMAIL_MAX && emailFormat.safeParse(value).success

const requiredEmail = (label: string) =>
  z
    .string()
    .transform(normalizeEmail)
    .pipe(
      z
        .string()
        .min(1, { error: requiredMessage(label), abort: true })
        .refine(isEmail, EMAIL_MESSAGE),
    )

const optionalEmail = z
  .string()
  .default('')
  .transform(normalizeEmail)
  .refine((value) => value === '' || isEmail(value), EMAIL_MESSAGE)

// ボット対策の隠し項目。人には見えない欄のため、値が入っていればボットとみなす。
// 検証エラーにするとボットに対策を学習されるため、ここでは受け付けて送信処理で黙って捨てる。
// website・url などの名前はブラウザの自動入力が値を入れ、人の送信を捨ててしまうおそれがあるため避ける
export const HONEYPOT_FIELD = 'wf_hp'
const honeypot = { [HONEYPOT_FIELD]: z.string().optional() } as const

export const isSpam = (value: { [HONEYPOT_FIELD]?: string | undefined }) =>
  Boolean(value[HONEYPOT_FIELD]?.trim())

const MESSAGE_MAX = 2000

const contactShape = {
  company: optionalText('会社名', 100),
  name: requiredText('担当者名', 50),
  tel: telField('電話番号'),
  message: requiredText('内容', MESSAGE_MAX, { multiline: true }),
  ...honeypot,
}

const safetyShape = {
  name: requiredText('担当者名', 50),
  kana: optionalText('フリガナ', 50),
  company: optionalText('会社名', 100),
  tel: telField('電話番号'),
  email: optionalEmail,
  message: optionalText('問い合わせ内容', MESSAGE_MAX, { multiline: true }),
  ...honeypot,
}

const recruitShape = {
  name: requiredText('お名前', 50),
  kana: requiredText('フリガナ', 50),
  address: requiredText('ご住所', 200),
  tel: telField('電話番号'),
  email: requiredEmail('メールアドレス'),
  emailConfirm: requiredEmail('確認用のメールアドレス'),
  job: requiredText('希望職種', 50),
  education: requiredText('最終学歴', 50),
  school: optionalText('学校名', 100),
  faculty: optionalText('卒業学部・学科', 100),
  graduation: optionalText('卒業年月', 50),
  career: optionalText('職歴', 500, { multiline: true }),
  note: requiredText('備考', MESSAGE_MAX, { multiline: true }),
  // 旧フォームには無かったが、応募者の個人情報を受け取るため同意を必須にする
  // チェックボックスは未チェック（false）から始まるため、型は boolean にして true だけを通す
  privacyConsent: z.boolean().refine((value) => value, '個人情報の取り扱いに同意してください'),
  ...honeypot,
}

// 確認用のメールアドレスが一致すること（エラーは確認欄に出す）。大文字と小文字の違いは無視する
const emailsMatch = (value: { email: string; emailConfirm: string }) =>
  value.email.toLowerCase() === value.emailConfirm.toLowerCase()
const EMAILS_MISMATCH = { error: 'メールアドレスが一致しません', path: ['emailConfirm'] }

export const contactSchema = z.object(contactShape)
export const safetySchema = z.object(safetyShape)
export const recruitSchema = z.object(recruitShape).refine(emailsMatch, EMAILS_MISMATCH)

// 送信処理が受け取る値。formType でどのフォームかを見分ける（スキーマに無い項目は取り除かれる）
export const inquirySchema = z.discriminatedUnion('formType', [
  z.object({ formType: z.literal('contact'), ...contactShape }),
  z.object({ formType: z.literal('safety'), ...safetyShape }),
  z.object({ formType: z.literal('recruit'), ...recruitShape }).refine(emailsMatch, EMAILS_MISMATCH),
])

export type ContactInput = z.input<typeof contactSchema>
export type ContactValues = z.output<typeof contactSchema>
export type SafetyInput = z.input<typeof safetySchema>
export type SafetyValues = z.output<typeof safetySchema>
export type RecruitInput = z.input<typeof recruitSchema>
export type RecruitValues = z.output<typeof recruitSchema>
// 画面から送る値 / 検証後の値
export type InquiryPayload = z.input<typeof inquirySchema>
export type Inquiry = z.output<typeof inquirySchema>

type FieldOf<T extends FormType> = Extract<Inquiry, { formType: T }>

// メール本文に載せる項目と順番（画面の項目名と同じ）。確認用メールアドレス・同意・隠し項目は載せない
type FormFields = {
  [T in FormType]: readonly { name: keyof FieldOf<T> & string; label: string }[]
}

export const FORM_FIELDS = {
  contact: [
    { name: 'company', label: '会社名' },
    { name: 'name', label: '担当者名' },
    { name: 'tel', label: '電話番号' },
    { name: 'message', label: '内容' },
  ],
  safety: [
    { name: 'name', label: '担当者名' },
    { name: 'kana', label: 'フリガナ' },
    { name: 'company', label: '会社名' },
    { name: 'tel', label: '電話番号' },
    { name: 'email', label: 'メールアドレス' },
    { name: 'message', label: '問い合わせ内容' },
  ],
  recruit: [
    { name: 'name', label: 'お名前' },
    { name: 'kana', label: 'フリガナ' },
    { name: 'address', label: 'ご住所' },
    { name: 'tel', label: '電話番号' },
    { name: 'email', label: 'メールアドレス' },
    { name: 'job', label: '希望職種' },
    { name: 'education', label: '最終学歴' },
    { name: 'school', label: '学校名' },
    { name: 'faculty', label: '卒業学部・学科' },
    { name: 'graduation', label: '卒業年月' },
    { name: 'career', label: '職歴' },
    { name: 'note', label: '備考' },
  ],
} as const satisfies FormFields
