import { describe, expect, it } from 'vitest'
import { countByStatus, formatCaseStudyDate, sortCaseStudies } from './caseStudyList'
import { makeCaseStudy } from '~/test/fakeAdminApi'

describe('sortCaseStudies（一覧の並び）', () => {
  it('日付の新しい順（下書き・公開を混ぜて並べる）', () => {
    const sorted = sortCaseStudies([
      makeCaseStudy({ id: 'a', date: '2026-08-12', status: 'draft' }),
      makeCaseStudy({ id: 'b', date: '2026-10-20', status: 'published' }),
      makeCaseStudy({ id: 'c', date: '2026-09-05', status: 'published' }),
    ])
    expect(sorted.map((item) => item.id)).toEqual(['b', 'c', 'a'])
  })

  it('同じ日付は更新の新しい順', () => {
    const sorted = sortCaseStudies([
      makeCaseStudy({ id: 'old', date: '2026-08-12', updatedAt: new Date('2026-08-01') }),
      makeCaseStudy({ id: 'new', date: '2026-08-12', updatedAt: new Date('2026-09-01') }),
      makeCaseStudy({ id: 'none', date: '2026-08-12', updatedAt: null }),
    ])
    expect(sorted.map((item) => item.id)).toEqual(['new', 'old', 'none'])
  })

  it('元の配列を変えない', () => {
    const items = [
      makeCaseStudy({ id: 'a', date: '2026-01-01' }),
      makeCaseStudy({ id: 'b', date: '2026-02-01' }),
    ]
    sortCaseStudies(items)
    expect(items.map((item) => item.id)).toEqual(['a', 'b'])
  })
})

describe('countByStatus', () => {
  it('公開中と下書きの件数', () => {
    expect(
      countByStatus([
        makeCaseStudy({ status: 'published' }),
        makeCaseStudy({ status: 'draft' }),
        makeCaseStudy({ status: 'published' }),
      ]),
    ).toEqual({ published: 2, draft: 1 })
  })
})

describe('formatCaseStudyDate', () => {
  it('YYYY-MM-DD を YYYY.MM.DD で表示する（公開サイトと同じ形）', () => {
    expect(formatCaseStudyDate('2026-10-20')).toBe('2026.10.20')
  })
})
