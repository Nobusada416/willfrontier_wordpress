import { describe, expect, it, vi } from 'vitest'
import { getPage } from '~/content/pages'
import { OG_IMAGE, SITE } from '~/content/site'
import { buildMeta, buildNotFoundMeta } from './seo'

type Descriptor = Record<string, unknown>

const find = (meta: Descriptor[], key: string, value: string) =>
  meta.find((item) => item[key] === value)

describe('buildMeta', () => {
  it('下層ページの title は「ページ名｜サイト名」になる', () => {
    const meta = buildMeta(getPage('mission'))
    expect(find(meta, 'title', 'MISSION・会社概要｜ウィルフロンティア')).toBeDefined()
  })

  it('トップページの title は「サイト名｜キャッチコピー」になる', () => {
    const meta = buildMeta(getPage('home'))
    expect(meta[0]).toEqual({ title: `${SITE.name}｜${SITE.tagline}` })
  })

  it('description と og:description にページの説明文を出力する', () => {
    const page = getPage('service')
    const meta = buildMeta(page)
    expect(find(meta, 'name', 'description')).toEqual({
      name: 'description',
      content: page.description,
    })
    expect(find(meta, 'property', 'og:description')).toEqual({
      property: 'og:description',
      content: page.description,
    })
  })

  it('canonical と og:url はサイトの URL にページのパス（末尾スラッシュ付き）を付けたもの', () => {
    const meta = buildMeta(getPage('contact'))
    const url = `${SITE.url}/contact/`
    expect(find(meta, 'rel', 'canonical')).toEqual({
      tagName: 'link',
      rel: 'canonical',
      href: url,
    })
    expect(find(meta, 'property', 'og:url')).toEqual({ property: 'og:url', content: url })
  })

  it('OGP の基本項目を出力する', () => {
    const meta = buildMeta(getPage('home'))
    expect(find(meta, 'property', 'og:type')).toEqual({ property: 'og:type', content: 'website' })
    expect(find(meta, 'property', 'og:site_name')).toEqual({
      property: 'og:site_name',
      content: SITE.name,
    })
    expect(find(meta, 'property', 'og:locale')).toEqual({ property: 'og:locale', content: 'ja_JP' })
    expect(find(meta, 'property', 'og:title')).toEqual({
      property: 'og:title',
      content: `${SITE.name}｜${SITE.tagline}`,
    })
  })
})

describe('buildMeta の検索エンジン向け設定', () => {
  it('既定（インデックス禁止）では全ページに noindex を付ける', () => {
    const meta = buildMeta(getPage('home'), { allowIndexing: false })
    expect(find(meta, 'name', 'robots')).toEqual({ name: 'robots', content: 'noindex' })
  })

  it('インデックスを許可したときは robots を出力しない', () => {
    const meta = buildMeta(getPage('service'), { allowIndexing: true })
    expect(find(meta, 'name', 'robots')).toBeUndefined()
  })

  it('環境変数の指定がなければ noindex になる', () => {
    // 開発者のシェルなどに VITE_ALLOW_INDEXING が残っていても既定の動きを確かめられるよう、明示的に消す
    vi.stubEnv('VITE_ALLOW_INDEXING', undefined)
    const meta = buildMeta(getPage('mission'))
    vi.unstubAllEnvs()
    expect(find(meta, 'name', 'robots')).toEqual({ name: 'robots', content: 'noindex' })
  })
})

describe('buildMeta の OGP 画像', () => {
  it('og:image はサイトの URL から始まる絶対 URL', () => {
    const meta = buildMeta(getPage('recruit'))
    expect(find(meta, 'property', 'og:image')).toEqual({
      property: 'og:image',
      content: `${SITE.url}${OG_IMAGE.path}`,
    })
  })

  it('画像の寸法（1200×630）と代替テキストを出力する', () => {
    const meta = buildMeta(getPage('home'))
    expect(find(meta, 'property', 'og:image:width')).toEqual({
      property: 'og:image:width',
      content: '1200',
    })
    expect(find(meta, 'property', 'og:image:height')).toEqual({
      property: 'og:image:height',
      content: '630',
    })
    expect(find(meta, 'property', 'og:image:alt')).toEqual({
      property: 'og:image:alt',
      content: OG_IMAGE.alt,
    })
  })

  it('X（Twitter）では大きな画像のカードで表示する', () => {
    const meta = buildMeta(getPage('contact'))
    expect(find(meta, 'name', 'twitter:card')).toEqual({
      name: 'twitter:card',
      content: 'summary_large_image',
    })
  })
})

describe('buildMeta の構造化データ（JSON-LD）', () => {
  const jsonLdOf = (meta: Descriptor[]) => meta.filter((item) => 'script:ld+json' in item)

  it('トップページに Organization を 1 つ出力する', () => {
    const items = jsonLdOf(buildMeta(getPage('home')))
    expect(items).toHaveLength(1)
    expect(items[0]?.['script:ld+json']).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE.name,
    })
  })

  it('下層ページには出力しない', () => {
    expect(jsonLdOf(buildMeta(getPage('mission')))).toHaveLength(0)
  })
})

describe('buildNotFoundMeta', () => {
  it('検索結果に出ないよう noindex を指定する', () => {
    const meta = buildNotFoundMeta()
    expect(find(meta, 'name', 'robots')).toEqual({ name: 'robots', content: 'noindex' })
    expect(meta[0]).toEqual({ title: `ページが見つかりません｜${SITE.name}` })
  })
})

describe('SITE', () => {
  it('URL は末尾スラッシュなしの https', () => {
    expect(SITE.url).toMatch(/^https:\/\/[^/]+$/)
  })
})
