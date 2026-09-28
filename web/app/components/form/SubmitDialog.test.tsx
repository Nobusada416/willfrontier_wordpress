import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SubmitDialog } from './SubmitDialog'

describe('SubmitDialog', () => {
  it('open のときだけモーダルとして開き、見出しを名前にする', () => {
    const { rerender } = render(
      <SubmitDialog open={false} title="送信完了" onClose={vi.fn()}>
        お問い合わせを受け付けました。
      </SubmitDialog>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(
      <SubmitDialog open title="送信完了" onClose={vi.fn()}>
        お問い合わせを受け付けました。
      </SubmitDialog>,
    )
    const dialog = screen.getByRole('dialog', { name: '送信完了' })
    expect(dialog).toHaveTextContent('お問い合わせを受け付けました。')
  })

  it('「閉じる」で閉じて onClose を呼ぶ', async () => {
    const onClose = vi.fn()
    render(
      <SubmitDialog open title="応募完了" onClose={onClose}>
        応募を受け付けました。
      </SubmitDialog>,
    )
    await userEvent.click(screen.getByRole('button', { name: '閉じる' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
