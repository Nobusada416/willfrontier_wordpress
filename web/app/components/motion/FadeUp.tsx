import { type ReactNode, useRef } from 'react'
import { gsap, useMotion } from '~/lib/motion/gsap'

type FadeUpProps = {
  as?: 'div' | 'li' | 'p' | 'section' | 'article'
  className?: string
  children: ReactNode
  // scroll: 画面に入ったとき（旧 .js-fade-up）/ load: ページ表示時（旧お問い合わせページの見出し）
  trigger?: 'scroll' | 'load'
  delay?: number
}

// 下からフェードインする演出
export function FadeUp({
  as = 'div',
  className,
  children,
  trigger = 'scroll',
  delay = 0,
}: FadeUpProps) {
  const ref = useRef<HTMLElement>(null)

  useMotion(ref, (element) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: trigger === 'scroll' ? 50 : 30 },
      {
        opacity: 1,
        y: 0,
        duration: trigger === 'scroll' ? 0.9 : 0.8,
        ease: 'power3.out',
        delay,
        scrollTrigger: trigger === 'scroll' ? { trigger: element, start: 'top 88%' } : undefined,
      },
    )
  })

  const Tag = as
  return (
    <Tag
      // 要素の種類ごとに ref の型が異なるため、共通の HTMLElement として受け取る
      ref={(element: HTMLElement | null) => {
        ref.current = element
      }}
      className={className}
      data-reveal
    >
      {children}
    </Tag>
  )
}
