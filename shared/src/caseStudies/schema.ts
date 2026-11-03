import { z } from 'zod'
// 文字列の部品。zod の jitless の設定（CSP で unsafe-eval を許可しないため）もここで読み込む
import { optionalText, requiredMessage, requiredText } from '../text'
import {
  CASE_STUDY_MAX_LENGTH,
  CASE_STUDY_PHOTO_DIMENSION_MAX,
  CASE_STUDY_PHOTOS_MAX,
  CASE_STUDY_PHOTOS_MIN,
  CASE_STUDY_STATUSES,
  CASE_STUDY_STORAGE_ROOT,
  CASE_STUDY_IMAGE_CONTENT_TYPES,
  caseStudyImageExtension,
} from './constants'

// 施工事例（Firestore の caseStudies/{事例の ID}）のスキーマ。
// - caseStudyFormSchema: 管理画面の編集フォーム（前後の空白・改行を整え、エラーは日本語）
// - caseStudyContentSchema: 保存・公開される内容の検証だけ（値は変えない）。公開サイトの読み込みで使う
// firestore.rules の検証も同じ項目・上限にそろえる（tests/rules/caseStudies.rules.test.ts で確かめる）

const DATE = /^\d{4}-\d{2}-\d{2}$/

// YYYY-MM-DD で、実在する日付であること（2026-02-30 などは不可）
export const isCaseStudyDate = (value: string) => {
  if (!DATE.test(value)) return false
  const [year, month, day] = value.split('-').map(Number) as [number, number, number]
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

const DATE_INVALID = '日付を正しく入力してください'

// photos[].path: case-studies/{事例の ID}/{写真の ID}.{webp|jpg}
// （ファイルは拡張子の前に -small・-large を付けたもの。caseStudyPhotoFilePath）
const PHOTO_PATH = new RegExp(
  `^${CASE_STUDY_STORAGE_ROOT}/[A-Za-z0-9_-]{1,64}/[A-Za-z0-9_-]{1,64}\\.(${CASE_STUDY_IMAGE_CONTENT_TYPES.map(caseStudyImageExtension).join('|')})$`,
)

// 写真の項目のうち、管理画面のアップロード処理が入れる値（人が入力しないためエラーは共通の文言）
const PHOTO_INVALID = '写真の情報が正しくありません。写真を選び直してください'
const photoUrl = z
  .url({ protocol: /^https?$/, error: PHOTO_INVALID })
  .max(CASE_STUDY_MAX_LENGTH.url, PHOTO_INVALID)
const photoDimension = z
  .number(PHOTO_INVALID)
  .int(PHOTO_INVALID)
  .min(1, PHOTO_INVALID)
  .max(CASE_STUDY_PHOTO_DIMENSION_MAX, PHOTO_INVALID)

const photoFileShape = {
  // Storage の基準パス
  path: z.string(PHOTO_INVALID).regex(PHOTO_PATH, PHOTO_INVALID),
  // 幅 768px（CASE_STUDY_IMAGE_WIDTHS.small）の画像のダウンロード URL
  smallUrl: photoUrl,
  // 幅 1600px（CASE_STUDY_IMAGE_WIDTHS.large）の画像のダウンロード URL
  largeUrl: photoUrl,
  // large の画像の幅・高さ（px）。表示の縦横比に使う（small は同じ比率で縮小したもの）
  width: photoDimension,
  height: photoDimension,
}

const ALT_LABEL = '写真の説明'

// 保存される写真
export const caseStudyPhotoSchema = z.object({
  ...photoFileShape,
  // 写真の説明（alt）。任意（空なら公開サイトでタイトルなどから補う）
  alt: z.string().max(CASE_STUDY_MAX_LENGTH.alt),
})

// photos の各要素のキー（firestore.rules の検証と同じ）
export const CASE_STUDY_PHOTO_KEYS = Object.keys(caseStudyPhotoSchema.shape) as readonly (
  | keyof typeof photoFileShape
  | 'alt'
)[]

const photosMessages = {
  min: '写真を1枚以上追加してください',
  max: `写真は${CASE_STUDY_PHOTOS_MAX}枚までです`,
}

// 管理画面の編集フォーム。status は「下書き保存」「公開して保存」のボタンで決め、
// 日時・更新者は保存のときに付けるため、ここには含めない（含まれていても取り除く）
export const caseStudyFormSchema = z.object({
  date: z
    .string()
    .trim()
    .pipe(
      z
        .string()
        .min(1, { error: requiredMessage('日付'), abort: true })
        .refine(isCaseStudyDate, DATE_INVALID),
    ),
  tag: requiredText('分類', CASE_STUDY_MAX_LENGTH.tag),
  company: requiredText('社名', CASE_STUDY_MAX_LENGTH.company),
  title: requiredText('タイトル', CASE_STUDY_MAX_LENGTH.title),
  category: requiredText('工事の種類', CASE_STUDY_MAX_LENGTH.category),
  description: requiredText('本文', CASE_STUDY_MAX_LENGTH.description, { multiline: true }),
  photos: z
    .array(z.object({ ...photoFileShape, alt: optionalText(ALT_LABEL, CASE_STUDY_MAX_LENGTH.alt) }))
    .min(CASE_STUDY_PHOTOS_MIN, photosMessages.min)
    .max(CASE_STUDY_PHOTOS_MAX, photosMessages.max),
})

const nonEmpty = (max: number) => z.string().min(1).max(max)

// 保存・公開される内容（status と編集する項目）。値は変えずに検証だけ行う
export const caseStudyContentSchema = z.object({
  status: z.enum(CASE_STUDY_STATUSES),
  date: z.string().refine(isCaseStudyDate),
  tag: nonEmpty(CASE_STUDY_MAX_LENGTH.tag),
  company: nonEmpty(CASE_STUDY_MAX_LENGTH.company),
  title: nonEmpty(CASE_STUDY_MAX_LENGTH.title),
  category: nonEmpty(CASE_STUDY_MAX_LENGTH.category),
  description: nonEmpty(CASE_STUDY_MAX_LENGTH.description),
  photos: z.array(caseStudyPhotoSchema).min(CASE_STUDY_PHOTOS_MIN).max(CASE_STUDY_PHOTOS_MAX),
})

export type CaseStudyFormInput = z.input<typeof caseStudyFormSchema>
export type CaseStudyFormValues = z.output<typeof caseStudyFormSchema>
export type CaseStudyPhoto = z.output<typeof caseStudyPhotoSchema>
export type CaseStudyContent = z.output<typeof caseStudyContentSchema>

// Firestore に保存されるドキュメント。日時の型は読み方で違うため型引数にする
// （Web の SDK は Timestamp、Admin SDK は firebase-admin の Timestamp、REST は ISO 8601 の文字列）
export type CaseStudyDocument<TTimestamp = unknown> = CaseStudyContent & {
  createdAt: TTimestamp
  // 書き込みのたびに serverTimestamp() を入れる（ルールで request.time と一致することを確かめる）
  updatedAt: TTimestamp
  // 最後に保存した管理者の uid（ルールで request.auth.uid と一致することを確かめる）
  updatedBy: string
}

// ID 付きの事例（一覧の表示など）
export type CaseStudy = CaseStudyContent & { id: string }

// ドキュメントのキー（firestore.rules の検証と同じ。これ以外のキーは保存できない）
export const CASE_STUDY_DOCUMENT_KEYS = [
  ...(Object.keys(caseStudyContentSchema.shape) as (keyof CaseStudyContent)[]),
  'createdAt',
  'updatedAt',
  'updatedBy',
] as const satisfies readonly (keyof CaseStudyDocument)[]
