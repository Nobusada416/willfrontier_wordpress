import { useEffect, useRef, useState } from 'react'
import { Picture } from '~/components/media/Picture'
import { Video } from '~/components/media/Video'
import { FadeUp } from '~/components/motion/FadeUp'
import {
  filterGallery,
  GALLERY_FILTERS,
  GALLERY_ITEMS,
  type GalleryFilter,
} from '~/content/gallery'
import { ScrollTrigger } from '~/lib/motion/gsap'
import { HomeSection } from './HomeSection'

// 動画の一時停止ボタンを区別できるよう、GALLERY 内での通し番号を付ける
const VIDEO_NUMBERS = new Map(
  GALLERY_ITEMS.filter((item) => item.type === 'video').map((item, index) => [
    item.slug,
    index + 1,
  ]),
)

// 現場の写真と動画をタグで絞り込めるマソンリー
// 旧実装は選択状態を色だけで示していたため、aria-pressed で読み上げにも伝える
export function Gallery() {
  const [filter, setFilter] = useState<GalleryFilter>('all')
  const items = filterGallery(GALLERY_ITEMS, filter)

  // 絞り込みでページの高さが変わるため、以降のセクションのスクロール演出の位置を計算し直す
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    ScrollTrigger.refresh()
  }, [filter])

  return (
    <HomeSection
      id="gallery"
      title="GALLERY"
      underline={false}
      innerClassName="px-4 md:px-8"
      lead={
        <p className="mt-2 text-sm tracking-wider text-wf-text-mid md:text-base">
          現場のリアル — 写真と動画で見る WILL FRONTIER
        </p>
      }
    >
      <div className="mx-auto max-w-7xl">
        <FadeUp className="mb-6 flex flex-wrap justify-center gap-3">
          {GALLERY_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className="rounded-full border border-wf-navy bg-white px-5 py-2 font-bold tracking-wider text-wf-navy transition-colors hover:bg-wf-navy/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wf-navy aria-pressed:bg-wf-navy aria-pressed:text-white"
            >
              {label}
            </button>
          ))}
        </FadeUp>
        <p role="status" className="sr-only">
          {items.length}件を表示しています
        </p>

        <FadeUp>
          <ul aria-label="ギャラリー" className="columns-2 gap-2 md:columns-3 lg:columns-4">
            {items.map((item) => (
              <li
                key={item.slug}
                className={`mb-2 break-inside-avoid overflow-hidden rounded-sm ${item.type === 'video' ? 'bg-black' : ''}`}
              >
                {item.type === 'photo' ? (
                  <Picture
                    slug={item.slug}
                    alt=""
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="block h-auto w-full"
                  />
                ) : (
                  <Video
                    slug={item.slug}
                    poster={item.slug}
                    label={`現場の動画 ${VIDEO_NUMBERS.get(item.slug) ?? ''}`}
                    videoClassName="block h-auto w-full"
                  />
                )}
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </HomeSection>
  )
}
