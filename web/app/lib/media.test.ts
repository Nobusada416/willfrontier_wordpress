import { describe, expect, it } from 'vitest'
import { crossfadeDelay, photoSrc, photoSrcSet, posterSrc, videoSrc } from './media'

describe('写真のパス', () => {
  it('大きい写真を src に使う', () => {
    expect(photoSrc('wf-079')).toBe('/media/photos/large/wf-079.webp')
  })

  it('srcset は small を 768w、large を 1600w として並べる', () => {
    expect(photoSrcSet('wf-079')).toBe(
      '/media/photos/small/wf-079.webp 768w, /media/photos/large/wf-079.webp 1600w',
    )
  })
})

describe('動画のパス', () => {
  it('スラッグから mp4 のパスを作る', () => {
    expect(videoSrc('shorts/s08')).toBe('/media/videos/shorts/s08.mp4')
  })

  it('poster は動画と同じ場所の同名 jpg', () => {
    expect(posterSrc('shorts/s13')).toBe('/media/videos/shorts/s13.jpg')
  })
})

describe('crossfadeDelay', () => {
  // 3 枚・1 周 12 秒（1 枚 4 秒、うちフェード 1 秒）のとき、
  // 読み込み直後は 1 枚目だけが見えている位相から始める
  it('1 枚目はフェードインを終えた位相から始める', () => {
    expect(crossfadeDelay(0, 12)).toBe(-1)
  })

  it('2 枚目は 3 秒後にフェードインを始める位相', () => {
    expect(crossfadeDelay(1, 12)).toBe(-9)
  })

  it('3 枚目は非表示の位相から始める', () => {
    expect(crossfadeDelay(2, 12)).toBe(-5)
  })
})
