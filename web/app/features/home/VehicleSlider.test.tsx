import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { stubMatchMedia } from '~/test/matchMedia'
import { VehicleSlider } from './VehicleSlider'

const SLIDES = [
  { slug: 'wf-079', en: 'SAFETY', ja: '安全朝礼' },
  { slug: 'wf-086', en: 'SORTING', ja: '選別作業' },
  { slug: 'wf-092', en: 'TEAM', ja: 'チームワーク' },
] as const

beforeEach(() => {
  stubMatchMedia()
})

const getSlides = () => screen.getAllByRole('group', { hidden: true })
const currentSlide = () => {
  const visible = getSlides().filter((slide) => slide.getAttribute('aria-hidden') !== 'true')
  expect(visible).toHaveLength(1)
  return visible[0]
}

describe('VehicleSlider', () => {
  it('スライダーであることと、各スライドの位置を読み上げられる', () => {
    render(<VehicleSlider slides={SLIDES} />)
    const region = screen.getByRole('region', { name: '車両ラインナップ' })
    expect(region).toHaveAttribute('aria-roledescription', 'カルーセル')
    expect(getSlides()).toHaveLength(3)
    expect(getSlides()[1]).toHaveAttribute('aria-label', '2 / 3')
    expect(getSlides()[1]).toHaveAttribute('aria-roledescription', 'スライド')
  })

  it('切り替えた内容を読み上げで伝える', () => {
    render(<VehicleSlider slides={SLIDES} />)
    expect(getSlides()[0]?.parentElement).toHaveAttribute('aria-live', 'polite')
  })

  it('最初は 1 枚目だけを表示し、他のスライドは読み上げ・操作の対象から外す', () => {
    render(<VehicleSlider slides={SLIDES} />)
    expect(currentSlide()).toHaveTextContent('SAFETY')
    getSlides()
      .slice(1)
      .forEach((slide) => expect(slide).toHaveAttribute('inert'))
  })

  it('次へ・前へで切り替わり、端では反対側へ戻る', async () => {
    const user = userEvent.setup()
    render(<VehicleSlider slides={SLIDES} />)
    await user.click(screen.getByRole('button', { name: '次のスライド' }))
    expect(currentSlide()).toHaveTextContent('SORTING')
    await user.click(screen.getByRole('button', { name: '次のスライド' }))
    await user.click(screen.getByRole('button', { name: '次のスライド' }))
    expect(currentSlide()).toHaveTextContent('SAFETY')
    await user.click(screen.getByRole('button', { name: '前のスライド' }))
    expect(currentSlide()).toHaveTextContent('TEAM')
  })

  it('ページ送りのボタンで指定したスライドを表示し、現在の位置を示す', async () => {
    const user = userEvent.setup()
    render(<VehicleSlider slides={SLIDES} />)
    expect(screen.getByRole('button', { name: 'スライド 1 を表示' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await user.click(screen.getByRole('button', { name: 'スライド 3 を表示' }))
    expect(currentSlide()).toHaveTextContent('TEAM')
    expect(screen.getByRole('button', { name: 'スライド 3 を表示' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByRole('button', { name: 'スライド 1 を表示' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('左右にスワイプすると切り替わり、小さな動きでは切り替わらない', () => {
    render(<VehicleSlider slides={SLIDES} />)
    const track = screen.getByTestId('slider-viewport')
    fireEvent.pointerDown(track, { clientX: 300, pointerId: 1 })
    fireEvent.pointerUp(track, { clientX: 290, pointerId: 1 })
    expect(currentSlide()).toHaveTextContent('SAFETY')

    fireEvent.pointerDown(track, { clientX: 300, pointerId: 1 })
    fireEvent.pointerUp(track, { clientX: 200, pointerId: 1 })
    expect(currentSlide()).toHaveTextContent('SORTING')

    fireEvent.pointerDown(track, { clientX: 100, pointerId: 1 })
    fireEvent.pointerUp(track, { clientX: 250, pointerId: 1 })
    expect(currentSlide()).toHaveTextContent('SAFETY')
  })
})
