import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  INTRO_SEEN_KEY,
  markIntroDone,
  markIntroSeen,
  resetIntroForTest,
  shouldPlayIntro,
  useIntroDone,
} from './intro'

afterEach(() => {
  sessionStorage.clear()
  resetIntroForTest()
  vi.restoreAllMocks()
})

describe('shouldPlayIntro', () => {
  it('初回かつ動きを減らす設定でなければ再生する', () => {
    expect(shouldPlayIntro(false)).toBe(true)
  })

  it('このセッションで見ていれば再生しない', () => {
    markIntroSeen()
    expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBe('1')
    expect(shouldPlayIntro(false)).toBe(false)
  })

  it('動きを減らす設定では再生しない', () => {
    expect(shouldPlayIntro(true)).toBe(false)
  })

  it('sessionStorage が使えなければ再生しない（毎回イントロが出るのを防ぐ）', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(shouldPlayIntro(false)).toBe(false)
  })
})

describe('useIntroDone', () => {
  it('イントロが終わるまで false、終わると true', () => {
    const { result } = renderHook(() => useIntroDone())
    expect(result.current).toBe(false)
    act(() => markIntroDone())
    expect(result.current).toBe(true)
  })
})
