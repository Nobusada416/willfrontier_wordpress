// サイト上のフォーム種別
// contact: お問い合わせページ / safety: 安全ページ下部の問い合わせ / recruit: 採用応募
export const FORM_TYPES = ['contact', 'safety', 'recruit'] as const

export type FormType = (typeof FORM_TYPES)[number]

export const isFormType = (value: unknown): value is FormType =>
  typeof value === 'string' && (FORM_TYPES as readonly string[]).includes(value)
