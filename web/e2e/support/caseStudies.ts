import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Page, Request } from '@playwright/test'

// 施工事例の読み込み（Firestore の REST の runQuery）の応答を差し替える。
// E2E のビルドには Firebase の設定が無く、そのままでは通信せずに「失敗」の案内を出す。
// 応答を差し替えるテストでは、設定の無いビルドだけが読む接続先のプロジェクト ID を置いてから開く（lib/caseStudies.ts）

export const E2E_PROJECT_ID = 'demo-e2e'
const RUN_QUERY = `https://firestore.googleapis.com/v1/projects/${E2E_PROJECT_ID}/databases/(default)/documents:runQuery`
const STORAGE = 'https://firebasestorage.googleapis.com'

// 写真の応答に使う実在の webp（寸法は mediaManifest.json の large）
const PHOTO_FILE = join(import.meta.dirname, '../../public/media/photos/large/wf-106.webp')

export type TestCase = { id: string; date: string; company: string; tag: string; title: string }

export const testCases = (count: number): TestCase[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `case-${index + 1}`,
    date: `2026-0${9 - index}-01`,
    company: `株式会社テスト${index + 1}`,
    tag: '運用開始',
    title: `テストの事例 ${index + 1}`,
  }))

const photo = (caseId: string, index: number) => ({
  mapValue: {
    fields: {
      path: { stringValue: `case-studies/${caseId}/photo-${index}` },
      smallUrl: { stringValue: `${STORAGE}/${caseId}-${index}-small.webp` },
      largeUrl: { stringValue: `${STORAGE}/${caseId}-${index}-large.webp` },
      width: { integerValue: '1600' },
      height: { integerValue: '1067' },
      alt: { stringValue: index === 0 ? `${caseId} の現場` : '' },
    },
  },
})

const runQueryDocument = (item: TestCase) => ({
  document: {
    name: `projects/${E2E_PROJECT_ID}/databases/(default)/documents/caseStudies/${item.id}`,
    fields: {
      status: { stringValue: 'published' },
      date: { stringValue: item.date },
      tag: { stringValue: item.tag },
      company: { stringValue: item.company },
      title: { stringValue: item.title },
      category: { stringValue: '産業廃棄物 / 金属類' },
      description: { stringValue: `${item.title} の本文の 1 行目\n2 行目` },
      photos: { arrayValue: { values: [0, 1, 2, 3].map((index) => photo(item.id, index)) } },
    },
    createTime: '2026-10-01T00:00:00Z',
    updateTime: '2026-10-01T00:00:00Z',
  },
  readTime: '2026-10-01T00:00:00Z',
})

type Reply = { cases: TestCase[] } | { status: number }

// 応答を順に返す（最後の応答は以後も繰り返す）。受け取ったリクエストを返す
export async function mockCaseStudies(page: Page, ...replies: Reply[]) {
  const requests: Request[] = []
  await page.addInitScript((projectId) => {
    Object.assign(globalThis, { __WF_E2E_FIRESTORE_PROJECT_ID__: projectId })
  }, E2E_PROJECT_ID)
  await page.route(RUN_QUERY, async (route) => {
    requests.push(route.request())
    const reply = replies[Math.min(requests.length, replies.length) - 1]
    if (!reply || 'status' in reply) {
      await route.fulfill({ status: reply?.status ?? 500, json: { error: { code: 500 } } })
      return
    }
    const limit = (route.request().postDataJSON() as { structuredQuery: { limit?: number } })
      .structuredQuery.limit
    const cases = reply.cases.slice(0, limit)
    await route.fulfill({
      json: cases.length > 0 ? cases.map(runQueryDocument) : [{ readTime: '2026-10-01T00:00:00Z' }],
    })
  })
  await page.route(`${STORAGE}/**`, (route) =>
    route.fulfill({ contentType: 'image/webp', body: readFileSync(PHOTO_FILE) }),
  )
  return requests
}

// Firestore への通信を数える（設定の無いビルドで通信しないことの確認用）
export async function recordFirestoreRequests(page: Page) {
  const requests: string[] = []
  await page.route('https://firestore.googleapis.com/**', async (route) => {
    requests.push(route.request().url())
    await route.abort('internetdisconnected')
  })
  return requests
}
