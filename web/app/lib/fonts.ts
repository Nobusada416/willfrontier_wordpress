// Web フォント（Google Fonts）の読み込み
// 日本語フォントは unicode-range で細かく分割されるため、自前配信だと @font-face 宣言だけで
// 数百 KB の CSS になる。ブラウザごとに最適化された CSS を返す Google Fonts から読み込む
export const FONT_STYLESHEET_URL =
  'https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap'

/**
 * <head> に埋め込むインラインスクリプト。フォントの stylesheet をスクリプトから追加する
 * <link rel="stylesheet"> を HTML に直接書くと、別オリジン（fonts.googleapis.com）の CSS（100KB 超）を
 * 取得し終えるまで最初の描画が止まる（P9 の Lighthouse で FCP が 7 秒前後になっていた原因）。
 * スクリプトから追加した stylesheet は描画を止めないため、先にシステムフォントで表示し、
 * 読み込み後に切り替える（font-display: swap と同じ見え方）。JS が動かない環境は root.tsx の <noscript> で読み込む
 */
export const FONT_LOADER_SCRIPT = `(function(){var h=${JSON.stringify(FONT_STYLESHEET_URL)};if(document.querySelector('link[rel="stylesheet"][href="'+h+'"]'))return;var l=document.createElement('link');l.rel='stylesheet';l.href=h;document.head.appendChild(l)})()`
