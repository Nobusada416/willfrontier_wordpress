import { CASE_STUDY_UPLOAD_MAX_BYTES } from '@wf/shared'
import { describe, expect, it, vi } from 'vitest'
import { fitWidth, PhotoError, processPhotoFile, SOURCE_MAX_BYTES, type ImageCodec } from './photos'

const file = (name: string, type: string, size = 1000) =>
  new File([new Uint8Array(size)], name, { type, lastModified: 0 })

// ブラウザの読み込み（createImageBitmap）と書き出し（canvas.toBlob）の代わり
const fakeCodec = ({
  width = 4000,
  height = 3000,
  decodeError,
  outputType = 'image/webp',
  outputSize = 1000,
}: {
  width?: number
  height?: number
  decodeError?: Error
  outputType?: string
  outputSize?: number
} = {}) => {
  const close = vi.fn()
  const codec: ImageCodec = {
    decode: vi.fn(async () => {
      if (decodeError) throw decodeError
      return { width, height, source: 'bitmap', close }
    }),
    encode: vi.fn(async () => new Blob([new Uint8Array(outputSize)], { type: outputType })),
  }
  return { codec, close }
}

describe('fitWidth（縮小後の寸法）', () => {
  it('幅を上限に合わせ、縦横比を保つ', () => {
    expect(fitWidth(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 })
    expect(fitWidth(4000, 3000, 768)).toEqual({ width: 768, height: 576 })
  })

  it('元の画像が上限より小さければ拡大しない', () => {
    expect(fitWidth(1000, 750, 1600)).toEqual({ width: 1000, height: 750 })
  })

  it('高さは四捨五入し、1px 未満にはしない', () => {
    expect(fitWidth(3000, 2001, 1600)).toEqual({ width: 1600, height: 1067 })
    expect(fitWidth(10000, 1, 768)).toEqual({ width: 768, height: 1 })
  })
})

describe('processPhotoFile（写真の縮小と変換）', () => {
  it('small 768px・large 1600px 幅の webp を作り、寸法は large のもの', async () => {
    const { codec, close } = fakeCodec()
    const result = await processPhotoFile(file('a.jpg', 'image/jpeg'), codec)

    expect(codec.encode).toHaveBeenCalledWith('bitmap', 768, 576, 'image/webp', expect.any(Number))
    expect(codec.encode).toHaveBeenCalledWith(
      'bitmap',
      1600,
      1200,
      'image/webp',
      expect.any(Number),
    )
    expect(result.width).toBe(1600)
    expect(result.height).toBe(1200)
    expect(result.files.small.type).toBe('image/webp')
    expect(result.files.large.type).toBe('image/webp')
    // 読み込んだ画像のメモリを解放する
    expect(close).toHaveBeenCalled()
  })

  it('元が小さい写真は拡大しない（large は元の寸法のまま）', async () => {
    const { codec } = fakeCodec({ width: 1000, height: 500 })
    const result = await processPhotoFile(file('a.png', 'image/png'), codec)

    expect(codec.encode).toHaveBeenCalledWith('bitmap', 768, 384, 'image/webp', expect.any(Number))
    expect(codec.encode).toHaveBeenCalledWith('bitmap', 1000, 500, 'image/webp', expect.any(Number))
    expect(result).toMatchObject({ width: 1000, height: 500 })
  })

  it('JPEG・PNG・HEIC 以外は選べない', async () => {
    const { codec } = fakeCodec()
    await expect(processPhotoFile(file('a.gif', 'image/gif'), codec)).rejects.toThrow(
      'JPEG・PNG・HEIC の写真を選んでください。',
    )
    await expect(processPhotoFile(file('a.pdf', 'application/pdf'), codec)).rejects.toBeInstanceOf(
      PhotoError,
    )
    expect(codec.decode).not.toHaveBeenCalled()
  })

  it('種類が分からないファイルは拡張子で判断する', async () => {
    const { codec } = fakeCodec()
    await expect(processPhotoFile(file('IMG_0001.HEIC', ''), codec)).resolves.toBeDefined()
    await expect(processPhotoFile(file('memo.txt', ''), codec)).rejects.toBeInstanceOf(PhotoError)
  })

  it('20MB を超える写真は選べない', async () => {
    const { codec } = fakeCodec()
    expect(SOURCE_MAX_BYTES).toBe(20 * 1024 * 1024)
    await expect(
      processPhotoFile(file('big.jpg', 'image/jpeg', SOURCE_MAX_BYTES + 1), codec),
    ).rejects.toThrow('写真は 1 枚 20MB までです。')
  })

  it('HEIC をブラウザが読めなければ、JPEG にしてから選ぶよう案内する', async () => {
    const { codec } = fakeCodec({ decodeError: new Error('decode') })
    await expect(processPhotoFile(file('IMG_0001.heic', 'image/heic'), codec)).rejects.toThrow(
      /HEIC.*このブラウザでは読み込めません/,
    )
  })

  it('壊れた写真などで読み込めなければエラー', async () => {
    const { codec } = fakeCodec({ decodeError: new Error('decode') })
    await expect(processPhotoFile(file('a.jpg', 'image/jpeg'), codec)).rejects.toThrow(
      'この写真を読み込めませんでした。別の写真を選んでください。',
    )
  })

  it('ブラウザが webp に変換できなければエラー（Safari など）', async () => {
    const { codec } = fakeCodec({ outputType: 'image/png' })
    await expect(processPhotoFile(file('a.jpg', 'image/jpeg'), codec)).rejects.toThrow(
      /このブラウザでは写真を変換できません/,
    )
  })

  it('変換後に 2MB を超えればエラー', async () => {
    const { codec, close } = fakeCodec({ outputSize: CASE_STUDY_UPLOAD_MAX_BYTES + 1 })
    await expect(processPhotoFile(file('a.jpg', 'image/jpeg'), codec)).rejects.toThrow(/2MB/)
    expect(close).toHaveBeenCalled()
  })
})
