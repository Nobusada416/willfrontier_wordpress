import { type ReactNode, useRef } from 'react'
import { gsap, useMotion } from '~/lib/motion/gsap'

type HeadingRevealProps = {
  as: 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
  children: ReactNode
}

// 見出しがマスクの下からせり上がる演出（旧 .js-heading-up）
// 旧実装は JS で DOM を書き換えてマスクを作っていたが、hydrate の不整合を防ぐため JSX で描画する
export function HeadingReveal({ as: Tag, className, children }: HeadingRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null)

  useMotion(ref, (heading) => {
    gsap.fromTo(
      heading.querySelector('[data-reveal]'),
      { yPercent: 105, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: { trigger: heading, start: 'top 88%' },
      },
    )
  })

  return (
    <Tag ref={ref} className={className}>
      <span className="block overflow-hidden pb-[0.1em]">
        <span data-reveal className="block will-change-transform">
          {children}
        </span>
      </span>
    </Tag>
  )
}
