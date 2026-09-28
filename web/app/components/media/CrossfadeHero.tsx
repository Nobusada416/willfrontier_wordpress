import { CROSSFADE_CYCLE_SECONDS, crossfadeDelay } from '~/lib/media'
import { Picture } from './Picture'

type CrossfadeHeroProps = {
  // keyframes が 3 枚前提（lib/media.ts の CROSSFADE_FRAMES）のため 3 枚ちょうどを受け取る
  slugs: readonly [string, string, string]
  // ファーストビューに置く場合に指定する
  priority?: boolean
  className?: string
  imageClassName?: string
}

// 3 枚の写真を順に切り替える背景（親要素いっぱいに広がる）
// 旧実装はページごとに名前だけ違う同じ keyframes を 4 か所で定義していたため、1 つにまとめた。
// 動きを減らす設定では motion-safe: によりアニメーションせず、1 枚目だけを表示する
export function CrossfadeHero({
  slugs,
  priority = false,
  className = '',
  imageClassName,
}: CrossfadeHeroProps) {
  return (
    <div aria-hidden="true" className={`absolute inset-0 overflow-hidden ${className}`}>
      {slugs.map((slug, index) => (
        <div
          key={slug}
          data-frame
          className={`absolute inset-0 motion-safe:animate-wf-crossfade ${index === 0 ? '' : 'opacity-0'}`}
          style={{ animationDelay: `${crossfadeDelay(index, CROSSFADE_CYCLE_SECONDS)}s` }}
        >
          <Picture
            slug={slug}
            alt=""
            priority={priority && index === 0}
            loading={priority ? 'eager' : 'lazy'}
            className={`h-full w-full object-cover ${imageClassName ?? ''}`}
          />
        </div>
      ))}
    </div>
  )
}
