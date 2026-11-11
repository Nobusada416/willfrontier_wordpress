import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { REDUCED_MOTION_QUERY } from '~/lib/useReducedMotion'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import { Video } from './Video'

let observer: ReturnType<typeof stubIntersectionObserver>
let play: ReturnType<typeof vi.fn<() => Promise<void>>>
let pause: ReturnType<typeof vi.fn<() => void>>

beforeEach(() => {
  observer = stubIntersectionObserver()
  // jsdom は動画の再生を実装していないため、play / pause を差し替える
  play = vi.fn<() => Promise<void>>(() => Promise.resolve())
  pause = vi.fn<() => void>()
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play)
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const getVideo = () => {
  const video = document.querySelector('video')
  if (!video) throw new Error('video 要素がありません')
  return video
}

const scrollIntoView = (inView: boolean) =>
  act(() => {
    observer.trigger(getVideo(), inView)
  })

describe('Video', () => {
  it('画面に近づくまでは動画も poster も読み込まない', () => {
    stubMatchMedia()
    render(<Video slug="shorts/s08" poster="shorts/s08" />)
    const video = getVideo()
    expect(video).not.toHaveAttribute('src')
    expect(video).toHaveAttribute('preload', 'none')
    // poster は preload="none" でもページ表示時に読み込まれるため、画面に近づくまで付けない
    // （P9 の Lighthouse で、トップでは画面外の動画の poster 7 枚・約 600KB が最初に読み込まれていた）
    expect(video).not.toHaveAttribute('poster')
    expect(play).not.toHaveBeenCalled()
  })

  it('画面に近づくと poster を付ける', () => {
    stubMatchMedia()
    render(<Video slug="shorts/s08" poster="shorts/s08" />)
    scrollIntoView(true)
    expect(getVideo()).toHaveAttribute('poster', '/media/videos/shorts/s08.jpg')
  })

  it('poster の実寸を width / height に付け、読み込み前から高さを確保する', () => {
    stubMatchMedia()
    render(<Video slug="shorts/s08" poster="shorts/s08" />)
    expect(getVideo()).toHaveAttribute('width', '1280')
    expect(getVideo()).toHaveAttribute('height', '720')
  })

  it('画面に入ると読み込んで自動再生する（ミュート・ループ・インライン再生）', () => {
    stubMatchMedia()
    render(<Video slug="shorts/s08" />)
    scrollIntoView(true)
    const video = getVideo()
    expect(video).toHaveAttribute('src', '/media/videos/shorts/s08.mp4')
    expect(video.muted).toBe(true)
    expect(video.loop).toBe(true)
    expect(video).toHaveAttribute('playsinline')
    expect(play).toHaveBeenCalled()
  })

  it('画面外に出ると一時停止する', () => {
    stubMatchMedia()
    render(<Video slug="shorts/s08" />)
    scrollIntoView(true)
    scrollIntoView(false)
    expect(pause).toHaveBeenCalled()
  })

  it('一時停止ボタンで止め、再生ボタンで再開できる', async () => {
    stubMatchMedia()
    const user = userEvent.setup()
    render(<Video slug="shorts/s08" />)
    scrollIntoView(true)

    await user.click(screen.getByRole('button', { name: '動画を一時停止' }))
    expect(pause).toHaveBeenCalled()

    play.mockClear()
    await user.click(screen.getByRole('button', { name: '動画を再生' }))
    expect(play).toHaveBeenCalled()
  })

  it('視差効果を減らす設定では自動再生せず、再生ボタンを出す', async () => {
    stubMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    const user = userEvent.setup()
    render(<Video slug="shorts/s08" />)
    scrollIntoView(true)
    expect(play).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '動画を再生' }))
    expect(play).toHaveBeenCalled()
  })

  it('ブラウザが自動再生を拒否したら再生ボタンに切り替える', async () => {
    stubMatchMedia()
    play.mockImplementation(() => Promise.reject(new DOMException('blocked', 'NotAllowedError')))
    render(<Video slug="shorts/s08" />)
    scrollIntoView(true)
    expect(await screen.findByRole('button', { name: '動画を再生' })).toBeInTheDocument()
  })

  it('pause() による再生の中断（AbortError）では一時停止表示に切り替えない', async () => {
    stubMatchMedia()
    const rejection = Promise.reject(new DOMException('aborted', 'AbortError'))
    play.mockImplementation(() => rejection)
    render(<Video slug="shorts/s08" />)
    scrollIntoView(true)
    await act(async () => {
      await rejection.catch(() => undefined)
    })
    expect(screen.getByRole('button', { name: '動画を一時停止' })).toBeInTheDocument()
  })

  it('状態が変わった後に失敗した古い play() では一時停止表示に切り替えない', async () => {
    stubMatchMedia()
    let rejectFirst: (error: unknown) => void = () => undefined
    const first = new Promise<void>((_, reject) => {
      rejectFirst = reject
    })
    play.mockImplementationOnce(() => first)
    render(<Video slug="shorts/s08" />)
    scrollIntoView(true)
    // 画面外に出て戻ると 2 回目の play() が成功する
    scrollIntoView(false)
    scrollIntoView(true)
    await act(async () => {
      rejectFirst(new DOMException('blocked', 'NotAllowedError'))
      await first.catch(() => undefined)
    })
    expect(screen.getByRole('button', { name: '動画を一時停止' })).toBeInTheDocument()
  })

  it('label があればボタン名に動画の名前を含める', () => {
    stubMatchMedia()
    render(<Video slug="shorts/s08" label="重機の作業風景" />)
    expect(screen.getByRole('button', { name: '重機の作業風景を一時停止' })).toBeInTheDocument()
  })

  it('label が無ければ装飾扱い、あれば動画の説明として読み上げる', () => {
    stubMatchMedia()
    const { rerender } = render(<Video slug="shorts/s08" />)
    expect(getVideo()).toHaveAttribute('aria-hidden', 'true')
    rerender(<Video slug="shorts/s08" label="重機の作業風景" />)
    expect(getVideo()).toHaveAttribute('aria-label', '重機の作業風景')
    expect(getVideo()).not.toHaveAttribute('aria-hidden')
  })

  it('アンマウント時に監視をやめる', () => {
    stubMatchMedia()
    const { unmount } = render(<Video slug="shorts/s08" />)
    expect(observer.count).toBe(1)
    unmount()
    expect(observer.count).toBe(0)
  })
})
