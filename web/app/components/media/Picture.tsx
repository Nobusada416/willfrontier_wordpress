import { photoSize, photoSrc, photoSrcSet } from '~/lib/media'

type PictureProps = {
  // 'wf-079' のような写真スラッグ
  slug: string
  // 装飾目的の画像は空文字にする
  alt: string
  className?: string
  sizes?: string
  loading?: 'lazy' | 'eager'
  // ファーストビューの主画像に指定する（即時読み込み＋優先度 high）
  priority?: boolean
}

// 旧テーマの wf_picture を移植した写真表示
// 旧実装は <picture><source type="image/webp"> だったが、フォールバックの src も webp で
// <picture> を使う意味がなかったため、srcset 付きの <img> 1 つにまとめた
export function Picture({
  slug,
  alt,
  className,
  sizes = '100vw',
  loading = 'lazy',
  priority = false,
}: PictureProps) {
  const size = photoSize(slug)
  return (
    <img
      src={photoSrc(slug)}
      width={size?.width}
      height={size?.height}
      srcSet={photoSrcSet(slug)}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : loading}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  )
}
