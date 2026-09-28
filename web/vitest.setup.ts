import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom には matchMedia が無く、GSAP が読み込み時に呼ぶため、常に一致しない既定の実装を置く
// 一致状態を切り替えたいテストは app/test/matchMedia.ts の stubMatchMedia で差し替える
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })
}

afterEach(() => {
  cleanup()
})
