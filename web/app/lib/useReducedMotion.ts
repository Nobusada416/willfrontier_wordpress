import { useSyncExternalStore } from 'react'

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const getMediaQuery = () =>
  typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_MOTION_QUERY) : undefined

const subscribe = (onChange: () => void) => {
  const query = getMediaQuery()
  query?.addEventListener('change', onChange)
  return () => query?.removeEventListener('change', onChange)
}

const getSnapshot = () => getMediaQuery()?.matches ?? false

// プリレンダー時は OS 設定がわからないため「動きあり」として描画し、ブラウザで設定に合わせる
const getServerSnapshot = () => false

// OS の「視差効果を減らす」設定が有効かどうか
export const useReducedMotion = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
