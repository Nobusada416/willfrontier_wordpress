import { type PointerEvent, useRef, useState } from 'react'
import { Picture } from '~/components/media/Picture'

type Slide = {
  slug: string
  en: string
  ja: string
}

type VehicleSliderProps = {
  slides: readonly Slide[]
}

// これより大きく横に動かしたらスワイプとみなす（px）
const SWIPE_THRESHOLD = 40

const ARROW_PATH =
  'M16.5 3c-.5 0-1 .2-1.4.6l-9 8c-.8.7-.8 2 0 2.8l9 8c.8.7 2.1.4 2.6-.4.2-.3.3-.7.3-1V5c0-1.1-.9-2-2-2z'

// 1 枚ずつ表示するスライダー（旧実装は CDN の Swiper）
// 3 枚だけの単純な切り替えのため、依存を増やさず自前で実装し、WAI-ARIA のカルーセルの作法に合わせる
export function VehicleSlider({ slides }: VehicleSliderProps) {
  const [current, setCurrent] = useState(0)
  const pointerStartX = useRef<number | null>(null)
  const count = slides.length

  // 端まで行ったら反対側へ戻る（旧実装の loop: true）
  const show = (index: number) => setCurrent((index + count) % count)

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX
    // マウスでスライダーの外まで動かしてから離しても pointerup を受け取れるようにする
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  const onPointerUp = (event: PointerEvent) => {
    const startX = pointerStartX.current
    pointerStartX.current = null
    if (startX === null) return
    const distance = event.clientX - startX
    if (Math.abs(distance) < SWIPE_THRESHOLD) return
    show(distance < 0 ? current + 1 : current - 1)
  }

  const arrowClass =
    'absolute top-[calc(50%-2.5rem)] z-10 -translate-y-1/2 p-1 transition-opacity hover:opacity-50 focus-visible:outline-2 focus-visible:outline-wf-navy'

  return (
    <div
      role="region"
      aria-roledescription="カルーセル"
      aria-label="車両ラインナップ"
      className="relative mx-auto max-w-[420px]"
    >
      <div
        data-testid="slider-viewport"
        className="touch-pan-y overflow-hidden select-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerStartX.current = null
        }}
      >
        {/* 自動では切り替わらないため、操作で変わった内容を読み上げる */}
        <div
          aria-live="polite"
          className="flex motion-safe:transition-transform motion-safe:duration-500"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, index) => {
            const hidden = index !== current
            return (
              <div
                key={slide.slug}
                role="group"
                aria-roledescription="スライド"
                aria-label={`${index + 1} / ${count}`}
                aria-hidden={hidden || undefined}
                inert={hidden}
                className="flex w-full shrink-0 flex-col items-center"
              >
                <div className="aspect-square w-full overflow-hidden bg-white shadow-[0_4px_24px_rgb(0_0_0/0.1)]">
                  <Picture
                    slug={slide.slug}
                    alt={slide.ja}
                    sizes="420px"
                    className="pointer-events-none h-full w-full object-cover"
                  />
                </div>
                <p className="mt-5 font-en text-xl font-bold tracking-wider text-wf-text">
                  {slide.en}
                  <span className="ml-2 text-sm font-bold text-gray-500">{slide.ja}</span>
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* スマホでは画面からはみ出さないよう、画像の内側に重ねる */}
      <button
        type="button"
        aria-label="前のスライド"
        onClick={() => show(current - 1)}
        className={`${arrowClass} left-1 max-sm:rounded-full max-sm:bg-white/70 sm:-left-14`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-9 fill-wf-navy sm:size-11">
          <path d={ARROW_PATH} />
        </svg>
      </button>
      <button
        type="button"
        aria-label="次のスライド"
        onClick={() => show(current + 1)}
        className={`${arrowClass} right-1 max-sm:rounded-full max-sm:bg-white/70 sm:-right-14`}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-9 -scale-x-100 fill-wf-navy sm:size-11"
        >
          <path d={ARROW_PATH} />
        </svg>
      </button>

      <div className="mt-5 flex justify-center gap-4">
        {slides.map((slide, index) => (
          <button
            key={slide.slug}
            type="button"
            aria-label={`スライド ${index + 1} を表示`}
            aria-current={index === current || undefined}
            onClick={() => show(index)}
            className="size-3.5 rounded-full border-2 border-wf-blue transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wf-blue aria-[current=true]:bg-wf-blue"
          />
        ))}
      </div>
    </div>
  )
}
