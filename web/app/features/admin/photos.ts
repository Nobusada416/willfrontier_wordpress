import {
  CASE_STUDY_IMAGE_CONTENT_TYPE,
  CASE_STUDY_IMAGE_SIZES,
  CASE_STUDY_IMAGE_WIDTHS,
  CASE_STUDY_UPLOAD_MAX_BYTES,
  type CaseStudyImageSize,
} from '@wf/shared'
import type { ProcessedPhoto } from './api'

// 施工事例の写真をブラウザで縮小し、webp の small（幅 768px）と large（幅 1600px）に変換する。
// 元の写真（スマホの 4000px 級・数 MB）はアップロードせず、変換したものだけを Storage に置く

// 選べる写真の大きさ（変換前）
export const SOURCE_MAX_BYTES = 20 * 1024 * 1024

// webp の画質（0〜1）。写真の見た目とファイルの大きさの釣り合い
const WEBP_QUALITY = 0.85

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif']
const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|heic|heif)$/i
const HEIC = /^image\/hei[cf]$|\.hei[cf]$/i

// ファイルを選ぶ欄の accept（拡張子も並べ、種類の分からない HEIC も選べるようにする）
export const PHOTO_ACCEPT = [...ACCEPTED_TYPES, '.jpg', '.jpeg', '.png', '.heic', '.heif'].join(',')

// 画面にそのまま出す、利用者向けの説明を持つエラー
export class PhotoError extends Error {
  override name = 'PhotoError'
}

// 写真の読み込み（デコード）と書き出し（エンコード）。テストでは偽物に差し替える
export type DecodedImage = { width: number; height: number; source: unknown; close?: () => void }
export type ImageCodec = {
  decode(file: Blob): Promise<DecodedImage>
  encode(
    source: unknown,
    width: number,
    height: number,
    type: string,
    quality: number,
  ): Promise<Blob>
}

// 幅を maxWidth に収める寸法（縦横比を保ち、拡大はしない）
export const fitWidth = (width: number, height: number, maxWidth: number) => {
  if (width <= maxWidth) return { width, height }
  return { width: maxWidth, height: Math.max(1, Math.round((height * maxWidth) / width)) }
}

const isAccepted = (file: File) =>
  ACCEPTED_TYPES.includes(file.type) || (file.type === '' && ACCEPTED_EXTENSIONS.test(file.name))

const isHeic = (file: File) => HEIC.test(file.type) || HEIC.test(file.name)

export async function processPhotoFile(
  file: File,
  codec: ImageCodec = browserCodec,
): Promise<ProcessedPhoto> {
  if (!isAccepted(file)) throw new PhotoError('JPEG・PNG・HEIC の写真を選んでください。')
  if (file.size > SOURCE_MAX_BYTES) throw new PhotoError('写真は 1 枚 20MB までです。')

  let image: DecodedImage
  try {
    image = await codec.decode(file)
  } catch {
    throw new PhotoError(
      isHeic(file)
        ? 'HEIC の写真は、このブラウザでは読み込めません。iPhone の「設定 > カメラ > フォーマット」を「互換性優先」にして撮るか、JPEG に変換してから選んでください。'
        : 'この写真を読み込めませんでした。別の写真を選んでください。',
    )
  }

  try {
    const entries = await Promise.all(
      CASE_STUDY_IMAGE_SIZES.map(async (size) => {
        const target = fitWidth(image.width, image.height, CASE_STUDY_IMAGE_WIDTHS[size])
        const blob = await codec.encode(
          image.source,
          target.width,
          target.height,
          CASE_STUDY_IMAGE_CONTENT_TYPE,
          WEBP_QUALITY,
        )
        return [size, blob, target] as const
      }),
    )
    for (const [, blob] of entries) {
      // 対応していない形式を指定すると、ブラウザは黙って PNG で書き出す（Safari など）
      if (blob.type !== CASE_STUDY_IMAGE_CONTENT_TYPE) {
        throw new PhotoError(
          'このブラウザでは写真を変換できません。パソコンの Google Chrome か Microsoft Edge でお試しください。',
        )
      }
      if (blob.size > CASE_STUDY_UPLOAD_MAX_BYTES) {
        throw new PhotoError(
          '変換した写真が 2MB を超えました。模様の細かい写真は、範囲を切り取ってから選んでください。',
        )
      }
    }
    const files = Object.fromEntries(entries.map(([size, blob]) => [size, blob])) as Record<
      CaseStudyImageSize,
      Blob
    >
    const large = fitWidth(image.width, image.height, CASE_STUDY_IMAGE_WIDTHS.large)
    return { width: large.width, height: large.height, files }
  } finally {
    image.close?.()
  }
}

// ブラウザの実装: createImageBitmap で読み込み（スマホの写真の向き（EXIF）も反映される）、canvas で縮小して書き出す
export const browserCodec: ImageCodec = {
  async decode(file) {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    return {
      width: bitmap.width,
      height: bitmap.height,
      source: bitmap,
      close: () => bitmap.close(),
    }
  },
  encode(source, width, height, type, quality) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return Promise.reject(new PhotoError('写真を変換できませんでした。'))
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(source as ImageBitmap, 0, 0, width, height)
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new PhotoError('写真を変換できませんでした。'))),
        type,
        quality,
      )
    })
  },
}
