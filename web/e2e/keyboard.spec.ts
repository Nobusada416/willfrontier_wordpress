import { expect, test } from '@playwright/test'
import { gotoHydrated } from './support/page'

test.describe('スキップリンク', () => {
  test('最初の Tab でスキップリンクにフォーカスが移り、Enter で本文へ移動する', async ({
    page,
  }) => {
    await gotoHydrated(page, '/service/')

    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: '本文へスキップ' })
    await expect(skipLink).toBeFocused()
    await expect(skipLink).toBeVisible()

    await page.keyboard.press('Enter')
    await expect(page.locator('main')).toBeFocused()
    await expect(page).toHaveURL(/\/service\/#main$/)
  })
})

test.describe('ハンバーガーメニュー（スマホ幅）', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('キーボードで開き、メニュー内でフォーカスが循環し、Esc で閉じてボタンへ戻る', async ({
    page,
  }) => {
    await gotoHydrated(page, '/service/')
    const menuButton = page.getByRole('button', { name: 'メニュー', exact: true })
    const dialog = page.getByRole('dialog', { name: 'メニュー' })
    const closeButton = dialog.getByRole('button', { name: 'メニューを閉じる' })

    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    await menuButton.focus()
    await page.keyboard.press('Enter')

    await expect(dialog).toBeVisible()
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    await expect(closeButton).toBeFocused()

    // 先頭（閉じるボタン）で Shift+Tab を押すと末尾（CONTACT）へ移る
    await page.keyboard.press('Shift+Tab')
    await expect(dialog.getByRole('link', { name: 'CONTACT' })).toBeFocused()
    // 末尾で Tab を押すと先頭へ戻る
    await page.keyboard.press('Tab')
    await expect(closeButton).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    await expect(menuButton).toBeFocused()
  })

  test('閉じるボタンで閉じられる', async ({ page }) => {
    await gotoHydrated(page, '/service/')
    const menuButton = page.getByRole('button', { name: 'メニュー', exact: true })
    const dialog = page.getByRole('dialog', { name: 'メニュー' })

    await menuButton.click()
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(dialog).toBeHidden()
    await expect(menuButton).toBeFocused()
  })

  test('メニューのリンクで移動するとメニューが閉じる', async ({ page }) => {
    await gotoHydrated(page, '/service/')
    await page.getByRole('button', { name: 'メニュー', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'メニュー' })

    await dialog.getByRole('link', { name: 'WORKFLOW' }).click()
    await expect(page).toHaveURL(/\/workflow\/$/)
    await expect(dialog).toBeHidden()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
