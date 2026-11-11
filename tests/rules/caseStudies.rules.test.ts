import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  CASE_STUDIES_COLLECTION,
  CASE_STUDY_DOCUMENT_KEYS,
  CASE_STUDY_MAX_LENGTH,
  CASE_STUDY_PHOTO_DIMENSION_MAX,
  CASE_STUDY_PHOTO_KEYS,
  caseStudyContentSchema,
  caseStudyPhotoBasePath,
  type CaseStudyContent,
  type CaseStudyPhoto,
} from '@wf/shared'
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

// 施工事例（caseStudies）のセキュリティルール。
// - 公開（status == 'published'）の事例は誰でも読める。一覧は where status == 'published' 付きのクエリだけ
// - カスタムクレーム admin == true のユーザーだけが下書きを含めて読み書きでき、書き込む内容は項目ごとに検証する
let env: RulesTestEnvironment

const ADMIN_UID = 'admin-1'
const PUBLISHED_ID = 'published1'
const DRAFT_ID = 'draft1'
const NEW_ID = 'new1'

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-willfrontier-rules',
    firestore: { rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8') },
  })
})

afterAll(async () => {
  await env.cleanup()
})

const photo = (caseId: string, n: number): CaseStudyPhoto => ({
  path: caseStudyPhotoBasePath(caseId, `photo${n}`, 'image/webp'),
  smallUrl: `https://firebasestorage.googleapis.com/v0/b/demo/o/photo${n}-small.webp?alt=media`,
  largeUrl: `https://firebasestorage.googleapis.com/v0/b/demo/o/photo${n}-large.webp?alt=media`,
  width: 1600,
  height: 1067,
  alt: `現場の写真 ${n}`,
})

const content = (caseId: string, status: CaseStudyContent['status']): CaseStudyContent => ({
  status,
  date: '2026-04-01',
  tag: '運用開始',
  company: '株式会社テスト',
  title: '工場リノベーション廃材処理',
  category: '産業廃棄物 / 金属類 / 機械設備',
  description: '稼働中の工場を一部解体し、\n設備更新に伴う大量の廃材を選別。',
  photos: [photo(caseId, 1), photo(caseId, 2)],
})

const createdAt = Timestamp.fromDate(new Date('2026-01-01T00:00:00Z'))

// 管理画面が新規作成で書き込む値
const newDocument = (
  caseId = NEW_ID,
  status: CaseStudyContent['status'] = 'draft',
): Record<string, unknown> => ({
  ...content(caseId, status),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  updatedBy: ADMIN_UID,
})

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (context) => {
    const db = firestoreOf(context)
    for (const [id, status] of [
      [PUBLISHED_ID, 'published'],
      [DRAFT_ID, 'draft'],
    ] as const) {
      await setDoc(doc(db, CASE_STUDIES_COLLECTION, id), {
        ...content(id, status),
        createdAt,
        updatedAt: createdAt,
        updatedBy: 'someone',
      })
    }
  })
})

// rules-unit-testing の firestore() の型は compat 版のため、modular 版の API に渡せる型にする
const firestoreOf = (context: RulesTestContext) => context.firestore() as unknown as Firestore

const caseDoc = (db: Firestore, id: string) => doc(db, CASE_STUDIES_COLLECTION, id)
const cases = (db: Firestore) => collection(db, CASE_STUDIES_COLLECTION)
const publishedQuery = (db: Firestore) =>
  query(cases(db), where('status', '==', 'published'), orderBy('date', 'desc'))

describe('テストのデータ', () => {
  it('shared のスキーマ（caseStudyContentSchema）を満たす', () => {
    expect(caseStudyContentSchema.safeParse(content(NEW_ID, 'draft')).success).toBe(true)
  })
})

const visitors = [
  { label: '未ログイン', db: () => firestoreOf(env.unauthenticatedContext()) },
  { label: '一般ユーザー', db: () => firestoreOf(env.authenticatedContext('user-1')) },
  {
    label: 'admin が false のユーザー',
    db: () => firestoreOf(env.authenticatedContext('user-2', { admin: false })),
  },
  {
    label: 'admin が文字列 "true" のユーザー',
    db: () => firestoreOf(env.authenticatedContext('user-3', { admin: 'true' })),
  },
]

describe.each(visitors)('$label', ({ db }) => {
  it('公開の事例を 1 件取得できる', async () => {
    await assertSucceeds(getDoc(caseDoc(db(), PUBLISHED_ID)))
  })

  it('下書きの事例は取得できない', async () => {
    await assertFails(getDoc(caseDoc(db(), DRAFT_ID)))
  })

  it('存在しない事例の取得は拒否される（下書きかどうかを推測させない）', async () => {
    await assertFails(getDoc(caseDoc(db(), 'missing')))
  })

  it('status == published の一覧を取得でき、公開の事例だけが返る', async () => {
    const snapshot = await assertSucceeds(getDocs(publishedQuery(db())))
    expect(snapshot.docs.map((d) => d.id)).toEqual([PUBLISHED_ID])
  })

  it('条件の無い一覧は取得できない（ルールは絞り込みをしないため）', async () => {
    await assertFails(getDocs(cases(db())))
  })

  it('status == draft の一覧は取得できない', async () => {
    await assertFails(getDocs(query(cases(db()), where('status', '==', 'draft'))))
  })

  it('新規作成できない', async () => {
    await assertFails(setDoc(caseDoc(db(), NEW_ID), newDocument()))
  })

  it.each([PUBLISHED_ID, DRAFT_ID])('%s を更新できない', async (id) => {
    await assertFails(
      updateDoc(caseDoc(db(), id), {
        title: '書き換え',
        updatedAt: serverTimestamp(),
        updatedBy: 'user-1',
      }),
    )
  })

  it.each([PUBLISHED_ID, DRAFT_ID])('%s を削除できない', async (id) => {
    await assertFails(deleteDoc(caseDoc(db(), id)))
  })
})

describe('admin（カスタムクレーム admin == true）', () => {
  const db = () => firestoreOf(env.authenticatedContext(ADMIN_UID, { admin: true }))

  it.each([PUBLISHED_ID, DRAFT_ID])('%s を取得できる', async (id) => {
    await assertSucceeds(getDoc(caseDoc(db(), id)))
  })

  it('下書きを含めて、条件の無い一覧を日付の新しい順に取得できる', async () => {
    const snapshot = await assertSucceeds(getDocs(query(cases(db()), orderBy('date', 'desc'))))
    expect(snapshot.size).toBe(2)
  })

  it('下書きを新規作成できる', async () => {
    await assertSucceeds(setDoc(caseDoc(db(), NEW_ID), newDocument()))
  })

  it('公開の状態で新規作成できる', async () => {
    await assertSucceeds(setDoc(caseDoc(db(), NEW_ID), newDocument(NEW_ID, 'published')))
  })

  it('JPEG の写真（path の拡張子が .jpg）を保存できる', async () => {
    await assertSucceeds(
      setDoc(caseDoc(db(), NEW_ID), {
        ...newDocument(),
        photos: [
          photo(NEW_ID, 1),
          { ...photo(NEW_ID, 2), path: caseStudyPhotoBasePath(NEW_ID, 'photo2', 'image/jpeg') },
        ],
      }),
    )
  })

  it('内容をまるごと保存し直せる（createdAt は元の値のまま）', async () => {
    await assertSucceeds(
      setDoc(caseDoc(db(), DRAFT_ID), {
        ...content(DRAFT_ID, 'published'),
        title: '新しいタイトル',
        photos: [photo(DRAFT_ID, 3)],
        createdAt,
        updatedAt: serverTimestamp(),
        updatedBy: ADMIN_UID,
      }),
    )
  })

  it('一覧の「公開する／非公開にする」のように status だけを切り替えられる', async () => {
    await assertSucceeds(
      updateDoc(caseDoc(db(), DRAFT_ID), {
        status: 'published',
        updatedAt: serverTimestamp(),
        updatedBy: ADMIN_UID,
      }),
    )
    await assertSucceeds(
      updateDoc(caseDoc(db(), PUBLISHED_ID), {
        status: 'draft',
        updatedAt: serverTimestamp(),
        updatedBy: ADMIN_UID,
      }),
    )
  })

  it.each([PUBLISHED_ID, DRAFT_ID])('%s を削除できる', async (id) => {
    await assertSucceeds(deleteDoc(caseDoc(db(), id)))
  })

  it('上限ちょうどの長さ・写真 4 枚・写真の説明が空でも保存できる', async () => {
    await assertSucceeds(
      setDoc(caseDoc(db(), NEW_ID), {
        ...newDocument(),
        tag: 'あ'.repeat(CASE_STUDY_MAX_LENGTH.tag),
        company: 'あ'.repeat(CASE_STUDY_MAX_LENGTH.company),
        title: 'あ'.repeat(CASE_STUDY_MAX_LENGTH.title),
        category: 'あ'.repeat(CASE_STUDY_MAX_LENGTH.category),
        description: 'あ'.repeat(CASE_STUDY_MAX_LENGTH.description),
        photos: [1, 2, 3, 4].map((n) => ({
          ...photo(NEW_ID, n),
          alt: n === 1 ? 'あ'.repeat(CASE_STUDY_MAX_LENGTH.alt) : '',
          width: CASE_STUDY_PHOTO_DIMENSION_MAX,
          height: 1,
        })),
      }),
    )
  })

  it('Emulator の Storage の URL（http://127.0.0.1:9199/...）も保存できる', async () => {
    await assertSucceeds(
      setDoc(caseDoc(db(), NEW_ID), {
        ...newDocument(),
        photos: [
          {
            ...photo(NEW_ID, 1),
            smallUrl: 'http://127.0.0.1:9199/v0/b/demo/o/photo1-small.webp?alt=media',
          },
        ],
      }),
    )
  })

  describe('不正なデータは admin でも保存できない', () => {
    const omit = (key: string) =>
      Object.fromEntries(Object.entries(newDocument()).filter(([k]) => k !== key))
    const withPhoto = (patch: Record<string, unknown>) => ({
      ...newDocument(),
      photos: [{ ...photo(NEW_ID, 1), ...patch }],
    })
    const withoutPhotoKey = (key: string) => ({
      ...newDocument(),
      photos: [Object.fromEntries(Object.entries(photo(NEW_ID, 1)).filter(([k]) => k !== key))],
    })

    it.each(CASE_STUDY_DOCUMENT_KEYS)('%s が無い', async (key) => {
      await assertFails(setDoc(caseDoc(db(), NEW_ID), omit(key)))
    })

    it('スキーマに無い項目がある', async () => {
      await assertFails(setDoc(caseDoc(db(), NEW_ID), { ...newDocument(), extra: 'x' }))
    })

    it.each(['tag', 'company', 'title', 'category', 'description'] as const)(
      '%s が長すぎる',
      async (key) => {
        await assertFails(
          setDoc(caseDoc(db(), NEW_ID), {
            ...newDocument(),
            [key]: 'あ'.repeat(CASE_STUDY_MAX_LENGTH[key] + 1),
          }),
        )
      },
    )

    it.each(['tag', 'company', 'title', 'category', 'description'] as const)(
      '%s が空',
      async (key) => {
        await assertFails(setDoc(caseDoc(db(), NEW_ID), { ...newDocument(), [key]: '' }))
      },
    )

    it.each(['tag', 'company', 'title', 'category', 'description', 'date'] as const)(
      '%s が文字列でない',
      async (key) => {
        await assertFails(setDoc(caseDoc(db(), NEW_ID), { ...newDocument(), [key]: 1 }))
      },
    )

    it.each(['private', 'Published', '', null])('status が %s', async (status) => {
      await assertFails(setDoc(caseDoc(db(), NEW_ID), { ...newDocument(), status }))
    })

    it.each(['2026/04/01', '2026-4-1', '2026-13-01', '2026.00.00', '2026-04-01T00:00:00Z'])(
      '日付が %s',
      async (date) => {
        await assertFails(setDoc(caseDoc(db(), NEW_ID), { ...newDocument(), date }))
      },
    )

    it('写真が 0 枚', async () => {
      await assertFails(setDoc(caseDoc(db(), NEW_ID), { ...newDocument(), photos: [] }))
    })

    it('写真が 5 枚', async () => {
      await assertFails(
        setDoc(caseDoc(db(), NEW_ID), {
          ...newDocument(),
          photos: [1, 2, 3, 4, 5].map((n) => photo(NEW_ID, n)),
        }),
      )
    })

    it('photos が配列でない', async () => {
      await assertFails(
        setDoc(caseDoc(db(), NEW_ID), { ...newDocument(), photos: photo(NEW_ID, 1) }),
      )
    })

    it.each(CASE_STUDY_PHOTO_KEYS)('写真に %s が無い', async (key) => {
      await assertFails(setDoc(caseDoc(db(), NEW_ID), withoutPhotoKey(key)))
    })

    it.each<[string, Record<string, unknown>]>([
      ['余分な項目がある', { caption: 'x' }],
      ['path が別の事例のもの', { path: caseStudyPhotoBasePath('other', 'photo1', 'image/webp') }],
      ['path が case-studies/ の外', { path: 'other/new1/photo1.webp' }],
      ['path に余分な階層がある', { path: 'case-studies/new1/a/b.webp' }],
      ['path に拡張子が無い', { path: 'case-studies/new1/photo1' }],
      ['path の拡張子が webp・jpg でない', { path: 'case-studies/new1/photo1.png' }],
      ['URL が http(s) でない', { largeUrl: 'javascript:alert(1)' }],
      [
        'URL が長すぎる',
        { smallUrl: `https://example.com/${'a'.repeat(CASE_STUDY_MAX_LENGTH.url)}` },
      ],
      ['幅が 0', { width: 0 }],
      ['高さが小数', { height: 10.5 }],
      ['幅が文字列', { width: '1600' }],
      ['幅が大きすぎる', { width: CASE_STUDY_PHOTO_DIMENSION_MAX + 1 }],
      ['説明が長すぎる', { alt: 'あ'.repeat(CASE_STUDY_MAX_LENGTH.alt + 1) }],
    ])('写真の %s', async (_label, patch) => {
      await assertFails(setDoc(caseDoc(db(), NEW_ID), withPhoto(patch)))
    })

    it('2 枚目以降の写真も検証する', async () => {
      await assertFails(
        setDoc(caseDoc(db(), NEW_ID), {
          ...newDocument(),
          photos: [photo(NEW_ID, 1), photo(NEW_ID, 2), photo(NEW_ID, 3), { path: 'x' }],
        }),
      )
    })

    it('updatedBy が自分の uid でない（なりすまし）', async () => {
      await assertFails(
        setDoc(caseDoc(db(), NEW_ID), { ...newDocument(), updatedBy: 'someone-else' }),
      )
    })

    it('updatedAt がサーバーの時刻でない', async () => {
      await assertFails(
        setDoc(caseDoc(db(), NEW_ID), { ...newDocument(), updatedAt: Timestamp.now() }),
      )
    })

    it('新規作成で createdAt がサーバーの時刻でない', async () => {
      await assertFails(setDoc(caseDoc(db(), NEW_ID), { ...newDocument(), createdAt }))
    })

    it('Storage のパスに使えない ID（. を含む）で作成する', async () => {
      // caseStudyPhotoBasePath は不正な ID で例外にするため、パスは直接書く
      await assertFails(
        setDoc(caseDoc(db(), 'bad.id'), {
          ...newDocument(),
          photos: [{ ...photo(NEW_ID, 1), path: 'case-studies/bad.id/photo1.webp' }],
        }),
      )
    })

    it('更新で createdAt を書き換える', async () => {
      await assertFails(
        updateDoc(caseDoc(db(), DRAFT_ID), {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          updatedBy: ADMIN_UID,
        }),
      )
    })

    it('更新で updatedAt を付けない', async () => {
      await assertFails(
        updateDoc(caseDoc(db(), DRAFT_ID), { status: 'published', updatedBy: ADMIN_UID }),
      )
    })

    it('更新で updatedBy を付けない（前の更新者のまま）', async () => {
      await assertFails(
        updateDoc(caseDoc(db(), DRAFT_ID), { status: 'published', updatedAt: serverTimestamp() }),
      )
    })

    it('更新で必須の項目を消す', async () => {
      await assertFails(
        updateDoc(caseDoc(db(), DRAFT_ID), {
          title: deleteField(),
          updatedAt: serverTimestamp(),
          updatedBy: ADMIN_UID,
        }),
      )
    })
  })
})
