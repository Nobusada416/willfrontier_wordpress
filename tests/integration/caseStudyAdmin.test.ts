import { isStorageId, type CaseStudyFormValues } from '@wf/shared'
import { deleteApp as deleteClientApp, initializeApp as initializeClientApp } from 'firebase/app'
import { connectAuthEmulator, getAuth as getClientAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, terminate } from 'firebase/firestore'
import { connectStorageEmulator, getStorage } from 'firebase/storage'
import { deleteApp, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { grantAdmin } from '../../tools/grant-admin'
import type { ProcessedPhoto } from '../../web/app/features/admin/api'
import { createFirebaseAdminApi } from '../../web/app/features/admin/firebaseAdminApi'

// 管理画面の Firebase の操作（web/app/features/admin/firebaseAdminApi.ts）を、
// Auth・Firestore・Storage の Emulator と本物のセキュリティルールで確かめる。
// 管理者でログイン → 写真付きで作成 → 公開 → 未ログインで公開分だけ読める → 削除で写真も消える

const PROJECT_ID = 'demo-willfrontier'
const BUCKET = `${PROJECT_ID}.firebasestorage.app`
const ADMIN_EMAIL = 'soumu@example.com'
const STAFF_EMAIL = 'staff@example.com'
const STAFF_PASSWORD = 'staff-password'

const emulatorHost = (name: string) => {
  const host = process.env[name]
  if (!host) throw new Error(`Emulator 上で実行してください（npm run test:integration）: ${name}`)
  return host
}
const firestoreHost = () => emulatorHost('FIRESTORE_EMULATOR_HOST')
const authHost = () => emulatorHost('FIREBASE_AUTH_EMULATOR_HOST')
const storageHost = () => emulatorHost('FIREBASE_STORAGE_EMULATOR_HOST')

const splitHost = (host: string) => {
  const [hostname = '127.0.0.1', port = '0'] = host.split(':')
  return { hostname, port: Number(port) }
}

const clientApp = initializeClientApp(
  { projectId: PROJECT_ID, apiKey: 'demo-api-key', storageBucket: BUCKET },
  'case-study-admin',
)
const clientAuth = getClientAuth(clientApp)
const db = getFirestore(clientApp)
const storage = getStorage(clientApp)
const api = createFirebaseAdminApi({ auth: clientAuth, db, storage })

let adminApp: App
let adminAuth: Auth
let adminPassword = ''

beforeAll(async () => {
  connectAuthEmulator(clientAuth, `http://${authHost()}`, { disableWarnings: true })
  const firestore = splitHost(firestoreHost())
  connectFirestoreEmulator(db, firestore.hostname, firestore.port)
  const storageEmulator = splitHost(storageHost())
  connectStorageEmulator(storage, storageEmulator.hostname, storageEmulator.port)

  adminApp = initializeApp({ projectId: PROJECT_ID }, 'case-study-admin-test')
  adminAuth = getAuth(adminApp)
  await fetch(`http://${authHost()}/emulator/v1/projects/${PROJECT_ID}/accounts`, {
    method: 'DELETE',
  })
  // 管理者は tools/grant-admin.ts（npm run admin:grant）と同じ方法で作る
  adminPassword = (await grantAdmin(adminAuth, { email: ADMIN_EMAIL })).password ?? ''
  await adminAuth.createUser({ email: STAFF_EMAIL, password: STAFF_PASSWORD })
})

afterAll(async () => {
  await api.signOut()
  await terminate(db)
  await deleteClientApp(clientApp)
  await deleteApp(adminApp)
})

beforeEach(async () => {
  await api.signOut()
  const response = await fetch(
    `http://${firestoreHost()}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  )
  expect(response.ok).toBe(true)
})

// ブラウザで縮小・変換した写真の代わり（中身は検証しない。形式と大きさだけルールで確かめられる）
const fakePhoto = (contentType: ProcessedPhoto['contentType'] = 'image/webp'): ProcessedPhoto => ({
  width: 1600,
  height: 1067,
  contentType,
  files: {
    small: new Blob([new Uint8Array(64)], { type: contentType }),
    large: new Blob([new Uint8Array(128)], { type: contentType }),
  },
})

const values = (photos: CaseStudyFormValues['photos']): CaseStudyFormValues => ({
  date: '2026-10-20',
  tag: '解体工事',
  company: '株式会社テスト建設',
  title: '解体工事の産廃一括処理',
  category: '産業廃棄物 / がれき類',
  description: '1 行目\n2 行目',
  photos,
})

// 公開サイトと同じく、未ログインで Firestore の REST API から 1 件を読む
const readWithoutLogin = (id: string) =>
  fetch(
    `http://${firestoreHost()}/v1/projects/${PROJECT_ID}/databases/(default)/documents/caseStudies/${id}`,
  )

// 未ログインで公開の事例を一覧する（公開サイトのクエリと同じ条件）
const listPublishedWithoutLogin = async () => {
  const response = await fetch(
    `http://${firestoreHost()}/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'caseStudies' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'status' },
              op: 'EQUAL',
              value: { stringValue: 'published' },
            },
          },
          orderBy: [{ field: { fieldPath: 'date' }, direction: 'DESCENDING' }],
        },
      }),
    },
  )
  expect(response.status).toBe(200)
  const rows = (await response.json()) as { document?: { name: string } }[]
  return rows.flatMap((row) => (row.document ? [row.document.name.split('/').at(-1)] : []))
}

describe('ログイン', () => {
  it('管理者はログインできる', async () => {
    expect(await api.signIn(ADMIN_EMAIL, adminPassword)).toEqual({ ok: true })
    expect(clientAuth.currentUser?.email).toBe(ADMIN_EMAIL)
  })

  it('パスワードが違えば invalid-credentials', async () => {
    expect(await api.signIn(ADMIN_EMAIL, 'wrong-password')).toEqual({
      ok: false,
      error: 'invalid-credentials',
    })
  })

  it('管理者でないアカウントは forbidden で、ログアウトさせる', async () => {
    expect(await api.signIn(STAFF_EMAIL, STAFF_PASSWORD)).toEqual({ ok: false, error: 'forbidden' })
    expect(clientAuth.currentUser).toBeNull()
  })

  it('ログイン状態の監視は、管理者なら admin を通知する', async () => {
    const events: string[] = []
    const stop = api.onAuthChange((event) => events.push(event.type))
    await api.signIn(ADMIN_EMAIL, adminPassword)
    await expect.poll(() => events.at(-1)).toBe('admin')
    stop()
  })
})

describe('施工事例の作成・公開・削除', () => {
  it('写真付きで作成 → 公開 → 未ログインで公開分だけ読める → 削除で写真も消える', async () => {
    await api.signIn(ADMIN_EMAIL, adminPassword)

    // 写真をアップロードする前に事例の ID を決める
    const id = api.newCaseStudyId()
    expect(isStorageId(id)).toBe(true)
    const photo = await api.uploadPhoto(id, fakePhoto())
    expect(photo).toMatchObject({ width: 1600, height: 1067, alt: '' })
    expect(photo.path).toMatch(new RegExp(`^case-studies/${id}/[A-Za-z0-9_-]+\\.webp$`))
    expect((await fetch(photo.smallUrl)).status).toBe(200)
    expect((await fetch(photo.largeUrl)).status).toBe(200)

    // 下書きとして保存: 管理画面からは読めるが、未ログインでは読めない
    await api.saveCaseStudy({
      id,
      isNew: true,
      status: 'draft',
      values: values([{ ...photo, alt: '現場の写真' }]),
    })
    const draft = await api.getCaseStudy(id)
    expect(draft).toMatchObject({ id, status: 'draft', title: '解体工事の産廃一括処理' })
    expect(draft?.photos[0]?.alt).toBe('現場の写真')
    expect(draft?.updatedAt).toBeInstanceOf(Date)
    expect((await readWithoutLogin(id)).status).toBe(403)
    expect(await listPublishedWithoutLogin()).not.toContain(id)

    // 一覧の「公開する」: 未ログインでも読めるようになる
    await api.setStatus(id, 'published')
    expect((await api.listCaseStudies()).map((item) => [item.id, item.status])).toEqual([
      [id, 'published'],
    ])
    const published = await readWithoutLogin(id)
    expect(published.status).toBe(200)
    const body = (await published.json()) as { fields: Record<string, { stringValue?: string }> }
    expect(body.fields.title?.stringValue).toBe('解体工事の産廃一括処理')
    expect(await listPublishedWithoutLogin()).toEqual([id])

    // 写真を差し替えて更新: 外した写真のファイルを消す
    const second = await api.uploadPhoto(id, fakePhoto())
    await api.saveCaseStudy({
      id,
      isNew: false,
      status: 'published',
      values: { ...values([{ ...second, alt: '' }]), title: '題名を直した' },
    })
    await api.deletePhotos([photo.path])
    expect((await api.getCaseStudy(id))?.title).toBe('題名を直した')
    expect((await fetch(photo.largeUrl)).status).toBe(404)
    expect((await fetch(second.largeUrl)).status).toBe(200)
    // 既に無い写真を消しても失敗しない
    await expect(api.deletePhotos([photo.path])).resolves.toBeUndefined()

    // 削除: ドキュメントと写真のファイルがすべて消える
    const current = await api.getCaseStudy(id)
    if (!current) throw new Error('事例がありません')
    await api.deleteCaseStudy(current)
    expect(await api.getCaseStudy(id)).toBeNull()
    expect(await listPublishedWithoutLogin()).toEqual([])
    expect((await fetch(second.smallUrl)).status).toBe(404)
    expect((await fetch(second.largeUrl)).status).toBe(404)
  })

  it('webp を書き出せないブラウザ（Safari）の JPEG の写真も保存・削除できる', async () => {
    await api.signIn(ADMIN_EMAIL, adminPassword)
    const id = api.newCaseStudyId()
    const photo = await api.uploadPhoto(id, fakePhoto('image/jpeg'))
    // 基準パスの拡張子で形式が分かる
    expect(photo.path).toMatch(new RegExp(`^case-studies/${id}/[A-Za-z0-9_-]+\\.jpg$`))
    const large = await fetch(photo.largeUrl)
    expect(large.status).toBe(200)
    expect(large.headers.get('content-type')).toBe('image/jpeg')
    expect((await fetch(photo.smallUrl)).status).toBe(200)

    await api.saveCaseStudy({ id, isNew: true, status: 'draft', values: values([photo]) })
    expect((await api.getCaseStudy(id))?.photos[0]?.path).toBe(photo.path)

    // 写真を外したとき（deletePhotos）も、.jpg のファイルを消せる
    await api.deletePhotos([photo.path])
    expect((await fetch(photo.smallUrl)).status).toBe(404)
    expect((await fetch(photo.largeUrl)).status).toBe(404)
    await api.deleteCaseStudy({ id, photos: [] })
  })

  it('下書きの状態を 2 回切り替えても作成日時は変わらない（ルールの createdAt 不変）', async () => {
    await api.signIn(ADMIN_EMAIL, adminPassword)
    const id = api.newCaseStudyId()
    const photo = await api.uploadPhoto(id, fakePhoto())
    await api.saveCaseStudy({ id, isNew: true, status: 'draft', values: values([photo]) })
    await api.setStatus(id, 'published')
    await api.setStatus(id, 'draft')
    expect((await api.getCaseStudy(id))?.status).toBe('draft')
    const current = await api.getCaseStudy(id)
    if (current) await api.deleteCaseStudy(current)
  })

  it('ログインしていなければ保存できない', async () => {
    const id = api.newCaseStudyId()
    await expect(
      api.saveCaseStudy({
        id,
        isNew: true,
        status: 'draft',
        values: values([
          {
            path: `case-studies/${id}/photo1.webp`,
            smallUrl: 'https://example.com/s.webp',
            largeUrl: 'https://example.com/l.webp',
            width: 10,
            height: 10,
            alt: '',
          },
        ]),
      }),
    ).rejects.toThrow()
  })
})
