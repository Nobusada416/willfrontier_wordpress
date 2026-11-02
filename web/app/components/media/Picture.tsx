import {
  photoSize,
  photoSrc,
  photoSrcSet,
  remotePhotoAttributes,
  type RemotePhoto,
} from '~/lib/media'

type PictureProps = (
  | {
      // 'wf-079' のような写真スラッグ（web/public/media/photos の写真）
      slug: string
      photo?: never
    }
  | {
      // 管理画面でアップロードした写真（施工事例。Storage の URL と寸法）
      photo: RemotePhoto
      slug?: never
    }
) & {
  // 装飾目的の画像は空文字にする
  alt: string
  className?: string
  sizes?: string
  loading?: 'lazy' | 'eager'
  // ファーストビューの主画像に指定する（即時読み込み＋優先度 high）
  priority?: boolean
}

const slugAttributes = (slug: string) => {
  const size = photoSize(slug)
  return {
    src: photoSrc(slug),
    srcSet: photoSrcSet(slug),
    width: size?.width,
    height: size?.height,
  }
}

// 旧テーマの wf_picture を移植した写真表示
// 旧実装は <picture><source type="image/webp"> だったが、フォールバックの src も webp で
// <picture> を使う意味がなかったため、srcset 付きの <img> 1 つにまとめた
export function Picture({
  slug,
  photo,
  alt,
  className,
  sizes = '100vw',
  loading = 'lazy',
  priority = false,
}: PictureProps) {
  const { src, srcSet, width, height } = photo ? remotePhotoAttributes(photo) : slugAttributes(slug)
  return (
    <img
      src={src}
      width={width}
      height={height}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : loading}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  )
}
