import { expect, test } from '@playwright/test'
import { PAGES } from '../app/content/pages'
import { gotoHydrated } from './support/page'

// プリレンダーした HTML と hydrate の結果が食い違うと React がコンソールにエラーを出す。
// <head> のスクリプト（アニメーションの準備・フォントの読み込み）が DOM を書き換えても、エラーにならないことを確かめる
for (const page of PAGES) {
  test(`${page.id}（${page.path}）でコンソールにエラーが出ない`, async ({ page: browserPage }) => {
    const errors: string[] = []
    browserPage.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    browserPage.on('pageerror', (error) => errors.push(error.message))

    await gotoHydrated(browserPage, page.path)

    expect(errors).toEqual([])
  })
}
