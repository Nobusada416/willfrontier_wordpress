import { CASE_STUDIES_COLLECTION, type CaseStudyContent } from '@wf/shared'
import { deleteApp, initializeApp, type App } from 'firebase-admin/app'
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  buildPublishedCaseStudiesQuery,
  caseStudiesQueryUrl,
  fetchPublishedCaseStudies,
} from '../../web/app/lib/caseStudies'

// 公開サイトの施工事例の読み込み（web/app/lib/caseStudies.ts。Firestore の REST の runQuery）を Firestore Emulator で確かめる。
// 未ログインのリクエストには firestore.rules が効くため、公開中だけを読むクエリが許可され、公開中の事例だけが返ることを見る

const PROJECT_ID = 'demo-willfrontier'
// lib/caseStudies.ts は Emulator の接続先を 127.0.0.1:8080（firebase.json）に固定している
const EMULATOR_HOST = '127.0.0.1:8080'
const ENV = { VITE_USE_FIREBASE_EMULATORS: 'true' }

let app: App
let db: Firestore

const content = (
  id: string,
  overrides: Partial<CaseStudyContent> = {},
): CaseStudyContent & { id: string } => ({
  id,
  status: 'published',
  date: '2026-04-01',
  tag: '運用開始',
  company: `株式会社${id}`,
  title: `事例 ${id}`,
  category: '産業廃棄物',
  description: '1 行目\n2 行目',
  photos: [
    {
      path: `case-studies/${id}/photo-1`,
      smallUrl: `http://127.0.0.1:9199/${id}-small.webp`,
      largeUrl: `http://127.0.0.1:9199/${id}-large.webp`,
      width: 1600,
      height: 1200,
      alt: '',
    },
  ],
  ...overrides,
})

// Admin SDK で書き込む（ルールを通らない。管理画面の保存と同じ項目を入れる）
const save = async ({ id, ...data }: CaseStudyContent & { id: string }) => {
  await db
    .collection(CASE_STUDIES_COLLECTION)
    .doc(id)
    .set({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: 'admin-uid',
    })
}

const clear = async () => {
  const snapshot = await db.collection(CASE_STUDIES_COLLECTION).get()
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()))
}

beforeAll(() => {
  if (process.env.FIRESTORE_EMULATOR_HOST !== EMULATOR_HOST) {
    throw new Error(
      `Firestore Emulator（${EMULATOR_HOST}）上で実行してください（npm run test:integration）`,
    )
  }
  // Admin SDK は FIRESTORE_EMULATOR_HOST（emulators:exec が設定する）の Emulator につなぐ
  app = initializeApp({ projectId: PROJECT_ID }, 'case-studies-test')
  db = getFirestore(app)
})

beforeEach(clear)

afterAll(async () => {
  await clear()
  await deleteApp(app)
})

describe('公開サイトの施工事例の読み込み（REST）', () => {
  it('未ログインでも、公開中の事例だけを日付の新しい順に読める（下書きは返らない）', async () => {
    await save(content('old', { date: '2025-12-01' }))
    await save(content('new', { date: '2026-10-01' }))
    await save(content('draft', { status: 'draft', date: '2026-11-01' }))

    const studies = await fetchPublishedCaseStudies({ env: ENV })

    expect(studies.map((study) => study.id)).toEqual(['new', 'old'])
    expect(studies[0]).toMatchObject({
      status: 'published',
      company: '株式会社new',
      description: '1 行目\n2 行目',
      photos: [{ width: 1600, height: 1200, alt: '' }],
    })
  })

  it('件数を指定できる（トップは新しい 4 件）', async () => {
    await Promise.all(
      [1, 2, 3, 4, 5].map((day) => save(content(`case-${day}`, { date: `2026-10-0${day}` }))),
    )
    const studies = await fetchPublishedCaseStudies({ env: ENV, limit: 4 })
    expect(studies.map((study) => study.id)).toEqual(['case-5', 'case-4', 'case-3', 'case-2'])
  })

  it('未ログインの REST にはルールが効く（公開中に絞らないクエリは拒否される）', async () => {
    await save(content('draft', { status: 'draft' }))
    const url = caseStudiesQueryUrl(ENV)
    if (!url) throw new Error('Emulator の URL がありません')
    const { structuredQuery } = buildPublishedCaseStudiesQuery()
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: { from: structuredQuery.from, orderBy: structuredQuery.orderBy },
      }),
    })
    expect(response.status).toBe(403)
  })

  it('公開中が 0 件なら空の一覧', async () => {
    await save(content('draft', { status: 'draft' }))
    await expect(fetchPublishedCaseStudies({ env: ENV })).resolves.toEqual([])
  })
})
