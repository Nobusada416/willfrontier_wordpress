// 本文の <main> に付ける id。キーボード利用者がヘッダーのナビを飛ばせるようにする
export const MAIN_CONTENT_ID = 'main'

export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="sr-only z-(--z-skip-link) rounded bg-wf-navy px-4 py-2 font-bold text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
    >
      本文へスキップ
    </a>
  )
}
