import type { ReactNode } from 'react'
import { FadeUp } from '~/components/motion/FadeUp'
import { HeadingReveal } from '~/components/motion/HeadingReveal'

type SectionHeaderProps = {
  // 見出しの id（セクションの aria-labelledby から参照する）
  id: string
  // 見出しの上の英字（OUR BUSINESS など）
  eyebrow: string
  children: ReactNode
  lead?: ReactNode
  // md: 小さめ（地域と共に・車両ギャラリー）/ lg: 大きめ（事業内容など）
  size?: 'md' | 'lg'
  // 見出しの下に黄色の線を引くか（旧 .yellow-underline）
  underline?: boolean
  // 見出しの色。写真の上に置く場合は白にする
  tone?: 'navy' | 'white'
  className?: string
}

const SIZES = {
  md: 'text-3xl md:text-4xl',
  lg: 'text-4xl md:text-5xl',
} as const

// 見出しの下の黄色の線（旧 .yellow-underline）。見出しに relative inline-block を含めて付ける
export const UNDERLINE_CLASS =
  'relative inline-block pb-3.5 after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-xs after:bg-wf-yellow'

// 下層ページの各セクションの見出し（英字の小見出し＋日本語の見出し＋説明文）
// 旧実装の英字の字間 tracking-[0.3em] は旧 CSS に含まれず表示されていなかったため付けない
export function SectionHeader({
  id,
  eyebrow,
  children,
  lead,
  size = 'lg',
  underline = false,
  tone = 'navy',
  className = 'mb-16',
}: SectionHeaderProps) {
  return (
    <div className={`text-center ${className}`}>
      <FadeUp
        as="p"
        className={`mb-3 text-sm font-bold ${tone === 'white' ? 'text-wf-sky' : 'text-wf-blue'}`}
      >
        {eyebrow}
      </FadeUp>
      <HeadingReveal
        as="h2"
        id={id}
        className={`font-black tracking-wider [word-break:auto-phrase] ${SIZES[size]} ${tone === 'white' ? 'text-white [text-shadow:0_2px_12px_rgb(0_0_0/0.6)]' : 'text-wf-navy'} ${underline ? UNDERLINE_CLASS : ''}`}
      >
        {children}
      </HeadingReveal>
      {lead && (
        <FadeUp as="p" className="mt-4 text-sm text-wf-text-mid md:text-base">
          {lead}
        </FadeUp>
      )}
    </div>
  )
}
