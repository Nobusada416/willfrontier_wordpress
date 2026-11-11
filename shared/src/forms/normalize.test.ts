import { describe, expect, it } from 'vitest'
import { normalizeEmail, normalizeTel, toHalfWidth } from './normalize'

describe('toHalfWidth', () => {
  it('全角の英数字・記号・空白を半角にする', () => {
    expect(toHalfWidth('ＡＢＣ　１２３＠ｅｘａｍｐｌｅ．ｊｐ')).toBe('ABC 123@example.jp')
  })

  it('日本語の文字はそのまま残す', () => {
    expect(toHalfWidth('田中　太郎')).toBe('田中 太郎')
  })
})

describe('normalizeTel', () => {
  it('全角数字とハイフン類を半角にし、前後の空白を除く', () => {
    expect(normalizeTel(' ０４５ー１２３４－５６７８ ')).toBe('045-1234-5678')
  })

  it.each(['‐', '−', '―', 'ｰ'])('ハイフンに似た文字 %s も半角ハイフンにする', (dash) => {
    expect(normalizeTel(`045${dash}1234${dash}5678`)).toBe('045-1234-5678')
  })
})

describe('normalizeEmail', () => {
  it('全角を半角にし、前後の空白を除く', () => {
    expect(normalizeEmail(' ｔａｒｏ＠ｅｘａｍｐｌｅ．ｊｐ ')).toBe('taro@example.jp')
  })
})
