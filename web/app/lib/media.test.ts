import { describe, expect, it } from 'vitest'
import {
  remotePhotoAttributes,
  crossfadeDelay,
  photoSize,
  photoSrc,
  photoSrcSet,
  posterSize,
  posterSrc,
  videoSrc,
} from './media'

describe('写真のパス', () => {
  it('大きい写真を src に使う', () => {
    expect(photoSrc('wf-079')).toBe('/media/photos/large/wf-079.webp')
  })

  it('srcset には small / large の実際の幅を書く', () => {
    expect(photoSrcSet('wf-079')).toBe(
      '/media/photos/small/wf-079.webp 768w, /media/photos/large/wf-079.webp 1600w',
    )
    // 旧実装は一律 768w としていたため、実際は幅 360px の small が 768px 相当として選ばれていた
    expect(photoSrcSet('wf-114')).toMatch(/^\/media\/photos\/small\/wf-114\.webp 360w, /)
  })

  it('large の実寸を返す（width / height 属性で読み込み前から高さを確保する）', () => {
    expect(photoSize('wf-079')).toEqual({ width: 1600, height: 2133 })
  })

  it('一覧に無い写真は srcset と寸法を返さない', () => {
    expect(photoSrcSet('wf-000')).toBeUndefined()
    expect(photoSize('wf-000')).toBeUndefined()
  })
})

describe('remotePhotoAttributes（管理画面でアップロードした写真）', () => {
  const photo = {
    smallUrl: 'https://firebasestorage.googleapis.com/s.webp',
    largeUrl: 'https://firebasestorage.googleapis.com/l.webp',
    width: 1600,
    height: 1200,
  }

  it('large を src にし、small（幅 768px に縮小したもの）と large を srcset に並べる', () => {
    expect(remotePhotoAttributes(photo)).toEqual({
      src: photo.largeUrl,
      srcSet: `${photo.smallUrl} 768w, ${photo.largeUrl} 1600w`,
      width: 1600,
      height: 1200,
    })
  })

  it('元の画像が 768px 以下で small と large が同じ幅なら srcset を付けない', () => {
    expect(remotePhotoAttributes({ ...photo, width: 600, height: 400 })).toEqual({
      src: photo.largeUrl,
      srcSet: undefined,
      width: 600,
      height: 400,
    })
  })
})

describe('動画のパス', () => {
  it('スラッグから mp4 のパスを作る', () => {
    expect(videoSrc('shorts/s08')).toBe('/media/videos/shorts/s08.mp4')
  })

  it('poster は動画と同じ場所の同名 jpg', () => {
    expect(posterSrc('shorts/s13')).toBe('/media/videos/shorts/s13.jpg')
  })

  it('poster の実寸を返す', () => {
    expect(posterSize('shorts/s08')).toEqual({ width: 1280, height: 720 })
    expect(posterSize('shorts/s00')).toBeUndefined()
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
