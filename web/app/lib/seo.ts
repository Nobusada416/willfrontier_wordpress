import type { MetaDescriptor } from 'react-router'
import type { Page } from '~/content/pages'
import { SITE } from '~/content/site'

const titleOf = (page: Page) =>
  page.id === 'home' ? `${SITE.name}｜${SITE.tagline}` : `${page.title}｜${SITE.name}`

// 各ページの meta（title・description・canonical・OGP）を組み立てる
// ルートモジュールの meta 関数から `export const meta = () => buildMeta(page)` の形で使う
export const buildMeta = (page: Page): MetaDescriptor[] => {
  const title = titleOf(page)
  const url = `${SITE.url}${page.path}`
  return [
    { title },
    { name: 'description', content: page.description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE.name },
    { property: 'og:locale', content: 'ja_JP' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: page.description },
    { property: 'og:url', content: url },
    { name: 'twitter:card', content: 'summary' },
  ]
}

// 404 ページは検索結果に載せない
export const buildNotFoundMeta = (): MetaDescriptor[] => [
  { title: `ページが見つかりません｜${SITE.name}` },
  { name: 'robots', content: 'noindex' },
]
