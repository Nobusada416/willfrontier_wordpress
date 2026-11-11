import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { formatViolations, scanA11y } from '../support/axe'
import { ADMIN, firestoreUrl, resetEmulators, screenshot, signIn, STAFF } from './support'

// 施工事例の管理画面を Emulator（Auth・Firestore・Storage）につないで操作する。
// ログイン → 新規作成（写真付き）→ 公開 → 未ログインで読める → 非公開 → 編集 → 削除、
// 権限のないアカウント、未保存で離れるときの確認、各画面の axe（WCAG 2.1 AA）を確かめる

const PHOTO = join(import.meta.dirname, '../../public/og-image.jpg')

test.beforeEach(async () => {
  await resetEmulators()
})

const expectNoA11yViolations = async (page: Page) => {
  const { violations } = await scanA11y(page)
  expect(formatViolations(violations)).toEqual([])
}

test('権限のないアカウントは「権限がありません」と出し、ログアウトさせる', async ({ page }) => {
  await page.goto('/admin/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'ウィルフロンティアホームページ管理画面',
  )
  await screenshot(page, '1-login')
  await expectNoA11yViolations(page)

  // パスワードの誤り
  await signIn(page, { email: ADMIN.email, password: 'wrong-password' })
  await expect(page.getByText('メールアドレスかパスワードが違います。')).toBeVisible()
  await screenshot(page, '1-login-error')

  await signIn(page, STAFF)
  await expect(page.getByRole('alert')).toContainText('権限がありません')
  await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
  await page.reload()
  // ログアウトしているため、再読み込みしてもログイン画面のまま
  await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
})

test('ログイン → 写真付きで作成・公開 → 未ログインで読める → 非公開 → 編集 → 削除', async ({
  page,
  request,
}) => {
  await page.goto('/admin/')
  await signIn(page, ADMIN)
  await expect(page.getByRole('heading', { level: 1, name: '施工事例' })).toBeVisible()
  await expect(page.getByText('まだ施工事例がありません')).toBeVisible()
  await expect(page.getByRole('banner')).toContainText(ADMIN.email)

  // 新規作成
  await page.getByRole('link', { name: '新規作成' }).click()
  await expect(page.getByRole('heading', { level: 1, name: '施工事例の新規作成' })).toBeVisible()
  await expectNoA11yViolations(page)

  // 未入力で保存するとエラー
  await page.getByRole('button', { name: '公開して保存' }).click()
  await expect(page.getByText('社名を入力してください')).toBeVisible()
  await expect(page.getByText('写真を1枚以上追加してください')).toBeVisible()
  await screenshot(page, '3-edit-errors')
  await expectNoA11yViolations(page)

  await page.getByLabel(/^日付/).fill('2026-10-20')
  await page.getByLabel(/^分類/).fill('解体工事')
  await page.getByLabel(/^社名/).fill('株式会社〇〇建設')
  await page.getByLabel(/^タイトル/).fill('解体工事の産廃一括処理')
  await page.getByLabel(/^工事の種類・内容/).fill('産業廃棄物 / がれき類 / 木くず')
  await page.getByLabel(/^本文/).fill('解体で出た廃材を現場で分別し、\n一括で回収・処理しました。')
  await expect(page.getByText('29 / 400 文字')).toBeVisible()

  // 写真: ブラウザで縮小・webp に変換して Storage にアップロードする
  await page.getByLabel('写真を追加').setInputFiles(PHOTO)
  const alt = page.getByLabel('写真の説明（1 枚目）')
  await expect(alt).toBeVisible({ timeout: 30_000 })
  await alt.fill('荷台を傾けた収集運搬車両')
  const image = page.locator('img[src*="-small.webp"]').first()
  await expect(image).toBeVisible()
  await expect
    .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
    .toBe(768)
  await screenshot(page, '3-edit')
  await expectNoA11yViolations(page)

  await page.getByRole('button', { name: '公開して保存' }).click()

  // 一覧に戻り、通知と公開中の行が出る
  await expect(page.getByRole('status')).toHaveText(
    '「解体工事の産廃一括処理」を公開しました。サイトにすぐ反映されます。',
  )
  const row = page.locator('tbody tr').filter({ hasText: '解体工事の産廃一括処理' })
  await expect(row).toContainText('公開中')
  await expect(row).toContainText('2026.10.20')
  await expect(page.getByText('公開中 1 件・下書き 0 件。')).toBeVisible()
  await screenshot(page, '2-list')
  await expectNoA11yViolations(page)

  // 公開した事例は、未ログインでも Firestore から読める（公開サイトと同じ REST の一覧）
  const listPublished = async () => {
    const response = await request.post(firestoreUrl(':runQuery'), {
      data: {
        structuredQuery: {
          from: [{ collectionId: 'caseStudies' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'status' },
              op: 'EQUAL',
              value: { stringValue: 'published' },
            },
          },
        },
      },
    })
    expect(response.ok()).toBe(true)
    const rows = (await response.json()) as {
      document?: { fields: { title: { stringValue: string } } }
    }[]
    return rows.flatMap((item) => (item.document ? [item.document.fields.title.stringValue] : []))
  }
  expect(await listPublished()).toEqual(['解体工事の産廃一括処理'])

  // 非公開にする: 未ログインでは読めなくなる
  await row.getByRole('button', { name: /「解体工事の産廃一括処理」を\s*非公開にする/ }).click()
  await expect(page.getByRole('status')).toHaveText(
    '「解体工事の産廃一括処理」を非公開にしました。サイトには表示されなくなります。',
  )
  await expect(row).toContainText('下書き')
  expect(await listPublished()).toEqual([])

  // 編集: タイトルを直して下書き保存
  await row.getByRole('link', { name: '解体工事の産廃一括処理' }).click()
  await expect(page).toHaveURL(/\/admin\/case-studies\/edit\/\?id=[A-Za-z0-9]+$/)
  await expect(page.getByRole('heading', { level: 1, name: '施工事例の編集' })).toBeVisible()
  await expect(page.getByLabel(/^タイトル/)).toHaveValue('解体工事の産廃一括処理')
  await expect(page.getByLabel('写真の説明（1 枚目）')).toHaveValue('荷台を傾けた収集運搬車両')
  await page.getByLabel(/^タイトル/).fill('解体工事の産廃処理')
  await page.getByRole('button', { name: '下書き保存' }).click()
  await expect(page.getByRole('status')).toHaveText(
    '「解体工事の産廃処理」を下書きとして保存しました。サイトには表示されません。',
  )

  // 削除: 確認ダイアログ → 写真のファイルも消える
  const photoUrl = await page
    .locator('tbody tr')
    .filter({ hasText: '解体工事の産廃処理' })
    .locator('img')
    .getAttribute('src')
  expect(photoUrl).toBeTruthy()
  expect((await request.get(photoUrl ?? '')).status()).toBe(200)
  await page.getByRole('link', { name: '解体工事の産廃処理' }).click()
  await page.getByRole('button', { name: '削除', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'この施工事例を削除しますか？' })
  await expect(dialog).toContainText(
    '「解体工事の産廃処理」と写真 1 枚を削除します。元に戻せません。',
  )
  await screenshot(page, '3-edit-delete-dialog')
  await expectNoA11yViolations(page)
  await dialog.getByRole('button', { name: '削除する' }).click()

  await expect(page.getByRole('status')).toHaveText('「解体工事の産廃処理」を削除しました。')
  await expect(page.getByText('まだ施工事例がありません')).toBeVisible()
  expect((await request.get(photoUrl ?? '')).status()).toBe(404)

  // ログアウト
  await page.getByRole('button', { name: 'ログアウト' }).click()
  await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
})

test('未保存のまま一覧に戻ろうとすると確認を出す', async ({ page }) => {
  await page.goto('/admin/case-studies/new/')
  await signIn(page, ADMIN)
  await expect(page.getByRole('heading', { level: 1, name: '施工事例の新規作成' })).toBeVisible()

  await page.getByLabel(/^タイトル/).fill('書きかけ')
  await page.getByRole('link', { name: '一覧に戻る' }).click()
  const dialog = page.getByRole('dialog', { name: '保存していない変更があります' })
  await expect(dialog).toBeVisible()
  await expectNoA11yViolations(page)

  await dialog.getByRole('button', { name: 'このページに残る' }).click()
  await expect(page.getByLabel(/^タイトル/)).toHaveValue('書きかけ')

  await page.getByRole('link', { name: '一覧に戻る' }).click()
  await page
    .getByRole('dialog', { name: '保存していない変更があります' })
    .getByRole('button', { name: '保存せずに離れる' })
    .click()
  await expect(page.getByRole('heading', { level: 1, name: '施工事例' })).toBeVisible()
})

test.describe('スマホの幅', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('一覧の表は横にスクロールでき、ページ全体ははみ出さない', async ({ page }) => {
    await page.goto('/admin/')
    await signIn(page, ADMIN)
    await page.getByRole('link', { name: '新規作成' }).click()
    await page.getByLabel(/^分類/).fill('定期回収')
    await page.getByLabel(/^社名/).fill('△△工務店')
    await page.getByLabel(/^タイトル/).fill('新築現場の分別回収')
    await page.getByLabel(/^工事の種類・内容/).fill('産業廃棄物 / 木くず')
    await page.getByLabel(/^本文/).fill('新築現場で分別回収しました。')
    await page.getByLabel('写真を追加').setInputFiles(PHOTO)
    await expect(page.getByLabel('写真の説明（1 枚目）')).toBeVisible({ timeout: 30_000 })
    await screenshot(page, '3-edit-mobile')
    await page.getByRole('button', { name: '下書き保存' }).click()
    await expect(page.getByRole('status')).toContainText('下書きとして保存しました')

    const region = page.getByRole('region', { name: '施工事例の一覧' })
    await expect(region).toBeVisible()
    const overflow = await region.evaluate((element) => element.scrollWidth > element.clientWidth)
    expect(overflow).toBe(true)
    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(pageOverflow).toBe(false)
    await screenshot(page, '2-list-mobile')
    await expectNoA11yViolations(page)
  })
})
