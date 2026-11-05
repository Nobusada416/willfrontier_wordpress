import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MOTION_OK_QUERY } from '~/lib/motion/gsap'
import { REDUCED_MOTION_QUERY } from '~/lib/useReducedMotion'
import { stubMatchMedia } from '~/test/matchMedia'
import { Mission } from './Mission'

afterEach(() => {
  vi.unstubAllGlobals()
})

const renderMission = () => {
  stubMatchMedia({ [REDUCED_MOTION_QUERY]: false, [MOTION_OK_QUERY]: true })
  return render(
    <MemoryRouter>
      <Mission />
    </MemoryRouter>,
  )
}

const backgroundImages = () =>
  Array.from(document.querySelectorAll<HTMLImageElement>('[data-frame] img'))

describe('Mission（トップの MISSION）', () => {
  it('背景の写真 3 枚を、薄く重ねて切り替える', () => {
    renderMission()
    const images = backgroundImages()
    expect(images.map((img) => img.getAttribute('src'))).toEqual([
      '/media/photos/large/wf-114.webp',
      '/media/photos/large/wf-079.webp',
      '/media/photos/large/wf-092.webp',
    ])
    images.forEach((img) => expect(img).toHaveClass('opacity-16'))
  })

  // P9 の Lighthouse: 濃さ 16% の背景に幅 768px 以上の写真を読み込んでいた。
  // スマホでは画面幅の半分弱の解像度で選ばせ、xsmall（短辺 400px）か幅 360px の small を使う
  it('スマホでは画面幅の 45% として写真を選ばせ、xsmall から選べる', () => {
    renderMission()
    const images = backgroundImages()
    images.forEach((img) => expect(img).toHaveAttribute('sizes', '(max-width: 767px) 45vw, 100vw'))
    expect(images[1]?.getAttribute('srcset')).toMatch(
      /^\/media\/photos\/xsmall\/wf-079\.webp 400w, /,
    )
  })
})
