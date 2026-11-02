import { describe, expect, it } from 'vitest'
import { testPhoto } from '~/test/caseStudies'
import { caseNumber, casePhotoAlt, formatCaseStudyDate } from './format'

describe('施工事例の表示の整形', () => {
  it('日付を YYYY.MM.DD にする', () => {
    expect(formatCaseStudyDate('2026-04-01')).toBe('2026.04.01')
  })

  it('表示順の番号を 2 桁にする', () => {
    expect(caseNumber(0)).toBe('01')
    expect(caseNumber(9)).toBe('10')
  })

  it('写真の説明が空・空白だけなら、タイトルと何枚目かで補う', () => {
    const study = { title: '工場の解体' }
    expect(casePhotoAlt(study, testPhoto('a', 0, '解体前'), 0)).toBe('解体前')
    expect(casePhotoAlt(study, testPhoto('a', 1, ' '), 1)).toBe('工場の解体の写真（2 枚目）')
  })
})
