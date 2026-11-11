import { act, cleanup, render, renderHook } from '@testing-library/react'
import gsap from 'gsap'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { INTRO_SEEN_KEY, resetIntroForTest, useIntroDone } from '~/lib/motion/intro'
import { resetScrollLockForTest } from '~/lib/motion/scrollLock'
import { REDUCED_MOTION_QUERY } from '~/lib/useReducedMotion'
import { stubMatchMedia } from '~/test/matchMedia'
import { IntroOverlay } from './IntroOverlay'

const getOverlay = () => {
  const overlay = document.querySelector<HTMLElement>('[data-intro-overlay]')
  if (!overlay) throw new Error('イントロの幕がありません')
  return overlay
}

// 再生中のアニメーションを最後まで進める
const finishAnimations = () =>
  act(() => {
    gsap.globalTimeline.getChildren().forEach((animation) => animation.progress(1))
  })

afterEach(() => {
  // アンマウント時にもイントロ終了を記録するため、状態を戻す前にアンマウントする
  cleanup()
  vi.unstubAllGlobals()
  sessionStorage.clear()
  resetIntroForTest()
  resetScrollLockForTest()
  document.body.style.overflow = ''
})

describe('IntroOverlay', () => {
  it('ロゴを装飾として表示する幕を描画する', () => {
    stubMatchMedia()
    render(<IntroOverlay />)
    expect(getOverlay()).toHaveAttribute('aria-hidden', 'true')
    expect(getOverlay().querySelector('img')).toHaveAttribute('alt', '')
  })

  it('初回はスクロールを止めて再生し、終了後に幕を消してスクロールを戻す', () => {
    stubMatchMedia()
    const introDone = renderHook(() => useIntroDone())
    render(<IntroOverlay />)
    expect(document.body.style.overflow).toBe('hidden')
    expect(introDone.result.current).toBe(false)

    finishAnimations()
    expect(getOverlay().style.display).toBe('none')
    expect(document.body.style.overflow).toBe('')
    expect(introDone.result.current).toBe(true)
    expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBe('1')
  })

  it('このセッションで見ていれば再生せず、すぐに幕を消す', () => {
    stubMatchMedia()
    sessionStorage.setItem(INTRO_SEEN_KEY, '1')
    const introDone = renderHook(() => useIntroDone())
    render(<IntroOverlay />)
    expect(getOverlay().style.display).toBe('none')
    expect(document.body.style.overflow).toBe('')
    expect(introDone.result.current).toBe(true)
  })

  it('動きを減らす設定では再生しない', () => {
    stubMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(<IntroOverlay />)
    expect(getOverlay().style.display).toBe('none')
    expect(document.body.style.overflow).toBe('')
  })

  it('再生中にページを離れてもスクロールを止めたままにせず、次回は再生し直す', () => {
    stubMatchMedia()
    const { unmount } = render(<IntroOverlay />)
    unmount()
    expect(document.body.style.overflow).toBe('')
    expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBeNull()
  })

  it('開発時の StrictMode（マウント→破棄→再マウント）でも再生される', () => {
    stubMatchMedia()
    render(
      <StrictMode>
        <IntroOverlay />
      </StrictMode>,
    )
    expect(document.body.style.overflow).toBe('hidden')
    expect(getOverlay().style.display).not.toBe('none')
  })
})
