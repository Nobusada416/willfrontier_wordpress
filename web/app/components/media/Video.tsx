import { useEffect, useRef, useState } from 'react'
import { posterSrc, videoSrc } from '~/lib/media'
import { useReducedMotion } from '~/lib/useReducedMotion'

type VideoProps = {
  // 'shorts/s08' のような動画スラッグ
  slug: string
  // poster に使う画像のスラッグ（動画と同じ場所の同名 jpg）
  poster?: string
  // 内容を伝える必要がある動画に付ける。無ければ装飾として読み上げ対象から外す
  // 一時停止ボタンの名前にも使うため、1 ページに複数置く場合は付けて区別できるようにする
  label?: string
  // 外枠（一時停止ボタンの基準位置）のクラス
  className?: string
  videoClassName?: string
}

// 画面に近づいたら読み込み始める距離
const PRELOAD_MARGIN = '200px'

// 旧テーマの wf_video を移植した、ミュート・ループの自動再生動画
// 旧実装は全動画をページ表示時に読み込んでいたため、画面に近づくまで src を付けず、
// 画面外では一時停止する。自動で動く映像は止められる必要がある（WCAG 2.2.2）ため一時停止ボタンを付ける
export function Video({ slug, poster, label, className, videoClassName }: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const reducedMotion = useReducedMotion()
  // 一度でも画面に近づいたか（近づいたら src を付ける）
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  // 利用者がボタンで選んだ状態。未操作なら OS の設定に従う
  const [userChoice, setUserChoice] = useState<'play' | 'pause' | null>(null)
  const wantsPlay = userChoice ? userChoice === 'play' : !reducedMotion

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // 対応ブラウザ（Baseline）はすべて IntersectionObserver を備えている
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) setLoaded(true)
        setInView(entry.isIntersecting)
      },
      { rootMargin: PRELOAD_MARGIN },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !loaded) return
    if (!inView || !wantsPlay) {
      video.pause()
      return
    }
    // 状態が変わった後に古い play() の結果が返ってきても反映しない
    let stale = false
    video.play().catch((error: unknown) => {
      // 画面外に出て pause() された場合の中断は想定内なので状態を変えない
      if (stale || (error instanceof DOMException && error.name === 'AbortError')) return
      // 自動再生が拒否された場合は、利用者が再生ボタンで始められるようにする
      setUserChoice('pause')
    })
    return () => {
      stale = true
    }
  }, [loaded, inView, wantsPlay])

  return (
    <div className={`relative ${className ?? ''}`}>
      <video
        ref={videoRef}
        src={loaded ? videoSrc(slug) : undefined}
        poster={poster ? posterSrc(poster) : undefined}
        preload={loaded ? 'metadata' : 'none'}
        muted
        loop
        playsInline
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className={videoClassName}
      />
      <button
        type="button"
        onClick={() => setUserChoice(wantsPlay ? 'pause' : 'play')}
        className="absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className="sr-only">{`${label ?? '動画'}を${wantsPlay ? '一時停止' : '再生'}`}</span>
        <span aria-hidden="true" className="text-sm leading-none">
          {wantsPlay ? '❚❚' : '▶'}
        </span>
      </button>
    </div>
  )
}
