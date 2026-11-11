import { vi } from 'vitest'

// jsdom には matchMedia が無いため、テストから一致状態を切り替えられるスタブを用意する
export const stubMatchMedia = (initialMatches: Record<string, boolean> = {}) => {
  const matches = new Map(Object.entries(initialMatches))
  const listeners = new Map<string, Set<() => void>>()

  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return matches.get(query) ?? false
    },
    media: query,
    addEventListener: (_type: 'change', listener: () => void) => {
      const set = listeners.get(query) ?? new Set()
      set.add(listener)
      listeners.set(query, set)
    },
    removeEventListener: (_type: 'change', listener: () => void) => {
      listeners.get(query)?.delete(listener)
    },
  }))

  return {
    set(query: string, value: boolean) {
      matches.set(query, value)
      listeners.get(query)?.forEach((listener) => listener())
    },
  }
}
