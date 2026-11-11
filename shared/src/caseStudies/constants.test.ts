import { describe, expect, it } from 'vitest'
import {
  CASE_STUDIES_COLLECTION,
  CASE_STUDY_IMAGE_CONTENT_TYPES,
  CASE_STUDY_IMAGE_WIDTHS,
  CASE_STUDY_PHOTOS_MAX,
  CASE_STUDY_PHOTOS_MIN,
  CASE_STUDY_STORAGE_ROOT,
  CASE_STUDY_UPLOAD_MAX_BYTES,
  caseStudyImageExtension,
  caseStudyPhotoBasePath,
  caseStudyPhotoContentType,
  caseStudyPhotoFilePath,
  caseStudyPhotoPath,
  isStorageId,
} from './constants'

describe('施工事例の定数', () => {
  it('コレクション名・Storage の置き場所・画像の形式', () => {
    expect(CASE_STUDIES_COLLECTION).toBe('caseStudies')
    expect(CASE_STUDY_STORAGE_ROOT).toBe('case-studies')
    // webp を優先し、webp を書き出せないブラウザ（Safari）では JPEG にする
    expect(CASE_STUDY_IMAGE_CONTENT_TYPES).toEqual(['image/webp', 'image/jpeg'])
  })

  it('画像の形式ごとの拡張子', () => {
    expect(caseStudyImageExtension('image/webp')).toBe('webp')
    expect(caseStudyImageExtension('image/jpeg')).toBe('jpg')
  })

  it('画像は small 768px・large 1600px の 2 種類', () => {
    expect(CASE_STUDY_IMAGE_WIDTHS).toEqual({ small: 768, large: 1600 })
  })

  it('写真は 1〜4 枚、アップロードは 1 ファイル 2MB まで', () => {
    expect(CASE_STUDY_PHOTOS_MIN).toBe(1)
    expect(CASE_STUDY_PHOTOS_MAX).toBe(4)
    expect(CASE_STUDY_UPLOAD_MAX_BYTES).toBe(2 * 1024 * 1024)
  })
})

describe('isStorageId（Storage のパスに使う ID）', () => {
  it('英数字・ハイフン・アンダースコアの 1〜64 文字だけを通す', () => {
    expect(isStorageId('AbC123_-xyz')).toBe(true)
    expect(isStorageId('a'.repeat(64))).toBe(true)
    expect(isStorageId('')).toBe(false)
    expect(isStorageId('a'.repeat(65))).toBe(false)
    expect(isStorageId('a/b')).toBe(false)
    expect(isStorageId('..')).toBe(false)
    expect(isStorageId('写真')).toBe(false)
  })
})

describe('Storage のパス', () => {
  it('写真の基準パスは case-studies/{事例の ID}/{写真の ID}.{拡張子}', () => {
    expect(caseStudyPhotoBasePath('case1', 'photo1', 'image/webp')).toBe(
      'case-studies/case1/photo1.webp',
    )
    expect(caseStudyPhotoBasePath('case1', 'photo1', 'image/jpeg')).toBe(
      'case-studies/case1/photo1.jpg',
    )
  })

  it('ファイルは case-studies/{事例の ID}/{写真の ID}-{small|large}.{拡張子}', () => {
    expect(caseStudyPhotoPath('case1', 'photo1', 'small', 'image/webp')).toBe(
      'case-studies/case1/photo1-small.webp',
    )
    expect(caseStudyPhotoPath('case1', 'photo1', 'large', 'image/jpeg')).toBe(
      'case-studies/case1/photo1-large.jpg',
    )
  })

  it('基準パス（photos[].path）から各サイズのファイルのパスと形式が分かる', () => {
    expect(caseStudyPhotoFilePath('case-studies/case1/photo1.jpg', 'small')).toBe(
      'case-studies/case1/photo1-small.jpg',
    )
    expect(caseStudyPhotoFilePath('case-studies/case1/photo1.webp', 'large')).toBe(
      'case-studies/case1/photo1-large.webp',
    )
    expect(caseStudyPhotoContentType('case-studies/case1/photo1.jpg')).toBe('image/jpeg')
    expect(caseStudyPhotoContentType('case-studies/case1/photo1.webp')).toBe('image/webp')
  })

  it('基準パスに対応する拡張子が無ければ例外にする', () => {
    expect(() => caseStudyPhotoFilePath('case-studies/case1/photo1', 'small')).toThrow()
    expect(() => caseStudyPhotoFilePath('case-studies/case1/photo1.png', 'small')).toThrow()
    expect(() => caseStudyPhotoContentType('case-studies/case1/photo1')).toThrow()
  })

  it('ID にパスの区切りなどが入っていれば例外にする', () => {
    expect(() => caseStudyPhotoBasePath('a/b', 'photo1', 'image/webp')).toThrow()
    expect(() => caseStudyPhotoPath('case1', '../x', 'large', 'image/webp')).toThrow()
  })
})
