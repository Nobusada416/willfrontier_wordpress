import type { ReactNode } from 'react'
import { Link } from 'react-router'

type MoreLinkProps = {
  to: string
  children: ReactNode
  // 同じ文言のリンクが並ぶため、読み上げ時に行き先を区別する補足（画面には表示しない）
  context?: string
  // pill: 丸いボタン（既定）/ block: 角丸の大きなボタン（採用の「応募する」）
  variant?: 'pill' | 'block'
  // 文字サイズ（指定すると種類ごとの既定を付けない。同じ種類のクラスを並べると、
  // どちらが効くかが記述順ではなく Tailwind の出力順で決まるため）
  textClassName?: string
  className?: string
}

const VARIANTS = {
  pill: { box: 'rounded-full px-7 py-4 sm:px-18', text: 'text-xl' },
  block: { box: 'rounded-md px-16 py-6 sm:px-30', text: 'text-2xl' },
} as const

// セクション末尾の「もっと見る ▼」ボタン（旧実装ではインライン style で 8 か所に重複していた）
export function MoreLink({
  to,
  children,
  context,
  variant = 'pill',
  textClassName,
  className = '',
}: MoreLinkProps) {
  const { box, text } = VARIANTS[variant]
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 bg-wf-blue font-black tracking-wider [word-break:keep-all] text-white sm:tracking-widest transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wf-blue ${box} ${textClassName ?? text} ${className}`}
    >
      {children}
      {context && <span className="sr-only">（{context}）</span>}
      <span aria-hidden="true">▼</span>
    </Link>
  )
}
