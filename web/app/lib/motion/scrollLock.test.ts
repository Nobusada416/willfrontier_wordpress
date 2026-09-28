import { afterEach, describe, expect, it, vi } from 'vitest'
import { lockScroll, resetScrollLockForTest, setScroller } from './scrollLock'

afterEach(() => {
  resetScrollLockForTest()
  document.body.style.overflow = ''
})

describe('scrollLock', () => {
  it('body のスクロールを止め、解除で元に戻す', () => {
    document.body.style.overflow = 'auto'
    const unlock = lockScroll()
    expect(document.body.style.overflow).toBe('hidden')
    unlock()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('慣性スクロールが有効なら止めて、解除で再開する', () => {
    const scroller = { stop: vi.fn(), start: vi.fn() }
    setScroller(scroller)
    const unlock = lockScroll()
    expect(scroller.stop).toHaveBeenCalled()
    unlock()
    expect(scroller.start).toHaveBeenCalled()
  })

  it('複数からロックされたら、すべて解除されるまで止めたままにする', () => {
    // イントロ演出中にスマホ用メニューを開閉した場合など
    const unlockIntro = lockScroll()
    const unlockMenu = lockScroll()
    unlockIntro()
    expect(document.body.style.overflow).toBe('hidden')
    unlockMenu()
    expect(document.body.style.overflow).toBe('')
  })

  it('同じ解除関数を 2 回呼んでも他のロックを外さない', () => {
    const unlockIntro = lockScroll()
    lockScroll()
    unlockIntro()
    unlockIntro()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('ロック中に慣性スクロールが用意されたら止める', () => {
    const unlock = lockScroll()
    const scroller = { stop: vi.fn(), start: vi.fn() }
    setScroller(scroller)
    expect(scroller.stop).toHaveBeenCalled()
    unlock()
  })
})
