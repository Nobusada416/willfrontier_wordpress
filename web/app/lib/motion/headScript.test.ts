import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { REDUCED_MOTION_QUERY } from '~/lib/useReducedMotion'
import { stubMatchMedia } from '~/test/matchMedia'
import { INTRO_SEEN_KEY } from './intro'
import { MOTION_FALLBACK_MS, MOTION_HEAD_SCRIPT, markMotionReady } from './headScript'

const root = document.documentElement
// <head> に埋め込むインラインスクリプトをテスト内で実行する
const runHeadScript = () => new Function(MOTION_HEAD_SCRIPT)()

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  root.className = ''
  delete root.dataset.motion
  sessionStorage.clear()
})

describe('MOTION_HEAD_SCRIPT', () => {
  it('JS が動く環境であることを示す js クラスを付ける', () => {
    stubMatchMedia()
    runHeadScript()
    expect(root).toHaveClass('js')
    expect(root).not.toHaveClass('intro-skip')
  })

  it('このセッションでイントロを見ていれば intro-skip クラスを付ける', () => {
    stubMatchMedia()
    sessionStorage.setItem(INTRO_SEEN_KEY, '1')
    runHeadScript()
    expect(root).toHaveClass('intro-skip')
  })

  it('視差効果を減らす設定なら intro-skip クラスを付ける', () => {
    stubMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    runHeadScript()
    expect(root).toHaveClass('intro-skip')
  })

  it('一定時間内にアニメーションの準備ができなければ js クラスを外して内容を表示する', () => {
    stubMatchMedia()
    runHeadScript()
    vi.advanceTimersByTime(MOTION_FALLBACK_MS)
    expect(root).not.toHaveClass('js')
  })

  it('準備ができていれば js クラスを残す', () => {
    stubMatchMedia()
    runHeadScript()
    markMotionReady()
    vi.advanceTimersByTime(MOTION_FALLBACK_MS)
    expect(root).toHaveClass('js')
  })

  it('sessionStorage が使えない環境でも例外を出さない', () => {
    stubMatchMedia()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(runHeadScript).not.toThrow()
    expect(root).toHaveClass('js')
  })
})
