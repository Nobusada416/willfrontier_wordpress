import { useId } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { RequiredBadge } from './RequiredBadge'

type TextFieldProps = {
  label: string
  registration: UseFormRegisterReturn
  error?: string | undefined
  // 入力欄の下に出す補足（「確認のため、もう一度ご入力ください。」など）
  description?: string
  required?: boolean
  type?: 'text' | 'tel' | 'email'
  autoComplete?: string
  placeholder?: string
  multiline?: boolean
  rows?: number
  // boxed: 枠で囲んだ入力欄（お問い合わせページ）/ bracket: ［ ］で挟んだ下線の入力欄（安全・採用ページ）
  variant?: 'boxed' | 'bracket'
  // ラベルの列の幅など（PC で横に並べるときの幅はフォームごとに違う）
  labelClassName?: string
}

const VARIANTS = {
  boxed: {
    row: 'flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3',
    label: 'shrink-0 text-xs font-bold text-wf-ink sm:pt-2 sm:text-right',
    control:
      'w-full rounded-[3px] border border-wf-field-border bg-white px-3 py-2 text-base text-gray-800 transition-colors outline-none focus:border-wf-navy focus:bg-slate-50 aria-invalid:border-wf-danger md:text-[13px]',
  },
  bracket: {
    row: 'flex flex-col gap-1 font-bold text-wf-ink sm:flex-row sm:items-start sm:gap-4',
    label: 'shrink-0 sm:pt-1.5',
    control:
      'w-full min-w-0 border-b border-wf-border bg-transparent py-1.5 text-base font-medium outline-none focus:border-wf-navy aria-invalid:border-wf-danger',
  },
} as const

// フォームの 1 項目（ラベル・入力欄・補足・エラー）
// 旧フォームはラベルと入力欄を結び付けていない項目があり、エラーもページ上部にまとめて出すだけだった。
// ラベルを結び付け、エラーは項目の下に出して入力欄の説明として読み上げさせる
export function TextField({
  label,
  registration,
  error,
  description,
  required = false,
  type = 'text',
  autoComplete,
  placeholder,
  multiline = false,
  rows = 4,
  variant = 'boxed',
  labelClassName = '',
}: TextFieldProps) {
  const id = useId()
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const describedBy = [description && descriptionId, error && errorId].filter(Boolean).join(' ')
  const styles = VARIANTS[variant]

  const controlProps = {
    id,
    ...registration,
    placeholder,
    autoComplete,
    'aria-required': required,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy || undefined,
    className: `${styles.control} ${multiline ? 'resize-y' : ''}`,
  }
  const control = multiline ? (
    <textarea rows={rows} {...controlProps} />
  ) : (
    <input type={type} {...controlProps} />
  )

  return (
    <div className={styles.row}>
      <label htmlFor={id} className={`${styles.label} ${labelClassName}`}>
        {label}
        {required && <RequiredBadge />}
      </label>
      <div className="min-w-0 flex-1">
        {variant === 'bracket' ? (
          <div className="flex items-start">
            <span aria-hidden="true" className="mr-2 pt-1.5">
              ［
            </span>
            {control}
            <span aria-hidden="true" className="ml-2 pt-1.5">
              ］
            </span>
          </div>
        ) : (
          control
        )}
        {description && (
          <p id={descriptionId} className="mt-1 text-xs font-medium text-wf-text-mid">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-xs font-bold text-wf-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
