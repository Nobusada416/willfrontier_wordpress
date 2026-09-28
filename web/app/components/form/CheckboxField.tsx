import { useId, type ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

type CheckboxFieldProps = {
  label: string
  registration: UseFormRegisterReturn
  error?: string | undefined
  // チェックの前に読んでほしい説明（個人情報の利用目的など）
  description?: ReactNode
  required?: boolean
}

// 同意などのチェックボックス。説明とエラー文をチェックボックスの説明として読み上げさせる
export function CheckboxField({
  label,
  registration,
  error,
  description,
  required = false,
}: CheckboxFieldProps) {
  const id = useId()
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const describedBy = [description && descriptionId, error && errorId].filter(Boolean).join(' ')

  return (
    <div className="text-center">
      {description && (
        <p id={descriptionId} className="mb-2 text-sm font-medium text-wf-ink">
          {description}
        </p>
      )}
      <label htmlFor={id} className="inline-flex items-center gap-2 font-bold text-wf-ink">
        <input
          id={id}
          type="checkbox"
          {...registration}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className="size-5 accent-wf-navy"
        />
        {label}
      </label>
      {error && (
        <p id={errorId} className="mt-1 text-xs font-bold text-wf-danger">
          {error}
        </p>
      )}
    </div>
  )
}
