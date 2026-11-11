import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PhotoMasonry } from './PhotoMasonry'

describe('PhotoMasonry', () => {
  it('写真を一覧として並べ、読み込み前から高さを確保する', () => {
    render(<PhotoMasonry label="地域と共にの写真" slugs={['wf-114', 'wf-092']} />)
    const list = screen.getByRole('list', { name: '地域と共にの写真' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    const image = items[0]?.querySelector('img')
    expect(image).toHaveAttribute('src', '/media/photos/large/wf-114.webp')
    expect(image).toHaveAttribute('width')
    expect(image).toHaveAttribute('height')
  })
})
