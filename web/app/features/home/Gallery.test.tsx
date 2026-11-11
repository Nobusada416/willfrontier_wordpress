import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GALLERY_ITEMS } from '~/content/gallery'
import { stubIntersectionObserver } from '~/test/intersectionObserver'
import { stubMatchMedia } from '~/test/matchMedia'
import { Gallery } from './Gallery'

beforeEach(() => {
  stubMatchMedia()
  stubIntersectionObserver()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const getFilter = (name: string) => screen.getByRole('button', { name })
const getItems = () =>
  within(screen.getByRole('list', { name: 'ギャラリー' })).getAllByRole('listitem')

describe('Gallery', () => {
  it('最初は ALL が選ばれ、すべての写真と動画を表示する', () => {
    render(<Gallery />)
    expect(getFilter('ALL')).toHaveAttribute('aria-pressed', 'true')
    expect(getFilter('動画')).toHaveAttribute('aria-pressed', 'false')
    expect(getItems()).toHaveLength(GALLERY_ITEMS.length)
  })

  it('タグを選ぶと、そのタグのものだけを表示し、選択状態を切り替える', async () => {
    const user = userEvent.setup()
    render(<Gallery />)
    await user.click(getFilter('動画'))

    expect(getFilter('動画')).toHaveAttribute('aria-pressed', 'true')
    expect(getFilter('ALL')).toHaveAttribute('aria-pressed', 'false')
    const videos = GALLERY_ITEMS.filter((item) => item.type === 'video')
    expect(getItems()).toHaveLength(videos.length)
    getItems().forEach((item) => expect(item.querySelector('video')).not.toBeNull())
  })

  it('ALL に戻すとすべて表示する', async () => {
    const user = userEvent.setup()
    render(<Gallery />)
    await user.click(getFilter('人・笑顔'))
    await user.click(getFilter('ALL'))
    expect(getItems()).toHaveLength(GALLERY_ITEMS.length)
  })

  it('表示件数を読み上げ用に知らせる', async () => {
    const user = userEvent.setup()
    render(<Gallery />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(`${GALLERY_ITEMS.length}件を表示しています`)
    await user.click(getFilter('安全・地域'))
    const count = GALLERY_ITEMS.filter((item) => item.tag === 'safety').length
    expect(status).toHaveTextContent(`${count}件を表示しています`)
  })

  it('動画の一時停止ボタンは動画ごとに区別できる名前を持つ', () => {
    render(<Gallery />)
    const buttons = screen.getAllByRole('button', { name: /を一時停止$/ })
    const names = buttons.map((button) => button.textContent)
    expect(new Set(names).size).toBe(names.length)
  })
})
