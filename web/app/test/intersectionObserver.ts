import { vi } from 'vitest'

type Entry = Pick<IntersectionObserverEntry, 'isIntersecting' | 'target'>

// jsdom には IntersectionObserver が無いため、テストから交差状態を通知できるスタブを用意する
export const stubIntersectionObserver = () => {
  const observers = new Set<{ callback: (entries: Entry[]) => void; targets: Set<Element> }>()

  class StubIntersectionObserver {
    private readonly record: { callback: (entries: Entry[]) => void; targets: Set<Element> }

    constructor(callback: (entries: Entry[]) => void) {
      this.record = { callback, targets: new Set() }
      observers.add(this.record)
    }

    observe(target: Element) {
      this.record.targets.add(target)
    }

    unobserve(target: Element) {
      this.record.targets.delete(target)
    }

    disconnect() {
      observers.delete(this.record)
    }
  }

  vi.stubGlobal('IntersectionObserver', StubIntersectionObserver)

  return {
    // target が画面内に入った・出たことを監視中のオブザーバーへ通知する
    trigger(target: Element, isIntersecting: boolean) {
      observers.forEach(({ callback, targets }) => {
        if (targets.has(target)) callback([{ isIntersecting, target }])
      })
    },
    get count() {
      return observers.size
    },
  }
}
