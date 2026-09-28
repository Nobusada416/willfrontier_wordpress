import { expect, type Page } from '@playwright/test'

// ページを開き、React の hydrate が終わるまで待つ
// （SmoothScroll が初回の描画後に <html data-motion="ready"> を付ける。lib/motion/headScript.ts）
// hydrate 前はボタンのクリックなどに反応しないため、操作するテストはこれを使う
export async function gotoHydrated(page: Page, path: string) {
  await page.goto(path)
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'ready')
}

// 127.0.0.1（テスト用の配信）以外への通信をすべて遮断する
// フォームの送信処理（Firebase）を E2E から呼ばないようにするため
export async function blockExternalRequests(page: Page) {
  await page.route(
    (url) => url.hostname !== '127.0.0.1',
    (route) => route.abort('internetdisconnected'),
  )
}
