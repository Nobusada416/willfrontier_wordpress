import { Picture } from '~/components/media/Picture'

type PhotoMasonryProps = {
  // 一覧の名前（読み上げ用）
  label: string
  slugs: readonly string[]
  // 段数（columns-*）。既定はスマホ 2 段・PC 3 段
  className?: string
  // 1 枚の表示幅の目安（srcset の選択に使う）
  sizes?: string
}

// 写真を縦に詰めて並べる一覧（旧実装はページごとに column-count のインライン style と <style> を重複させていた）
// 旧実装はスマホ幅（480px 以下）で 1 段にしていたが、縦に長くなりすぎるためトップのギャラリーと同じく 2 段にした
export function PhotoMasonry({
  label,
  slugs,
  className = 'columns-2 md:columns-3',
  sizes = '(min-width: 768px) 33vw, 50vw',
}: PhotoMasonryProps) {
  return (
    <ul aria-label={label} className={`gap-2 ${className}`}>
      {slugs.map((slug) => (
        <li key={slug} className="mb-2 break-inside-avoid overflow-hidden rounded-md">
          <Picture slug={slug} alt="" sizes={sizes} className="block h-auto w-full" />
        </li>
      ))}
    </ul>
  )
}
