// 施工事例（管理画面で編集し、公開サイトで表示する）の定数。
// firestore.rules・storage.rules にも同じ値を書いている（ルールはこのファイルを読めないため）。
// 値を変えるときはルールも直し、tests/rules/ のテストで両方がそろっていることを確かめる

// Firestore のコレクション名（caseStudies/{事例の ID}）
export const CASE_STUDIES_COLLECTION = 'caseStudies'

// 公開状態。published だけが公開サイトに表示され、未ログインでも読める
export const CASE_STUDY_STATUSES = ['draft', 'published'] as const
export type CaseStudyStatus = (typeof CASE_STUDY_STATUSES)[number]

// 文字列の最大文字数
export const CASE_STUDY_MAX_LENGTH = {
  // 社名
  company: 50,
  // トップの一覧の分類（「運用開始」「構築」など）
  tag: 20,
  title: 60,
  // 工事の種類・内容（「産業廃棄物 / 金属類 / 機械設備」など）
  category: 80,
  // 本文（プレーンテキスト。改行のみ可）
  description: 400,
  // 写真の説明（alt）
  alt: 100,
  // 写真のダウンロード URL
  url: 2048,
} as const

// 写真の枚数（1 枚目がメイン）
export const CASE_STUDY_PHOTOS_MIN = 1
export const CASE_STUDY_PHOTOS_MAX = 4

// 写真の幅・高さ（px）の上限
export const CASE_STUDY_PHOTO_DIMENSION_MAX = 10000

// 写真は管理画面（ブラウザ）で縮小して、この幅（px）の画像を 2 種類アップロードする。
// 元の画像のほうが小さければ拡大しない
export const CASE_STUDY_IMAGE_WIDTHS = { small: 768, large: 1600 } as const
export type CaseStudyImageSize = keyof typeof CASE_STUDY_IMAGE_WIDTHS
export const CASE_STUDY_IMAGE_SIZES = Object.keys(CASE_STUDY_IMAGE_WIDTHS) as CaseStudyImageSize[]

// 保存する画像の形式と、Storage のファイルの拡張子。
// webp を優先し、canvas で webp を書き出せないブラウザ（Safari）では JPEG にする
const IMAGE_EXTENSIONS = { 'image/webp': 'webp', 'image/jpeg': 'jpg' } as const
export type CaseStudyImageContentType = keyof typeof IMAGE_EXTENSIONS
export type CaseStudyImageExtension = (typeof IMAGE_EXTENSIONS)[CaseStudyImageContentType]
export const CASE_STUDY_IMAGE_CONTENT_TYPES = Object.keys(
  IMAGE_EXTENSIONS,
) as CaseStudyImageContentType[]

export const caseStudyImageExtension = (contentType: CaseStudyImageContentType) =>
  IMAGE_EXTENSIONS[contentType]

// アップロードできる 1 ファイルの最大バイト数（storage.rules と同じ）
export const CASE_STUDY_UPLOAD_MAX_BYTES = 2 * 1024 * 1024

// Storage の置き場所: case-studies/{事例の ID}/{写真の ID}-{small|large}.{webp|jpg}
export const CASE_STUDY_STORAGE_ROOT = 'case-studies'

// Storage のパスに使う ID（事例の ID・写真の ID）。Firestore の自動 ID（英数字 20 文字）も通る。
// パスの区切り（/）や .. を入れさせないため、英数字・ハイフン・アンダースコアの 1〜64 文字に限る
const STORAGE_ID = /^[A-Za-z0-9_-]{1,64}$/
export const isStorageId = (value: string) => STORAGE_ID.test(value)

const assertStorageId = (label: string, value: string) => {
  if (!isStorageId(value)) throw new Error(`${label}が不正です: ${JSON.stringify(value)}`)
}

// 写真の基準パス（photos[].path に保存する）: case-studies/{事例の ID}/{写真の ID}.{webp|jpg}。
// このパスのファイルは無く、small・large のファイルは拡張子の前に -small・-large を付けたもの。
// 拡張子で、保存した形式（webp か JPEG か）が分かる
export const caseStudyPhotoBasePath = (
  caseId: string,
  photoId: string,
  contentType: CaseStudyImageContentType,
) => {
  assertStorageId('事例の ID', caseId)
  assertStorageId('写真の ID', photoId)
  return `${CASE_STUDY_STORAGE_ROOT}/${caseId}/${photoId}.${caseStudyImageExtension(contentType)}`
}

const splitBasePath = (basePath: string) => {
  const match = /^(.+)\.([a-z]+)$/.exec(basePath)
  const entry = Object.entries(IMAGE_EXTENSIONS).find(([, extension]) => extension === match?.[2])
  if (!match || !entry) throw new Error(`写真の基準パスが不正です: ${JSON.stringify(basePath)}`)
  return { stem: match[1], extension: entry[1], contentType: entry[0] as CaseStudyImageContentType }
}

// 基準パス（photos[].path）から、そのサイズのファイルのパスを求める（アップロード・削除のとき）
export const caseStudyPhotoFilePath = (basePath: string, size: CaseStudyImageSize) => {
  const { stem, extension } = splitBasePath(basePath)
  return `${stem}-${size}.${extension}`
}

// 基準パス（photos[].path）から、保存した形式（Content-Type）を求める
export const caseStudyPhotoContentType = (basePath: string) => splitBasePath(basePath).contentType

// 写真のファイルのパス
export const caseStudyPhotoPath = (
  caseId: string,
  photoId: string,
  size: CaseStudyImageSize,
  contentType: CaseStudyImageContentType,
) => caseStudyPhotoFilePath(caseStudyPhotoBasePath(caseId, photoId, contentType), size)
