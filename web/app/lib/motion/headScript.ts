import { REDUCED_MOTION_QUERY } from '~/lib/useReducedMotion'
import { INTRO_SEEN_KEY } from './intro'

// アニメーションの準備（React の hydrate）がこの時間内に終わらなければ、隠していた内容を表示する
// イントロの幕を CSS だけで消す時間（app.css の wf-intro-fallback）とは別。どちらも演出の長さ（2.5 秒）より長くする
export const MOTION_FALLBACK_MS = 3000

// アニメーションの準備ができたことを <head> のスクリプトに伝える
export const markMotionReady = () => {
  document.documentElement.dataset.motion = 'ready'
}

/**
 * <head> に埋め込むインラインスクリプト。描画前に実行し、初期表示のちらつきを防ぐ
 * - js: スクロールで表示する要素（[data-reveal]）を最初は隠す（app.css）
 * - intro-skip: イントロを再生しない場合、プリレンダーされたイントロの幕を最初から隠す
 * JS の読み込みに失敗した場合に内容が隠れたままにならないよう、一定時間後に js を外す
 */
export const MOTION_HEAD_SCRIPT = `(function(){var r=document.documentElement;r.classList.add('js');var s=false;try{s=sessionStorage.getItem(${JSON.stringify(INTRO_SEEN_KEY)})==='1'}catch(e){s=true}if(window.matchMedia&&window.matchMedia(${JSON.stringify(REDUCED_MOTION_QUERY)}).matches){s=true}if(s){r.classList.add('intro-skip')}setTimeout(function(){if(r.dataset.motion!=='ready'){r.classList.remove('js')}},${MOTION_FALLBACK_MS})})()`
