import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubMatchMedia } from '~/test/matchMedia'
import { REDUCED_MOTION_QUERY, useReducedMotion } from './useReducedMotion'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useReducedMotion', () => {
  it('OS で視差効果を減らす設定なら true', () => {
    stubMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('設定が無ければ false', () => {
    stubMatchMedia()
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('設定の変更に追従する', () => {
    const media = stubMatchMedia()
    const { result } = renderHook(() => useReducedMotion())
    act(() => media.set(REDUCED_MOTION_QUERY, true))
    expect(result.current).toBe(true)
  })

  it('matchMedia が無い環境では false', () => {
    vi.stubGlobal('matchMedia', undefined)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })
})
