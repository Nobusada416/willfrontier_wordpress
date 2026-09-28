import { useRef } from 'react'
import { gsap, useMotion } from '~/lib/motion/gsap'

type LeafProps = {
  side: 'left' | 'right'
  // 画像の種類（上から垂れる葉 / 下から伸びる葉）
  position: 'top' | 'bottom'
  // scroll: セクションに入るにつれて飛び出す（旧 .js-leaf）/ load: ページ表示時に飛び出す（旧 .detail-leaf）
  trigger?: 'scroll' | 'load'
  // 大きさ・透明度・重なり順など。画像はアニメーションで opacity 1 になるため、
  // 旧デザインの透明度（トップ 0.95・下層 0.5 / 0.2 など）はここで外枠に指定する
  className?: string
}

const LEAF_IMAGES = {
  top: { left: '/media/images/plant-top-left.png', right: '/media/images/plant-top-right.png' },
  bottom: {
    left: '/media/images/plant-bottom-left.png',
    right: '/media/images/plant-bottom-right.png',
  },
} as const

// 飛び出す距離（px）
const OFFSET = 120

// セクションの左右に置く葉の装飾
export function Leaf({ side, position, trigger = 'scroll', className = '' }: LeafProps) {
  const ref = useRef<HTMLDivElement>(null)

  useMotion(ref, (wrapper) => {
    const from = { opacity: 0, x: side === 'right' ? OFFSET : -OFFSET }
    const image = wrapper.querySelector('img')
    if (trigger === 'load') {
      gsap.fromTo(image, from, { opacity: 1, x: 0, duration: 1.2, ease: 'power3.out', delay: 0.3 })
      return
    }
    gsap.fromTo(image, from, {
      opacity: 1,
      x: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper.closest('section') ?? wrapper.parentElement,
        start: 'top 85%',
        end: 'top 30%',
        scrub: 1.2,
      },
    })
  })

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute h-full ${side === 'left' ? 'left-0' : 'right-0'} ${position === 'top' ? 'top-0' : 'bottom-0'} ${className}`}
    >
      <img src={LEAF_IMAGES[position][side]} alt="" data-reveal className="h-full w-auto" />
    </div>
  )
}
