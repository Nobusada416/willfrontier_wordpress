import { COMPANY_ESTABLISHED, OFFICES, type Office } from '~/content/company'
import { LOGO_PATH, SITE } from '~/content/site'

type AddressParts = {
  addressRegion?: string
  addressLocality?: string
  streetAddress: string
}

// 都道府県・市区町村（郡の町村を含む）・それ以降に分ける
// 市区町村名は最短一致で区切るため「横浜市旭区」は「横浜市」＋「旭区…」になる
const ADDRESS_PATTERN = /^(.{2,3}?[都道府県])(.+?郡.+?[町村]|.+?[市区町村])(.+)$/

// schema.org の PostalAddress 用に、1 行の住所を都道府県・市区町村・番地に分ける
export const splitJapaneseAddress = (address: string): AddressParts => {
  const match = ADDRESS_PATTERN.exec(address)
  if (!match?.[1] || !match[2] || !match[3]) return { streetAddress: address }
  return {
    addressRegion: match[1],
    addressLocality: match[2],
    streetAddress: match[3].trim(),
  }
}

const postalAddressOf = (office: Office) => ({
  '@type': 'PostalAddress' as const,
  postalCode: office.postalCode,
  addressCountry: 'JP',
  ...splitJapaneseAddress(office.address),
})

const [headOffice] = OFFICES
if (!headOffice) throw new Error('会社の拠点（OFFICES）が定義されていません')

// トップページに出力する会社情報の構造化データ（schema.org の Organization）
// 所在地は本社、各拠点は location に並べる
export const buildOrganizationJsonLd = () => ({
  '@context': 'https://schema.org' as const,
  '@type': 'Organization' as const,
  name: SITE.name,
  legalName: SITE.legalName,
  url: `${SITE.url}/`,
  logo: `${SITE.url}${LOGO_PATH}`,
  foundingDate: COMPANY_ESTABLISHED,
  telephone: headOffice.tel,
  faxNumber: headOffice.fax,
  ...(headOffice.mail ? { email: headOffice.mail } : {}),
  address: postalAddressOf(headOffice),
  location: OFFICES.map((office) => ({
    '@type': 'Place' as const,
    name: office.name,
    telephone: office.tel,
    faxNumber: office.fax,
    address: postalAddressOf(office),
  })),
})
