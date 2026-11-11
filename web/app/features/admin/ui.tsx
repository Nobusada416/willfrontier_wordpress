import type { CaseStudyStatus } from '@wf/shared'
import { useEffect, useId, useRef, type ReactNode } from 'react'

// 管理画面で共通の見た目の部品（色・文字はサイトのデザイントークン。app.css の @theme）
// ボタンの横の余白（px-*）は使う場所ごとに付ける

// 全画面共通のタイトル「ウィルフロンティア」「ホームページ管理画面」（2 行）
export function AdminTitleLines() {
  return (
    <>
      ウィルフロンティア
      <br />
      ホームページ管理画面
    </>
  )
}

// ログイン前（ログイン・読み込み中）の、中央に寄せた画面
export function CenteredScreen({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-wf-bg px-4 py-12 text-wf-ink">
      <div className="flex w-full max-w-[420px] flex-col gap-7">
        <div className="flex flex-col items-center gap-2">
          <p className="font-en text-sm font-bold tracking-[0.08em] text-wf-blue">
            WILL FRONTIER ADMIN
          </p>
          <h1 className="text-center text-[26px] leading-normal font-bold text-wf-navy">
            <AdminTitleLines />
          </h1>
        </div>
        {children}
      </div>
    </main>
  )
}

export const CARD_CLASS = 'rounded-xl border border-wf-border bg-white'

export const INPUT_CLASS =
  'h-12 w-full rounded-lg border border-wf-field-border bg-white px-3.5 text-base text-wf-ink outline-none focus:border-wf-navy focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-wf-blue aria-invalid:border-2 aria-invalid:border-wf-danger'

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wf-blue'

export const BUTTON_CLASS = {
  // 塗りの主ボタン（ログイン・公開して保存・新規作成）
  primary: `inline-flex items-center justify-center gap-2 rounded-full bg-wf-blue font-bold text-white transition-colors hover:bg-wf-blue-hover disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`,
  // 枠だけのボタン（下書き保存・公開する）
  secondary: `inline-flex items-center justify-center gap-2 rounded-full border border-wf-blue bg-white font-bold text-wf-blue transition-colors hover:bg-wf-surface disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`,
  // 削除
  danger: `inline-flex items-center justify-center gap-2 rounded-full border border-wf-danger bg-white font-bold text-wf-danger transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`,
  // 確認ダイアログの「削除する」
  dangerFilled: `inline-flex items-center justify-center rounded-full bg-wf-danger font-bold text-white transition-colors hover:bg-[#a5301f] disabled:opacity-60 ${FOCUS_RING}`,
  // 確認ダイアログの「やめる」
  neutral: `inline-flex items-center justify-center rounded-full border border-wf-field-border bg-white text-wf-ink transition-colors hover:bg-wf-surface ${FOCUS_RING}`,
} as const

export const LINK_CLASS = `text-wf-blue underline-offset-2 hover:text-wf-blue-hover hover:underline ${FOCUS_RING}`

export const STATUS_LABEL: Record<CaseStudyStatus, string> = {
  published: '公開中',
  draft: '下書き',
}

// 状態のバッジ（公開中＝青／下書き＝灰）
export function StatusBadge({ status }: { status: CaseStudyStatus }) {
  const color = status === 'published' ? 'bg-wf-blue text-white' : 'bg-gray-200 text-wf-ink'
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-[13px] leading-tight font-bold ${color}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

// 項目に付ける「必須」
export function RequiredMark({ children = '必須' }: { children?: ReactNode }) {
  return <span className="ml-1.5 text-xs font-bold text-wf-danger">{children}</span>
}

type ControlProps = {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
  'aria-required': boolean | undefined
}

type FieldProps = {
  label: ReactNode
  required?: boolean
  error?: string | undefined
  // 入力欄の下に出す補足（文字数など）
  hint?: ReactNode
  labelClassName?: string
  children: (props: ControlProps) => ReactNode
}

// ラベル・入力欄・補足・エラー（エラーは項目の下に赤字で出し、入力欄の説明として読み上げる）
export function Field({ label, required, error, hint, labelClassName = '', children }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint !== undefined && hintId, error && errorId].filter(Boolean).join(' ')
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={`text-[15px] font-bold text-wf-navy ${labelClassName}`}>
        {label}
        {required && <RequiredMark />}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy || undefined,
        'aria-required': required || undefined,
      })}
      {hint !== undefined && (
        <p id={hintId} className="text-[13px] text-wf-text-mid">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-bold text-wf-danger">
          {error}
        </p>
      )}
    </div>
  )
}

// 操作の結果の通知（role=status）
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-wf-notice-border bg-wf-notice px-4 py-3 text-sm text-wf-ink"
    >
      {children}
    </div>
  )
}

// 失敗の通知（role=alert）
export function ErrorNotice({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-wf-danger bg-red-50 px-4 py-3 text-sm font-bold text-wf-danger"
    >
      {children}
    </div>
  )
}

type ConfirmDialogProps = {
  title: string
  children: ReactNode
  cancelLabel: string
  confirmLabel: string
  // 確定のボタンを赤（削除）にするか
  danger?: boolean
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

// 確認ダイアログ（ネイティブの <dialog> をモーダルで開く。Esc で閉じるとやめる扱い）。
// 開いているときだけ描画する
export function ConfirmDialog({
  title,
  children,
  cancelLabel,
  confirmLabel,
  danger = false,
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
      className="m-auto w-[90%] max-w-[440px] rounded-xl border border-wf-border bg-white p-7 text-wf-ink shadow-[0_12px_32px_rgb(26_58_92/0.18)] backdrop:bg-black/40"
    >
      <h2 id={titleId} className="text-lg font-bold text-wf-navy">
        {title}
      </h2>
      <div className="mt-4 text-[15px] leading-relaxed">{children}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className={`h-11 px-5 ${BUTTON_CLASS.neutral}`}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`h-11 px-5 ${danger ? BUTTON_CLASS.dangerFilled : BUTTON_CLASS.primary}`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

// 一覧への移動で通知を渡すときの state
export type ListNoticeState = { notice: string }

export const readListNotice = (state: unknown): string | undefined =>
  typeof state === 'object' &&
  state !== null &&
  'notice' in state &&
  typeof state.notice === 'string'
    ? state.notice
    : undefined
