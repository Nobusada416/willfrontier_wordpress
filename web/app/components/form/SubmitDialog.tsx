import { useEffect, useId, useRef, type ReactNode } from 'react'

type SubmitDialogProps = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

// 送信完了のダイアログ
// 旧実装は送信後に ?sent=1 付きの URL へ移動してモーダルを出し、「閉じる」で history.back() していた。
// ページを移動せずにネイティブの <dialog> をモーダルで開く（フォーカスの閉じ込め・Esc で閉じる・
// 閉じたあと元の場所へフォーカスを戻す動きはブラウザに任せる）
export function SubmitDialog({ open, title, children, onClose }: SubmitDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[90%] max-w-[480px] rounded-xl bg-white px-8 py-12 text-center shadow-[0_8px_40px_rgb(0_0_0/0.2)] backdrop:bg-black/50 sm:px-14"
    >
      <p aria-hidden="true" className="mb-4 text-[56px] leading-none">
        ✅
      </p>
      <h2 id={titleId} className="mb-3 text-[1.6rem] font-black text-wf-navy">
        {title}
      </h2>
      <p className="mb-8 leading-[1.8] font-bold text-wf-ink">{children}</p>
      <button
        type="button"
        onClick={() => dialogRef.current?.close()}
        className="rounded-full bg-wf-blue px-[60px] py-3.5 text-[1.1rem] font-black text-white transition-colors hover:bg-wf-blue-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wf-blue"
      >
        閉じる
      </button>
    </dialog>
  )
}
