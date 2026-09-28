import { describe, expect, it } from 'vitest'
import { parseAllowIndexing } from './indexing'

describe('parseAllowIndexing', () => {
  it('"true" のときだけ検索エンジンへの登録を許可する', () => {
    expect(parseAllowIndexing('true')).toBe(true)
  })

  it.each([undefined, '', 'false', 'TRUE', '1', 'yes', ' true'])(
    '%j は許可しない（既定はインデックス禁止）',
    (value) => {
      expect(parseAllowIndexing(value)).toBe(false)
    },
  )
})
