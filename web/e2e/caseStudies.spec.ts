import { expect, test } from '@playwright/test'
import { formatViolations, scanA11y } from './support/axe'
import { mockCaseStudies, recordFirestoreRequests, testCases } from './support/caseStudies'
import { gotoHydrated } from './support/page'

// 施工事例（/casestudy/ とトップの CASE STUDY）の読み込みの表示。
// Firestore の REST の応答を page.route で差し替えて、成功・0 件・失敗を確かめる
// （実際の Firestore と firestore.rules の組み合わせは tests/integration/ の結合テストで確かめる）

const EMPTY_MESSAGE = '施工事例は準備中です。お問い合わせからお気軽にご相談ください。'
const ERROR_MESSAGE = '施工事例を読み込めませんでした。時間をおいて再度お試しください。'

test.describe('施工事例ページ（/casestudy/）', () => {
  test('Firebase の設定が無いビルドでは通信せず、失敗の案内と「再読み込み」を出す', async ({
    page,
  }) => {
    const requests = await recordFirestoreRequests(page)
    await gotoHydrated(page, '/casestudy/')
    const projects = page.getByRole('region', { name: '主要施工事例' })
    await expect(projects.getByText(ERROR_MESSAGE)).toBeVisible()
    await expect(projects.getByRole('button', { name: '再読み込み' })).toBeVisible()
    expect(requests).toEqual([])
  })

  test('公開中の事例を新しい順に CASE 01, 02… で表示し、写真を読み込む', async ({ page }) => {
    const requests = await mockCaseStudies(page, { cases: testCases(3) })
    await gotoHydrated(page, '/casestudy/')

    const list = page.getByRole('list', { name: '主要施工事例' })
    const articles = list.getByRole('article')
    await expect(articles).toHaveCount(3)
    await expect(articles.nth(0)).toContainText('CASE 01')
    await expect(articles.nth(0).getByRole('heading', { level: 3 })).toHaveText('テストの事例 1')
    await expect(articles.nth(2)).toContainText('CASE 03')

    // 公開中だけを日付の新しい順に、件数の指定なしで読む（firestore.rules が許可する形）
    expect(requests).toHaveLength(1)
    const query = (requests[0]?.postDataJSON() as { structuredQuery: Record<string, unknown> })
      .structuredQuery
    expect(query).toMatchObject({
      where: {
        fieldFilter: { field: { fieldPath: 'status' }, value: { stringValue: 'published' } },
      },
      orderBy: [{ field: { fieldPath: 'date' }, direction: 'DESCENDING' }],
    })
    expect(query).not.toHaveProperty('limit')

    const mainPhoto = articles.nth(0).getByRole('img', { name: 'case-1 の現場' })
    await mainPhoto.scrollIntoViewIfNeeded()
    await expect(mainPhoto).toHaveJSProperty('complete', true)
    expect(
      await mainPhoto.evaluate((image: HTMLImageElement) => image.naturalWidth),
    ).toBeGreaterThan(0)
    // 説明の無い写真は、タイトルで補う
    await expect(
      articles.nth(0).getByRole('img', { name: 'テストの事例 1の写真（2 枚目）' }),
    ).toBeAttached()
  })

  test('0 件なら準備中の案内を出す', async ({ page }) => {
    await mockCaseStudies(page, { cases: [] })
    await gotoHydrated(page, '/casestudy/')
    await expect(page.getByText(EMPTY_MESSAGE)).toBeVisible()
    await expect(page.getByRole('list', { name: '主要施工事例' })).toHaveCount(0)
  })

  test('失敗したら案内を出し、「再読み込み」で読み込み直せる', async ({ page }) => {
    const requests = await mockCaseStudies(page, { status: 503 }, { cases: testCases(1) })
    await gotoHydrated(page, '/casestudy/')
    const projects = page.getByRole('region', { name: '主要施工事例' })
    await expect(projects.getByText(ERROR_MESSAGE)).toBeVisible()

    await projects.getByRole('button', { name: '再読み込み' }).click()
    await expect(projects.getByRole('article')).toHaveCount(1)
    await expect(projects.getByText(ERROR_MESSAGE)).toHaveCount(0)
    expect(requests).toHaveLength(2)
  })

  test('事例を表示した状態で axe の違反がない', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await mockCaseStudies(page, { cases: testCases(2) })
    await gotoHydrated(page, '/casestudy/')
    await expect(page.getByRole('article')).toHaveCount(2)
    const { violations } = await scanA11y(page)
    expect(formatViolations(violations)).toEqual([])
  })
})

test.describe('トップの CASE STUDY', () => {
  test('画面に近づいてから、公開中の新しい 4 件を読み込んで表示する', async ({ page }) => {
    const requests = await mockCaseStudies(page, { cases: testCases(5) })
    await gotoHydrated(page, '/')
    // ファーストビューでは読み込まない
    expect(requests).toHaveLength(0)

    const section = page.locator('#case-study')
    await section.scrollIntoViewIfNeeded()
    const links = section.getByRole('link', { name: /株式会社テスト/ })
    await expect(links).toHaveCount(4)
    await expect(links.nth(0)).toContainText('2026.09.01')
    await expect(links.nth(0)).toContainText('株式会社テスト1')
    await expect(links.nth(0)).toHaveAttribute('href', '/casestudy/')
    expect(requests).toHaveLength(1)
    expect(
      (requests[0]?.postDataJSON() as { structuredQuery: { limit?: number } }).structuredQuery
        .limit,
    ).toBe(4)
  })

  test('0 件なら準備中の案内を出す', async ({ page }) => {
    await mockCaseStudies(page, { cases: [] })
    await gotoHydrated(page, '/')
    const section = page.locator('#case-study')
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByText(EMPTY_MESSAGE)).toBeVisible()
  })

  test('失敗したら案内を出し、「再読み込み」で読み込み直せる', async ({ page }) => {
    await mockCaseStudies(page, { status: 500 }, { cases: testCases(2) })
    await gotoHydrated(page, '/')
    const section = page.locator('#case-study')
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByText(ERROR_MESSAGE)).toBeVisible()
    await section.getByRole('button', { name: '再読み込み' }).click()
    await expect(section.getByRole('link', { name: /株式会社テスト/ })).toHaveCount(2)
  })
})
