// トップの GALLERY に並べる写真・動画（旧 front-page.php の $items）
export type GalleryTag = 'indoor' | 'people' | 'safety' | 'video'

export type GalleryItem =
  | { type: 'photo'; slug: string; tag: Exclude<GalleryTag, 'video'> }
  | { type: 'video'; slug: string; tag: 'video' }

export type GalleryFilter = GalleryTag | 'all'

export const GALLERY_FILTERS: readonly { value: GalleryFilter; label: string }[] = [
  { value: 'all', label: 'ALL' },
  { value: 'indoor', label: '社内・作業' },
  { value: 'people', label: '人・笑顔' },
  { value: 'safety', label: '安全・地域' },
  { value: 'video', label: '動画' },
]

export const GALLERY_ITEMS: readonly GalleryItem[] = [
  { type: 'photo', slug: 'wf-112', tag: 'people' },
  { type: 'photo', slug: 'wf-114', tag: 'indoor' },
  { type: 'photo', slug: 'wf-100', tag: 'indoor' },
  { type: 'video', slug: 'shorts/s08', tag: 'video' },
  { type: 'photo', slug: 'wf-079', tag: 'safety' },
  { type: 'photo', slug: 'wf-101', tag: 'indoor' },
  { type: 'video', slug: 'shorts/s09', tag: 'video' },
  { type: 'photo', slug: 'wf-086', tag: 'indoor' },
  { type: 'photo', slug: 'wf-092', tag: 'people' },
  { type: 'photo', slug: 'wf-102', tag: 'people' },
  { type: 'video', slug: 'shorts/s11', tag: 'video' },
  { type: 'photo', slug: 'wf-103', tag: 'people' },
  { type: 'video', slug: 'shorts/s13', tag: 'video' },
  { type: 'photo', slug: 'wf-087', tag: 'indoor' },
  { type: 'photo', slug: 'wf-104', tag: 'people' },
  { type: 'video', slug: 'shorts/s10', tag: 'video' },
  { type: 'photo', slug: 'wf-095', tag: 'indoor' },
  { type: 'video', slug: 'shorts/s12', tag: 'video' },
  { type: 'video', slug: 'shorts/s14', tag: 'video' },
]

export const filterGallery = (items: readonly GalleryItem[], filter: GalleryFilter) =>
  filter === 'all' ? items : items.filter((item) => item.tag === filter)
