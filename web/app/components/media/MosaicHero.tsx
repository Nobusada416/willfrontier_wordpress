import { Picture } from './Picture'

// 1 タイルあたりの明滅のずれ（秒）
const TILE_STEP_SECONDS = 1

type MosaicHeroProps = {
  slugs: readonly string[]
  columns: number
  // ファーストビューに置く場合に指定する
  priority?: boolean
  className?: string
  imageClassName?: string
}

// 写真をタイル状に並べ、1 枚ずつ順に明滅させる背景（親要素いっぱいに広がる）
// トップ（9 枚）と施工事例（6 枚）で別々に定義していた keyframes を 1 つにまとめた。
// 動きを減らす設定では motion-safe: によりアニメーションしない
export function MosaicHero({
  slugs,
  columns,
  priority = false,
  className = '',
  imageClassName,
}: MosaicHeroProps) {
  const rows = Math.ceil(slugs.length / columns)
  const cycle = slugs.length * TILE_STEP_SECONDS
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {slugs.map((slug, index) => (
        <div
          key={slug}
          data-tile
          className="overflow-hidden motion-safe:animate-wf-tile-pulse"
          style={{
            animationDuration: `${cycle}s`,
            animationDelay: `${index * TILE_STEP_SECONDS}s`,
          }}
        >
          <Picture
            slug={slug}
            alt=""
            sizes={`${Math.ceil(100 / columns)}vw`}
            priority={priority && index === 0}
            loading={priority ? 'eager' : 'lazy'}
            className={`h-full w-full object-cover ${imageClassName ?? ''}`}
          />
        </div>
      ))}
    </div>
  )
}
