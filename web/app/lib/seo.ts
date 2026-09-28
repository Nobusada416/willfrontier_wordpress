import type { MetaDescriptor } from 'react-router'
import type { Page } from '~/content/pages'
import { OG_IMAGE, SITE } from '~/content/site'
import { parseAllowIndexing } from './indexing'
import { buildOrganizationJsonLd } from './structuredData'

// ビルド時の環境変数で決まる（VITE_ALLOW_INDEXING=true のときだけ許可。既定は禁止）
const ALLOW_INDEXING = parseAllowIndexing(import.meta.env.VITE_ALLOW_INDEXING)

const NOINDEX: MetaDescriptor = { name: 'robots', content: 'noindex' }

type BuildMetaOptions = {
  // 検索エンジンへの登録を許可するか（テスト用。省略時は環境変数の値）
  allowIndexing?: boolean
}

const titleOf = (page: Page) =>
  page.id === 'home' ? `${SITE.name}｜${SITE.tagline}` : `${page.title}｜${SITE.name}`

// 各ページの meta（title・description・canonical・OGP・robots・構造化データ）を組み立てる
// ルートモジュールの meta 関数から `export const meta = () => buildMeta(page)` の形で使う
export const buildMeta = (
  page: Page,
  { allowIndexing = ALLOW_INDEXING }: BuildMetaOptions = {},
): MetaDescriptor[] => {
  const title = titleOf(page)
  const url = `${SITE.url}${page.path}`
  return [
    { title },
    { name: 'description', content: page.description },
    ...(allowIndexing ? [] : [NOINDEX]),
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE.name },
    { property: 'og:locale', content: 'ja_JP' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: page.description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: `${SITE.url}${OG_IMAGE.path}` },
    { property: 'og:image:width', content: String(OG_IMAGE.width) },
    { property: 'og:image:height', content: String(OG_IMAGE.height) },
    { property: 'og:image:alt', content: OG_IMAGE.alt },
    { name: 'twitter:card', content: 'summary_large_image' },
    // React Router が JSON 中の < > & をエスケープして <script type="application/ld+json"> を出力する
    ...(page.id === 'home' ? [{ 'script:ld+json': buildOrganizationJsonLd() }] : []),
  ]
}

// 404 ページは検索結果に載せない
export const buildNotFoundMeta = (): MetaDescriptor[] => [
  { title: `ページが見つかりません｜${SITE.name}` },
  NOINDEX,
]
