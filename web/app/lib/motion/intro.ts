import { useSyncExternalStore } from 'react'

// イントロ演出（トップページのロゴ表示）は 1 セッションにつき 1 回だけ再生する
export const INTRO_SEEN_KEY = 'wf:intro-seen'

export const shouldPlayIntro = (reducedMotion: boolean) => {
  if (reducedMotion) return false
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) !== '1'
  } catch {
    // 保存領域が使えない環境では「見たか」を記録できず毎回再生されてしまうため、再生しない
    return false
  }
}

// 記録できたかを返す（記録できなくても演出には影響しない）
export const markIntroSeen = () => {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1')
    return true
  } catch {
    return false
  }
}

// イントロが終わったか（トップのヒーローの文字やヘッダーはイントロ後に表示する）
// イントロの幕はトップにしか無いため、下層ページでこの値を待つと表示されなくなる。トップ専用として使う
let introDone = false
const listeners = new Set<() => void>()

export const markIntroDone = () => {
  if (introDone) return
  introDone = true
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useIntroDone = () =>
  useSyncExternalStore(
    subscribe,
    () => introDone,
    () => false,
  )

export const resetIntroForTest = () => {
  introDone = false
}
