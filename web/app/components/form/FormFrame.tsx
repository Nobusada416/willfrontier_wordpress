import type { ReactNode } from 'react'

type FormFrameProps = {
  // 枠の見出しの id（form の aria-labelledby から参照してフォームの名前にする）
  titleId: string
  title: string
  // 枠線の色・内側の余白
  className?: string
  children: ReactNode
}

// 見出しを枠線の上に重ねたフォームの枠（安全・採用ページ）
// 旧実装は absolute の div を枠線の上に重ねていた。fieldset と legend で同じ見た目を作り、項目のまとまりも伝える
export function FormFrame({ titleId, title, className = '', children }: FormFrameProps) {
  return (
    <fieldset className={`min-w-0 rounded-xs border-[1.5px] ${className}`}>
      <legend
        id={titleId}
        className="mx-auto px-4 text-center text-lg font-black tracking-[0.1em] text-wf-navy [word-break:auto-phrase] sm:text-2xl sm:tracking-[0.15em]"
      >
        {title}
      </legend>
      {children}
    </fieldset>
  )
}
