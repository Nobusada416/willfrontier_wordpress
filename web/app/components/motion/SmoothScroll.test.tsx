import { render } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { REDUCED_MOTION_QUERY } from '~/lib/useReducedMotion'
import { stubMatchMedia } from '~/test/matchMedia'
import { SmoothScroll } from './SmoothScroll'

const lenis = vi.hoisted(() => ({
  instances: [] as { destroy: ReturnType<typeof vi.fn>; scrollTo: ReturnType<typeof vi.fn> }[],
}))

vi.mock('lenis', () => ({
  default: vi.fn(function Lenis() {
    const instance = {
      raf: vi.fn(),
      on: vi.fn(),
      stop: vi.fn(),
      start: vi.fn(),
      destroy: vi.fn(),
      scrollTo: vi.fn(),
      resize: vi.fn(),
    }
    lenis.instances.push(instance)
    return instance
  }),
}))

afterEach(() => {
  vi.unstubAllGlobals()
  lenis.instances.length = 0
  delete document.documentElement.dataset.motion
})

const renderSmoothScroll = () =>
  render(
    <MemoryRouter>
      <SmoothScroll />
    </MemoryRouter>,
  )

describe('SmoothScroll', () => {
  it('慣性スクロールを有効にし、アンマウントで破棄する', () => {
    stubMatchMedia()
    const { unmount } = renderSmoothScroll()
    expect(lenis.instances).toHaveLength(1)
    unmount()
    expect(lenis.instances[0]?.destroy).toHaveBeenCalled()
  })

  it('動きを減らす設定では慣性スクロールを使わない', () => {
    stubMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    renderSmoothScroll()
    expect(lenis.instances).toHaveLength(0)
  })

  it('アニメーションの準備ができたことを <html> に記録する', () => {
    stubMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    renderSmoothScroll()
    expect(document.documentElement.dataset.motion).toBe('ready')
  })

  it('ページ遷移後は慣性スクロールの位置を現在のスクロール位置に合わせる', async () => {
    stubMatchMedia()
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SmoothScroll />
        <Link to="/mission/">MISSION</Link>
      </MemoryRouter>,
    )
    const instance = lenis.instances[0]
    instance?.scrollTo.mockClear()
    await user.click(screen.getByRole('link', { name: 'MISSION' }))
    expect(instance?.scrollTo).toHaveBeenCalledWith(window.scrollY, { immediate: true })
  })
})
