import Lenis from 'lenis'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { gsap, ScrollTrigger } from '~/lib/motion/gsap'
import { markMotionReady } from '~/lib/motion/headScript'
import { setScroller } from '~/lib/motion/scrollLock'
import { useReducedMotion } from '~/lib/useReducedMotion'

// gsap.ticker の既定値（lagSmoothing を戻すときに使う）
const DEFAULT_LAG_THRESHOLD = 500
const DEFAULT_LAG_ADJUSTED = 33

// ページ全体の慣性スクロール（Lenis）。GSAP の ticker で駆動し、ScrollTrigger と同期する
// 動きを減らす設定では使わず、ブラウザ標準のスクロールにする
export function SmoothScroll() {
  const reducedMotion = useReducedMotion()
  const location = useLocation()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    markMotionReady()
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    })
    const update = (time: number) => lenis.raf(time * 1000)
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    setScroller(lenis)
    lenisRef.current = lenis
    // 画像の読み込みで高さが変わるため、読み込み完了後にもスクロール位置の計算をやり直す
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    return () => {
      window.removeEventListener('load', refresh)
      lenisRef.current = null
      gsap.ticker.remove(update)
      gsap.ticker.lagSmoothing(DEFAULT_LAG_THRESHOLD, DEFAULT_LAG_ADJUSTED)
      setScroller(null)
      lenis.destroy()
    }
  }, [reducedMotion])

  // ページ遷移時のスクロール（先頭・#見出し・戻る/進むでの復元）は ScrollRestoration が行う。
  // 慣性スクロールは自身の目標位置を持っているため、遷移後の位置に合わせないと次の操作で元の位置へ引き戻される
  useEffect(() => {
    lenisRef.current?.resize()
    lenisRef.current?.scrollTo(window.scrollY, { immediate: true })
    // 新しいページの高さでスクロール位置の計算をやり直す
    ScrollTrigger.refresh()
  }, [location.key])

  return null
}
