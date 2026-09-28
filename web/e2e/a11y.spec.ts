import { expect, test } from '@playwright/test'
import { PAGES } from '../app/content/pages'
import { formatViolations, scanA11y } from './support/axe'

// 全ページと 404 を axe（WCAG 2.1 AA）で検査する
// 「動きを減らす」設定で開き、スクロールで表示する要素やイントロの幕が検査の邪魔をしないようにする
const TARGETS = [
  ...PAGES.map((page) => ({ name: page.id, path: page.path })),
  { name: '404', path: '/no-such-page/' },
]

const VIEWPORTS = [
  { name: 'PC', size: { width: 1280, height: 800 } },
  { name: 'スマホ', size: { width: 375, height: 812 } },
]

test.use({ reducedMotion: 'reduce' })
// axe の検査は要素の多いページで時間がかかるため、既定（30 秒）より長くする
test.describe.configure({ timeout: 60_000 })

for (const viewport of VIEWPORTS) {
  test.describe(`axe（${viewport.name}）`, () => {
    test.use({ viewport: viewport.size })

    for (const target of TARGETS) {
      test(`${target.name}（${target.path}）に違反がない`, async ({ page }, testInfo) => {
        await page.goto(target.path)
        await expect(page.locator('h1')).toBeVisible()

        const { violations, knownContrastIssues } = await scanA11y(page)

        // 許容したコントラスト不足は報告用に添付する（色の相談の資料）
        if (knownContrastIssues.length > 0) {
          await testInfo.attach('known-contrast-issues', {
            body: JSON.stringify({ path: target.path, issues: knownContrastIssues }, null, 2),
            contentType: 'application/json',
          })
        }
        expect(formatViolations(violations)).toEqual([])
      })
    }
  })
}
