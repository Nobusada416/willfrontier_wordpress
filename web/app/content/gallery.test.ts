import { describe, expect, it } from 'vitest'
import { filterGallery, GALLERY_FILTERS, GALLERY_ITEMS } from './gallery'

describe('filterGallery', () => {
  it('ALL ではすべてを旧サイトと同じ順で返す', () => {
    expect(filterGallery(GALLERY_ITEMS, 'all')).toEqual(GALLERY_ITEMS)
  })

  it.each(['indoor', 'people', 'safety', 'video'] as const)(
    '%s では同じタグのものだけを返す',
    (tag) => {
      const result = filterGallery(GALLERY_ITEMS, tag)
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((item) => item.tag === tag)).toBe(true)
    },
  )

  it('動画タグのものはすべて動画で、それ以外はすべて写真', () => {
    GALLERY_ITEMS.forEach((item) => {
      expect(item.type).toBe(item.tag === 'video' ? 'video' : 'photo')
    })
  })

  it('絞り込みボタンはすべてのタグを網羅する', () => {
    const tags = new Set(GALLERY_ITEMS.map((item) => item.tag))
    const filters = GALLERY_FILTERS.map((filter) => filter.value)
    expect(filters[0]).toBe('all')
    tags.forEach((tag) => expect(filters).toContain(tag))
  })
})
