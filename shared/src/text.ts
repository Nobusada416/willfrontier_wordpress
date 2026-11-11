import { z } from 'zod'

// zod v4 は検証を速くするため new Function が使えるかを試す。CSP で unsafe-eval を許可していないと
// 失敗しても動作は変わらないが、ブラウザが違反として報告するため、試さない設定にする（入力項目が少なく速度差は無い）
// zod 全体の設定のため、このモジュールを読み込む Cloud Functions（Node）にも効く（CSP は無関係だが実害も無い）。
// スキーマを定義するモジュールは、ここの部品を使うことで必ずこの設定を読み込む
z.config({ jitless: true })

// フォーム（お問い合わせ・施工事例の管理画面）で共通の文字列の入力チェックの部品

export const requiredMessage = (label: string) => `${label}を入力してください`
export const maxMessage = (label: string, max: number) =>
  `${label}は${max}文字以内で入力してください`

// 1 行の項目に入った改行・タブ・制御文字を空白にする。
// 旧実装の sanitize_text_field と同じく、メールの件名や「項目名：値」の行を偽装されないようにする
// 制御文字（C0・C1）と Unicode の行区切り・段落区切り
const LINE_BREAKING_CHARS = /[\p{Cc}\p{Zl}\p{Zp}]+/gu
const toSingleLine = (value: string) => value.replace(LINE_BREAKING_CHARS, ' ')

// 複数行の項目は改行を \n にそろえて残し、そのほかの制御文字を取り除く
const NEWLINES = /\r\n?|[\u2028\u2029]/g
const CONTROL_CHARS_EXCEPT_NEWLINE = /[^\P{Cc}\n]/gu
const toMultiline = (value: string) =>
  value.replace(NEWLINES, '\n').replace(CONTROL_CHARS_EXCEPT_NEWLINE, '')

export type TextOptions = { multiline?: boolean }

const cleanText = ({ multiline = false }: TextOptions) =>
  z.string().transform((value) => (multiline ? toMultiline(value) : toSingleLine(value)).trim())

// 必須の文字列。前後の空白を除いてから判定し、未入力のときは「入力してください」だけを出す
export const requiredText = (label: string, max: number, options: TextOptions = {}) =>
  cleanText(options).pipe(
    z
      .string()
      .min(1, { error: requiredMessage(label), abort: true })
      .max(max, maxMessage(label, max)),
  )

// 任意の文字列（未入力は空文字として扱う）
export const optionalText = (label: string, max: number, options: TextOptions = {}) =>
  z
    .string()
    .default('')
    .pipe(cleanText(options))
    .pipe(z.string().max(max, maxMessage(label, max)))
