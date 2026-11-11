import { FORM_FIELDS, type Inquiry } from '@wf/shared'

// Trigger Email 拡張（firestore-send-email）が mail コレクションから読み取る形式
export type Mail = {
  to: string
  replyTo?: string
  message: { subject: string; text: string }
}

const SUBJECT_PREFIX = '【ウィルフロンティア】'

// 制御文字（C0・DEL・C1 = \p{Cc}）と行区切り・段落区切り（\p{Zl}・\p{Zp}）
const CONTROL_CHARS = /[\p{Cc}\p{Zl}\p{Zp}]+/gu
// 本文で残す改行とタブ以外の制御文字
const CONTROL_CHARS_EXCEPT_LF_TAB = /[^\P{Cc}\n\t]/gu

// 件名に入れる値。改行が入るとメールヘッダー・インジェクションになり得るため、制御文字を空白 1 つにする
const toSingleLine = (value: string) => value.replace(CONTROL_CHARS, ' ').trim()

// 本文に入れる値。改行コードを LF にそろえ、改行・タブ以外の制御文字を取り除く
const toPlainText = (value: string) =>
  value.replace(/\r\n?|[\p{Zl}\p{Zp}]/gu, '\n').replace(CONTROL_CHARS_EXCEPT_LF_TAB, '')

// 件名は旧テンプレート（page-*.php）の wp_mail と同じ
const subjectOf = (inquiry: Inquiry) => {
  switch (inquiry.formType) {
    case 'contact':
      return `${SUBJECT_PREFIX}お問い合わせ：${toSingleLine(inquiry.name)} 様`
    case 'safety':
      return `${SUBJECT_PREFIX}お問い合わせ`
    case 'recruit':
      return `${SUBJECT_PREFIX}採用応募`
  }
}

// 本文は旧テンプレートと同じく「項目名：値」を 1 行ずつ。複数行の値は項目名の次の行から載せる
const bodyOf = (inquiry: Inquiry) => {
  const values: Readonly<Record<string, unknown>> = inquiry
  return FORM_FIELDS[inquiry.formType]
    .map(({ name, label }) => {
      const value = toPlainText(String(values[name] ?? ''))
      return value.includes('\n') ? `${label}：\n${value}\n` : `${label}：${value}\n`
    })
    .join('')
}

// 返信先。メールアドレスの項目があり、入力されている場合だけ付ける
const replyToOf = (inquiry: Inquiry) =>
  inquiry.formType !== 'contact' && inquiry.email !== '' ? inquiry.email : undefined

export const buildMail = (inquiry: Inquiry, to: string): Mail => {
  const replyTo = replyToOf(inquiry)
  return {
    to,
    ...(replyTo === undefined ? {} : { replyTo }),
    message: { subject: subjectOf(inquiry), text: bodyOf(inquiry) },
  }
}
