import { expect, test } from '@playwright/test'
import { blockExternalRequests, gotoHydrated } from './support/page'

// フォームの送信処理（Firebase）は E2E では呼ばない。外部への通信を遮断し、
// 入力チェックと、送信に失敗したときの案内だけを確かめる（送信処理そのものは Vitest と Emulator で確認する）
const FORMS = [
  { page: '/contact/', submit: '送信する', firstRequired: '担当者名' },
  { page: '/safety/', submit: '送信する', firstRequired: '担当者名' },
  { page: '/recruit/', submit: '応募する', firstRequired: 'お名前' },
]

for (const form of FORMS) {
  test(`${form.page} のフォームを未入力で送ると、エラーが出て最初の必須項目にフォーカスが移る`, async ({
    page,
  }) => {
    await blockExternalRequests(page)
    await gotoHydrated(page, form.page)
    const formElement = page.locator('main form')

    await formElement.getByRole('button', { name: form.submit }).click()

    const firstField = formElement.getByRole('textbox', { name: form.firstRequired })
    await expect(firstField).toBeFocused()
    await expect(firstField).toHaveAttribute('aria-invalid', 'true')
    await expect(formElement.getByText(`${form.firstRequired}を入力してください`)).toBeVisible()
  })
}

test('お問い合わせフォームは、送信に失敗すると電話番号を添えた案内を出し、入力を残す', async ({
  page,
}) => {
  await blockExternalRequests(page)
  await gotoHydrated(page, '/contact/')
  const form = page.locator('main form')

  // キーボードだけで入力して送る
  await form.getByRole('textbox', { name: '担当者名' }).focus()
  await page.keyboard.type('山田 太郎')
  await page.keyboard.press('Tab')
  await page.keyboard.type('045-000-0000')
  await page.keyboard.press('Tab')
  await page.keyboard.type('E2E のテストです')
  await form.getByRole('button', { name: '送信する' }).focus()
  await page.keyboard.press('Enter')

  const alert = form.getByRole('alert')
  await expect(alert).toContainText('送信に失敗しました')
  await expect(alert.getByRole('link')).toHaveAttribute('href', /^tel:/)
  await expect(form.getByRole('textbox', { name: '担当者名' })).toHaveValue('山田 太郎')
  await expect(page.getByRole('dialog')).toBeHidden()
})
