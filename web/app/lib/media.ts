import type { CaseStudyPhoto } from '@wf/shared'
// 全ページで読み込むため、zod を含む @wf/shared の入口ではなく定数のファイルを直接読む
import { CASE_STUDY_IMAGE_WIDTHS } from '@wf/shared/src/caseStudies/constants'
import manifest from './mediaManifest.json'

export type Size = { width: number; height: number }

// 実ファイルの寸法一覧の形（web/scripts/mediaManifest.ts が生成する）
export type MediaManifest = {
  // 写真スラッグ（'wf-079'）ごとの small / large の寸法。
  // xsmall はトップで小さく表示する写真だけにある（scripts/photo-xsmall.py で書き出す）
  photos: Record<string, { xsmall?: Size; small: Size; large: Size }>
  // 動画スラッグ（'shorts/s08'）ごとの poster の寸法
  posters: Record<string, Size>
}

// メディア（写真・動画）の配信パス。旧テーマの wf_picture / wf_video の規約を引き継ぐ
// 実ファイルは web/public/media/ 配下に置く（P4 で assets/ から移動）
const MEDIA_BASE = '/media'

// 実ファイルの寸法（npm run media:manifest -w web で生成。実ファイルとのずれはテストで検出する）
const MANIFEST: MediaManifest = manifest

// 写真は small と large の 2 種類の webp を用意している（寸法は写真ごとに異なる）
export const photoSrc = (slug: string) => `${MEDIA_BASE}/photos/large/${slug}.webp`

export const photoSmallSrc = (slug: string) => `${MEDIA_BASE}/photos/small/${slug}.webp`

// トップのモザイク・MISSION の背景のように小さく表示する写真だけ、短辺 400px の xsmall も用意している
// （P9 の Lighthouse で、幅 140px 前後のタイルに幅 768px の small を読み込んでいたため）
export const photoXsmallSrc = (slug: string) => `${MEDIA_BASE}/photos/xsmall/${slug}.webp`

export const hasPhotoXsmall = (slug: string) => MANIFEST.photos[slug]?.xsmall !== undefined

// large の寸法。img の width / height 属性に付け、読み込み前から縦横比どおりの高さを確保する
export const photoSize = (slug: string) => MANIFEST.photos[slug]?.large

// 旧実装は small を一律 768w、large を 1600w としていたが、実際の幅は写真ごとに異なり
// 幅 117px の small が 768px 相当として選ばれて粗く表示されることがあったため、実寸を書く
export const photoSrcSet = (slug: string) => {
  const sizes = MANIFEST.photos[slug]
  if (!sizes) return undefined
  const candidates = [
    sizes.xsmall && `${photoXsmallSrc(slug)} ${sizes.xsmall.width}w`,
    `${photoSmallSrc(slug)} ${sizes.small.width}w`,
    `${photoSrc(slug)} ${sizes.large.width}w`,
  ]
  return candidates.filter(Boolean).join(', ')
}

// 管理画面でアップロードした写真（Storage のダウンロード URL と large の寸法）
export type RemotePhoto = Pick<CaseStudyPhoto, 'smallUrl' | 'largeUrl' | 'width' | 'height'>

// アップロード時に small（幅 768px）と large（幅 1600px）に縮小している（元の画像が小さければ拡大しない）。
// width は large の幅なので、small の幅はそれと 768px の小さいほう。同じ幅なら srcset は付けない
export const remotePhotoAttributes = ({ smallUrl, largeUrl, width, height }: RemotePhoto) => {
  const smallWidth = Math.min(CASE_STUDY_IMAGE_WIDTHS.small, width)
  return {
    src: largeUrl,
    srcSet: smallWidth < width ? `${smallUrl} ${smallWidth}w, ${largeUrl} ${width}w` : undefined,
    width,
    height,
  }
}

// 動画スラッグは 'shorts/s08' のようにディレクトリを含む
export const videoSrc = (slug: string) => `${MEDIA_BASE}/videos/${slug}.mp4`

// poster は動画と同じディレクトリの同名 jpg
export const posterSrc = (slug: string) => `${MEDIA_BASE}/videos/${slug}.jpg`

export const posterSize = (slug: string) => MANIFEST.posters[slug]

// クロスフェードの枚数・1 周の秒数・1 周に占めるフェード時間の割合
// app.css の keyframes（wf-crossfade）はこの 3 つを前提に組んであるため変更時は合わせて直す
export const CROSSFADE_FRAMES = 3
export const CROSSFADE_CYCLE_SECONDS = 12
const CROSSFADE_FADE_RATIO = 1 / 12

/**
 * クロスフェードの index 枚目に付ける animation-delay（秒）
 * 各フレームは同じ keyframes を 1 枚分（1 周 / 枚数）ずつずらして再生する。
 * 読み込み直後に 1 枚目だけが見えているよう、1 枚目がフェードインし終えた位相から始める（負の遅延）
 */
export const crossfadeDelay = (index: number, cycleSeconds: number) => {
  const step = cycleSeconds / CROSSFADE_FRAMES
  const fade = cycleSeconds * CROSSFADE_FADE_RATIO
  const phase = (((fade - index * step) % cycleSeconds) + cycleSeconds) % cycleSeconds
  return phase === 0 ? 0 : -phase
}
