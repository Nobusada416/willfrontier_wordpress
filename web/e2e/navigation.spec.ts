import { expect, test } from '@playwright/test'
import { gotoHydrated } from './support/page'

// フッターナビ（/#company など）で下層ページからトップの各セクションへ移動し、ブラウザの「戻る」で元のページへ戻る
const SECTIONS = [
  { label: 'COMPANY', hash: 'company' },
  { label: 'VEHICLES', hash: 'vehicles' },
]

for (const section of SECTIONS) {
  test(`下層ページからトップの #${section.hash} へ移動し、「戻る」で元のページへ戻る`, async ({
    page,
  }) => {
    await gotoHydrated(page, '/service/')
    const footerNav = page.getByRole('navigation', { name: 'フッターナビ' })

    await footerNav.getByRole('link', { name: section.label }).click()
    await expect(page).toHaveURL(new RegExp(`/#${section.hash}$`))
    await expect(page.locator(`#${section.hash}`)).toBeInViewport()

    await page.goBack()
    await expect(page).toHaveURL(/\/service\/$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/SERVICE|事業/)
  })
}

test('存在しない URL は 404 ページを返し、トップへ戻れる', async ({ page }) => {
  const response = await page.goto('/no-such-page/')
  expect(response?.status()).toBe(404)
  await expect(
    page.getByRole('heading', { level: 1, name: 'ページが見つかりません' }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'トップページへ戻る' }).click()
  await expect(page).toHaveURL(/\/$/)
})

test('末尾スラッシュなしの URL は付きの URL へ移る', async ({ page }) => {
  await page.goto('/mission')
  await expect(page).toHaveURL(/\/mission\/$/)
})
