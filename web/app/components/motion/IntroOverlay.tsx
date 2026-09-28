import { useRef } from 'react'
import { gsap, useGSAP } from '~/lib/motion/gsap'
import { markIntroDone, markIntroSeen, shouldPlayIntro } from '~/lib/motion/intro'
import { lockScroll } from '~/lib/motion/scrollLock'
import { REDUCED_MOTION_QUERY } from '~/lib/useReducedMotion'

// トップページを開いたときのロゴ演出（1 セッションにつき 1 回）
// プリレンダーした HTML に幕を含めておき、再生しない場合は <head> のスクリプトが付ける
// intro-skip クラスで最初から隠す（app.css）。JS が動かなくても幕は CSS で 3.5 秒後に消える
export function IntroOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)

  useGSAP(() => {
    const overlay = overlayRef.current
    const logo = logoRef.current
    if (!overlay || !logo) return

    // hydrate 直後の描画はサーバー側の値（動きあり）になるため、フックではなく直接判定する
    const reducedMotion = window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false
    if (!shouldPlayIntro(reducedMotion)) {
      overlay.style.display = 'none'
      markIntroDone()
      return
    }

    const unlockScroll = lockScroll()
    const finish = () => {
      overlay.style.display = 'none'
      unlockScroll()
      // 最後まで見たときだけ記録する（途中で離れた場合や開発時の StrictMode の再実行では次回また再生する）
      markIntroSeen()
      markIntroDone()
    }
    gsap
      .timeline({ onComplete: finish })
      // ロゴをじんわり表示し、1 秒止めてから幕ごとフェードアウト
      .to(logo, { opacity: 1, duration: 0.7, ease: 'power2.out' })
      .to(overlay, { opacity: 0, duration: 0.8, delay: 1, ease: 'power2.inOut' })

    // 再生中にページを離れた場合もスクロールを止めたままにしない（タイムラインは useGSAP が止める）
    return unlockScroll
  })

  return (
    <div
      ref={overlayRef}
      data-intro-overlay
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-(--z-intro) flex items-center justify-center bg-[rgb(245_158_11/0.65)] backdrop-blur-sm"
    >
      <img
        ref={logoRef}
        src="/media/images/logocolor.svg"
        alt=""
        width={320}
        height={121}
        className="w-80 max-w-[70vw] opacity-0"
      />
    </div>
  )
}
