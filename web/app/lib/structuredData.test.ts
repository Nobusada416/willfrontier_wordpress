import { describe, expect, it } from 'vitest'
import { OFFICES } from '~/content/company'
import { SITE } from '~/content/site'
import { buildOrganizationJsonLd, splitJapaneseAddress } from './structuredData'

describe('splitJapaneseAddress', () => {
  it('都道府県・市区町村・それ以降に分ける', () => {
    expect(splitJapaneseAddress('神奈川県横浜市旭区白根町 895 番地')).toEqual({
      addressRegion: '神奈川県',
      addressLocality: '横浜市',
      streetAddress: '旭区白根町 895 番地',
    })
    expect(splitJapaneseAddress('神奈川県厚木市金田 1107-7')).toEqual({
      addressRegion: '神奈川県',
      addressLocality: '厚木市',
      streetAddress: '金田 1107-7',
    })
  })

  it('東京都の区や郡の町村も分けられる', () => {
    expect(splitJapaneseAddress('東京都千代田区丸の内 1-1')).toEqual({
      addressRegion: '東京都',
      addressLocality: '千代田区',
      streetAddress: '丸の内 1-1',
    })
    expect(splitJapaneseAddress('北海道虻田郡倶知安町北 1 条')).toEqual({
      addressRegion: '北海道',
      addressLocality: '虻田郡倶知安町',
      streetAddress: '北 1 条',
    })
  })

  it('形式が合わない住所は分けずに streetAddress に入れる', () => {
    expect(splitJapaneseAddress('どこか 1-2-3')).toEqual({ streetAddress: 'どこか 1-2-3' })
  })
})

describe('buildOrganizationJsonLd', () => {
  const data = buildOrganizationJsonLd()

  it('会社名・正式名称・URL・ロゴを持つ', () => {
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE.name,
      legalName: SITE.legalName,
      url: `${SITE.url}/`,
      logo: `${SITE.url}/logo.png`,
    })
  })

  it('本社の電話番号・FAX・メールと所在地を持つ', () => {
    const hq = OFFICES[0]
    expect(data).toMatchObject({
      telephone: hq?.tel,
      faxNumber: hq?.fax,
      email: hq?.mail,
      address: {
        '@type': 'PostalAddress',
        postalCode: hq?.postalCode,
        addressCountry: 'JP',
        addressRegion: '神奈川県',
        addressLocality: '横浜市',
        streetAddress: '旭区白根町 895 番地',
      },
    })
  })

  it('拠点ごとに Place を持つ（content/company.ts の全拠点）', () => {
    expect(data.location).toHaveLength(OFFICES.length)
    expect(data.location[1]).toEqual({
      '@type': 'Place',
      name: 'WF-A.BASE',
      telephone: '046-205-4177',
      faxNumber: '046-205-4178',
      address: {
        '@type': 'PostalAddress',
        postalCode: '243-0807',
        addressCountry: 'JP',
        addressRegion: '神奈川県',
        addressLocality: '厚木市',
        streetAddress: '金田 1107-7',
      },
    })
  })

  it('設立日を ISO 8601 形式で持つ', () => {
    expect(data.foundingDate).toBe('2013-10-25')
  })

  it('JSON に変換できる（循環参照や undefined を含まない）', () => {
    expect(JSON.parse(JSON.stringify(data))).toEqual(data)
  })
})
