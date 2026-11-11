import type { ReactNode } from 'react'
import { HeadingReveal } from '~/components/motion/HeadingReveal'
import { Leaf } from '~/components/motion/Leaf'

type HomeSectionProps = {
  id: string
  title: string
  // 葉の配置。セクションごとに交互に入れ替える
  // a: 左上・右下（MISSION / WORKFLOW / CASE STUDY / RECRUIT）
  // b: 左下・右上（SERVICE / VEHICLES / SAFETY / COMPANY）
  leaves?: 'a' | 'b'
  // 背景（写真の切り替えやイラスト）。セクションいっぱいに敷く
  background?: ReactNode
  // 見出しに足すクラス（文字の影など）
  titleClassName?: string
  // 見出しの下に添える説明文
  lead?: ReactNode
  // 内側の余白（既定は左右 8vw）
  innerClassName?: string
  // 見出しの下に黄色の線を引くか（旧 .yellow-underline。GALLERY と COMPANY には無い）
  underline?: boolean
  className?: string
  children: ReactNode
}

// 葉は PC では旧デザインどおりセクションの高さいっぱいに文字の上へ重ねる
// スマホでは文字に重なって読みにくくなるため表示しない（旧実装も画像を隠し、代わりの背景タイルは表示されていなかった）
const LEAF_CLASS = 'z-40 opacity-95 max-lg:hidden'

const UNDERLINE_CLASS =
  'pb-3.5 after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-xs after:bg-wf-yellow'

// 見出しの色・フォント・背景色・上下の余白は、旧 style.css 末尾のトップ用の上書き（!important）で
// 実際に表示されていた値に合わせている（テンプレートに書かれていたクラスとは異なる）
// isolate: セクション内の重なり順（葉の z-40 など）を閉じ込め、固定ヘッダーの上に出ないようにする
// トップページの各セクションの共通の枠
// 旧実装は COMPANY を transform: scale() で画面の高さに縮小し、スマホでは全セクションを高さ 1000px に固定していた。
// どちらもやめ、高さは中身に合わせる（PC の見た目は旧サイトと同じ。旧 CSS には最小高さのクラスが含まれていなかった）
export function HomeSection({
  id,
  title,
  leaves,
  background,
  titleClassName = '',
  lead,
  underline = true,
  innerClassName = 'px-[8vw]',
  className = '',
  children,
}: HomeSectionProps) {
  const headingId = `${id}-heading`
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`relative isolate flex w-full flex-col justify-center overflow-hidden bg-wf-bg py-16 md:py-[100px] ${className}`}
    >
      {background}
      {leaves && (
        <>
          <Leaf side="left" position={leaves === 'a' ? 'top' : 'bottom'} className={LEAF_CLASS} />
          <Leaf side="right" position={leaves === 'a' ? 'bottom' : 'top'} className={LEAF_CLASS} />
        </>
      )}
      <div className={`relative z-30 w-full ${innerClassName}`}>
        <div className="mb-10 text-center">
          <HeadingReveal
            as="h2"
            id={headingId}
            className={`relative inline-block font-en text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-wider text-wf-text ${underline ? UNDERLINE_CLASS : ''} ${titleClassName}`}
          >
            {title}
          </HeadingReveal>
          {lead}
        </div>
        {children}
      </div>
    </section>
  )
}
