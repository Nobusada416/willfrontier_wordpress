type PillSubmitButtonProps = {
  label: string
  submitting: boolean
  className?: string
}

// 安全・採用ページの丸い送信ボタン（「送信する ▼」「応募する ▼」）。送信中は押せなくして二重送信を防ぐ
export function PillSubmitButton({ label, submitting, className = '' }: PillSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className={`inline-flex items-center gap-2 rounded-full bg-wf-blue py-[18px] font-black tracking-[0.1em] text-white transition-colors hover:bg-wf-blue-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wf-blue disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {submitting ? '送信中…' : label}
      <span aria-hidden="true">▼</span>
    </button>
  )
}
