import { describe, expect, it } from 'vitest'
import { getPage } from '~/content/pages'
import { SITE } from '~/content/site'
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
