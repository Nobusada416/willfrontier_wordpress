import type { ReactNode } from 'react'
import { FadeUp } from '~/components/motion/FadeUp'
import { HeadingReveal } from '~/components/motion/HeadingReveal'
import { Leaf } from '~/components/motion/Leaf'
import { UNDERLINE_CLASS } from './SectionHeader'

type PhotoHeroProps = {
  // 背景の写真（CrossfadeHero・MosaicHero）。文字の枠が上に重なるため、ボタンなど操作できる要素を含む背景は置けない
  background: ReactNode
  title: string
  subtitle: string
  // screen: 画面の高さいっぱい（車両・施工事例）/ compact: 低めの帯（お問い合わせ。旧 clamp(360px,55vh,640px)）
  height?: 'screen' | 'compact'
  // 見出しの下に黄色の線を引くか（旧 .yellow-underline）
  underline?: boolean
  // 左右の葉の装飾を置くか（旧お問い合わせページには無かった）
  leaves?: boolean
}

const HEIGHTS = {
  screen: 'h-[calc(100svh-var(--spacing-header))] min-h-[520px]',
  compact: 'h-[clamp(360px,55vh,640px)]',
} as const

const LEAF_CLASS = 'z-40 opacity-50 max-lg:hidden'
const TEXT_SHADOW = '[text-shadow:0_4px_16px_rgb(0_0_0/0.5)]'

// 下層ページ（車両・施工事例）の、写真を敷いたファーストビュー
// 旧テンプレートの暗い幕 bg-black/55 は旧 CSS に含まれず表示されていなかったが、
// 明るい写真の上の白い文字が読めなかったため、テンプレートの意図どおり幕を敷く
export function PhotoHero({
  background,
  title,
  subtitle,
  height = 'screen',
  underline = false,
  leaves = true,
}: PhotoHeroProps) {
  return (
    <section className={`relative isolate w-full overflow-hidden ${HEIGHTS[height]}`}>
      {background}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-black/55" />
      <div className="relative z-30 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <HeadingReveal
          as="h1"
          className={`mb-6 text-[clamp(3rem,14vw,4.5rem)] font-black tracking-widest text-white md:text-8xl ${TEXT_SHADOW} ${underline ? UNDERLINE_CLASS : ''}`}
        >
          {title}
        </HeadingReveal>
        <FadeUp
          as="p"
          className="text-lg font-bold tracking-wide text-white [text-shadow:0_2px_8px_rgb(0_0_0/0.5)] [word-break:auto-phrase] md:text-2xl"
        >
          {subtitle}
        </FadeUp>
      </div>
      {leaves && (
        <>
          <Leaf side="left" position="top" trigger="load" className={LEAF_CLASS} />
          <Leaf side="right" position="bottom" trigger="load" className={LEAF_CLASS} />
        </>
      )}
    </section>
  )
}
