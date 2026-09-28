import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { type RefObject } from 'react'

// プラグインの登録はここで 1 度だけ行い、他のモジュールはここから import する
gsap.registerPlugin(ScrollTrigger, useGSAP)

export { gsap, ScrollTrigger, useGSAP }

// 動きを減らす設定でないときだけアニメーションを登録する
export const MOTION_OK_QUERY = '(prefers-reduced-motion: no-preference)'

// 要素とその中の [data-reveal] を表示する
const reveal = (element: HTMLElement) => {
  for (const target of [element, ...element.querySelectorAll<HTMLElement>('[data-reveal]')]) {
    target.style.opacity = '1'
  }
}

/**
 * ref の要素に対して、動きを減らす設定でないときだけアニメーションを登録する
 * 設定が切り替わったときやアンマウント時は gsap.matchMedia が元に戻す
 * dependencies が変わると、登録したアニメーションを元に戻してから setup をやり直す
 */
export const useMotion = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  setup: (element: T) => void,
  dependencies: readonly unknown[] = [],
) =>
  useGSAP(
    () => {
      const element = ref.current
      if (!element) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK_QUERY, () => {
        try {
          setup(element)
        } catch (error) {
          // 設定に失敗した要素は、app.css で隠したまま（opacity: 0）にならないよう表示してから報告する
          reveal(element)
          console.error('アニメーションの設定に失敗しました', error)
        }
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [...dependencies], revertOnUpdate: true },
  )
