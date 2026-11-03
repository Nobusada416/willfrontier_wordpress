import { describe, expect, it } from 'vitest'
import {
  CASE_STUDIES_COLLECTION,
  CASE_STUDY_IMAGE_CONTENT_TYPE,
  CASE_STUDY_IMAGE_WIDTHS,
  CASE_STUDY_PHOTOS_MAX,
  CASE_STUDY_PHOTOS_MIN,
  CASE_STUDY_STORAGE_ROOT,
  CASE_STUDY_UPLOAD_MAX_BYTES,
  caseStudyPhotoBasePath,
  caseStudyPhotoPath,
  isStorageId,
} from './constants'

describe('施工事例の定数', () => {
  it('コレクション名・Storage の置き場所・画像の形式', () => {
    expect(CASE_STUDIES_COLLECTION).toBe('caseStudies')
    expect(CASE_STUDY_STORAGE_ROOT).toBe('case-studies')
    expect(CASE_STUDY_IMAGE_CONTENT_TYPE).toBe('image/webp')
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
  it('写真の基準パスは case-studies/{事例の ID}/{写真の ID}', () => {
    expect(caseStudyPhotoBasePath('case1', 'photo1')).toBe('case-studies/case1/photo1')
  })

  it('ファイルは case-studies/{事例の ID}/{写真の ID}-{small|large}.webp', () => {
    expect(caseStudyPhotoPath('case1', 'photo1', 'small')).toBe(
      'case-studies/case1/photo1-small.webp',
    )
    expect(caseStudyPhotoPath('case1', 'photo1', 'large')).toBe(
      'case-studies/case1/photo1-large.webp',
    )
  })

  it('ID にパスの区切りなどが入っていれば例外にする', () => {
    expect(() => caseStudyPhotoBasePath('a/b', 'photo1')).toThrow()
    expect(() => caseStudyPhotoPath('case1', '../x', 'large')).toThrow()
  })
})
