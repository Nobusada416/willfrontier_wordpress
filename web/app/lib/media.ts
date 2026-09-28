// メディア（写真・動画）の配信パス。旧テーマの wf_picture / wf_video の規約を引き継ぐ
// 実ファイルは web/public/media/ 配下に置く（P4 で assets/ から移動）
const MEDIA_BASE = '/media'

// 写真は small（幅 768px）と large（幅 1600px）の 2 種類の webp を用意している
export const photoSrc = (slug: string) => `${MEDIA_BASE}/photos/large/${slug}.webp`

export const photoSrcSet = (slug: string) =>
  `${MEDIA_BASE}/photos/small/${slug}.webp 768w, ${photoSrc(slug)} 1600w`

// 動画スラッグは 'shorts/s08' のようにディレクトリを含む
export const videoSrc = (slug: string) => `${MEDIA_BASE}/videos/${slug}.mp4`

// poster は動画と同じディレクトリの同名 jpg
export const posterSrc = (slug: string) => `${MEDIA_BASE}/videos/${slug}.jpg`

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
