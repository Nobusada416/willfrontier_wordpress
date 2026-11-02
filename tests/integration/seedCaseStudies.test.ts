import {
  CASE_STUDIES_COLLECTION,
  CASE_STUDY_DOCUMENT_KEYS,
  caseStudyContentSchema,
  caseStudyPhotoFilePath,
} from '@wf/shared'
import { deleteApp, initializeApp, type App } from 'firebase-admin/app'
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  LEGACY_CASE_STUDIES,
  PLACEHOLDER_COMPANY,
  resolveSeedTarget,
  seedCaseStudies,
  todayInTokyo,
} from '../../tools/seed-case-studies'

// 既存の施工事例の移行スクリプト（tools/seed-case-studies.ts）を Firestore・Storage の Emulator で確かめる。
// 3 件が下書きで入り、写真が Storage にあり、再実行しても重複・上書きしない（--force でだけ上書きする）こと

const PROJECT_ID = 'demo-willfrontier'
const BUCKET = `${PROJECT_ID}.firebasestorage.app`
const ROOT = resolve(__dirname, '../..')
const TODAY = '2026-11-02'

const emulatorHost = (name: string) => {
  const host = process.env[name]
  if (!host) throw new Error(`Emulator 上で実行してください（npm run test:integration）: ${name}`)
  return host
}

let app: App
let db: Firestore
const bucket = () => getStorage(app).bucket(BUCKET)

const seed = (force = false) =>
  seedCaseStudies({ db, bucket: bucket(), root: ROOT, today: TODAY, force })

const manifest = JSON.parse(
  readFileSync(resolve(ROOT, 'web/app/lib/mediaManifest.json'), 'utf8'),
) as { photos: Record<string, { large: { width: number; height: number } }> }

const allDocs = async () => {
  const snapshot = await db.collection(CASE_STUDIES_COLLECTION).get()
  return snapshot.docs
}

beforeAll(() => {
  emulatorHost('FIRESTORE_EMULATOR_HOST')
  emulatorHost('FIREBASE_STORAGE_EMULATOR_HOST')
  app = initializeApp({ projectId: PROJECT_ID }, 'seed-case-studies-test')
  db = getFirestore(app)
})

afterAll(async () => {
  await deleteApp(app)
})

beforeEach(async () => {
  const response = await fetch(
    `http://${emulatorHost('FIRESTORE_EMULATOR_HOST')}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  )
  expect(response.ok).toBe(true)
  await bucket().deleteFiles({ prefix: 'case-studies/' })
})

describe('seedCaseStudies', () => {
  it('旧サイトの 3 件を、仮の日付・社名の下書きとして写真付きで入れる', async () => {
    const result = await seed()
    expect(result.written).toEqual(LEGACY_CASE_STUDIES.map((item) => item.id))

    const docs = await allDocs()
    expect(docs).toHaveLength(3)

    for (const legacy of LEGACY_CASE_STUDIES) {
      const data = (await db.collection(CASE_STUDIES_COLLECTION).doc(legacy.id).get()).data()
      if (!data) throw new Error(`${legacy.id} がありません`)
      // 管理画面・公開サイトと同じスキーマ・項目
      expect(caseStudyContentSchema.safeParse(data).success).toBe(true)
      expect(Object.keys(data).sort()).toEqual([...CASE_STUDY_DOCUMENT_KEYS].sort())
      expect(data).toMatchObject({
        status: 'draft',
        date: TODAY,
        company: PLACEHOLDER_COMPANY,
        tag: legacy.tag,
        title: legacy.title,
        category: legacy.meta,
        description: legacy.description,
      })
      expect(data.createdAt).toBeInstanceOf(Timestamp)
      expect(data.updatedAt).toBeInstanceOf(Timestamp)

      const photos = data.photos as { path: string; largeUrl: string; smallUrl: string }[]
      expect(photos).toHaveLength(4)
      for (const [index, photo] of photos.entries()) {
        const slug = legacy.photos[index] ?? ''
        expect(photo).toMatchObject({
          path: `case-studies/${legacy.id}/${slug}.webp`,
          width: manifest.photos[slug]?.large.width,
          height: manifest.photos[slug]?.large.height,
          alt: '',
        })
        // 写真が Storage にあり、ダウンロード URL で読める（中身は旧サイトの webp と同じ）
        for (const size of ['small', 'large'] as const) {
          const [exists] = await bucket().file(caseStudyPhotoFilePath(photo.path, size)).exists()
          expect(exists).toBe(true)
          const response = await fetch(size === 'small' ? photo.smallUrl : photo.largeUrl)
          expect(response.status).toBe(200)
          expect(response.headers.get('content-type')).toBe('image/webp')
          const local = readFileSync(resolve(ROOT, `web/public/media/photos/${size}/${slug}.webp`))
          expect((await response.arrayBuffer()).byteLength).toBe(local.byteLength)
        }
      }
    }
  })

  it('もう一度実行すると、既にあるため上書きせずに止まる（重複もしない）', async () => {
    await seed()
    // 管理画面で直した内容
    await db
      .collection(CASE_STUDIES_COLLECTION)
      .doc(LEGACY_CASE_STUDIES[0]?.id ?? '')
      .update({ company: '株式会社直した' })

    await expect(seed()).rejects.toThrow(/--force/)

    const docs = await allDocs()
    expect(docs).toHaveLength(3)
    expect(docs.find((doc) => doc.id === LEGACY_CASE_STUDIES[0]?.id)?.data().company).toBe(
      '株式会社直した',
    )
  })

  it('--force では上書きし、件数は 3 件のまま', async () => {
    await seed()
    const id = LEGACY_CASE_STUDIES[0]?.id ?? ''
    await db.collection(CASE_STUDIES_COLLECTION).doc(id).update({ company: '株式会社直した' })
    // 管理画面で追加した写真（上書きでは消して入れ直す）
    await bucket().file(`case-studies/${id}/extra-large.webp`).save(Buffer.from('x'))

    const result = await seed(true)
    expect(result.written).toHaveLength(3)

    const docs = await allDocs()
    expect(docs).toHaveLength(3)
    expect(docs.find((doc) => doc.id === id)?.data().company).toBe(PLACEHOLDER_COMPANY)
    const [extra] = await bucket().file(`case-studies/${id}/extra-large.webp`).exists()
    expect(extra).toBe(false)
  })
})

describe('todayInTokyo', () => {
  it('日本時間の日付を YYYY-MM-DD で返す', () => {
    // UTC では 11/1 の 15:30 だが、日本時間では 11/2
    expect(todayInTokyo(new Date('2026-11-01T15:30:00Z'))).toBe('2026-11-02')
    expect(todayInTokyo(new Date('2026-11-01T14:59:00Z'))).toBe('2026-11-01')
  })
})

describe('resolveSeedTarget（接続先）', () => {
  const base = {
    env: {},
    firebaserc: JSON.stringify({ projects: { default: 'demo-willfrontier' } }),
    ports: { firestore: 8080, storage: 9199 },
  }

  it('--emulator では firebase.json のポートの Emulator につなぐ', () => {
    expect(resolveSeedTarget({ ...base, emulator: true })).toEqual({
      projectId: 'demo-willfrontier',
      bucket: 'demo-willfrontier.firebasestorage.app',
      emulatorHosts: { firestore: '127.0.0.1:8080', storage: '127.0.0.1:9199' },
    })
  })

  it('demo- のプロジェクトは Emulator なしでは止める', () => {
    expect(() => resolveSeedTarget(base)).toThrow(/Emulator 専用/)
  })

  it('本番は --project で指定し、バケットは --bucket で変えられる', () => {
    expect(resolveSeedTarget({ ...base, project: 'willfrontier-prod' })).toEqual({
      projectId: 'willfrontier-prod',
      bucket: 'willfrontier-prod.firebasestorage.app',
      emulatorHosts: undefined,
    })
    expect(
      resolveSeedTarget({ ...base, project: 'willfrontier-prod', bucket: 'old.appspot.com' })
        .bucket,
    ).toBe('old.appspot.com')
  })

  it('Firestore と Storage の片方だけが Emulator なら止める', () => {
    expect(() =>
      resolveSeedTarget({
        ...base,
        project: 'willfrontier-prod',
        env: { FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' },
      }),
    ).toThrow(/片方/)
  })

  it('環境変数（emulators:exec が設定する）の Emulator につなぐ', () => {
    expect(
      resolveSeedTarget({
        ...base,
        env: {
          FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
          FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9199',
        },
      }).emulatorHosts,
    ).toEqual({ firestore: '127.0.0.1:8080', storage: '127.0.0.1:9199' })
  })
})
