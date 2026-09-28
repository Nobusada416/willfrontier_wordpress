// ページのスクロールを止める処理を 1 か所にまとめる
// イントロ演出とスマホ用メニューが同時にロックしても、すべて解除されるまで止めたままにする
type Scroller = { stop: () => void; start: () => void }

let scroller: Scroller | null = null
let lockCount = 0
let previousOverflow = ''

// SmoothScroll が慣性スクロール（Lenis）を作成・破棄したときに登録する
export const setScroller = (next: Scroller | null) => {
  scroller = next
  if (lockCount > 0) scroller?.stop()
}

// スクロールを止め、解除用の関数を返す（解除関数は何度呼んでも 1 回分だけ解除する）
export const lockScroll = () => {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // overflow: hidden だけでは慣性スクロール自身のスクロールは止まらないため止める
    scroller?.stop()
  }
  lockCount += 1

  let released = false
  return () => {
    if (released) return
    released = true
    lockCount -= 1
    if (lockCount > 0) return
    document.body.style.overflow = previousOverflow
    scroller?.start()
  }
}

export const resetScrollLockForTest = () => {
  scroller = null
  lockCount = 0
  previousOverflow = ''
}
