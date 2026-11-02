import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildPublishedCaseStudiesQuery,
  caseStudiesQueryUrl,
  decodeFirestoreValue,
  fetchPublishedCaseStudies,
  parseRunQueryResponse,
} from './caseStudies'

afterEach(() => {
  vi.unstubAllGlobals()
})

// Firestore の REST の値の形式に変換する（テストのデータ作成用）
const photoFields = (index: number) => ({
  mapValue: {
    fields: {
      path: { stringValue: `case-studies/case-1/photo-${index}` },
      smallUrl: { stringValue: `https://firebasestorage.googleapis.com/small-${index}.webp` },
      largeUrl: { stringValue: `https://firebasestorage.googleapis.com/large-${index}.webp` },
      width: { integerValue: '1600' },
      height: { integerValue: '1200' },
      alt: { stringValue: index === 0 ? '解体前の工場' : '' },
    },
  },
})

const documentOf = (id: string, overrides: Record<string, unknown> = {}) => ({
  document: {
    name: `projects/demo-willfrontier/databases/(default)/documents/caseStudies/${id}`,
    fields: {
      status: { stringValue: 'published' },
      date: { stringValue: '2026-04-01' },
      tag: { stringValue: '運用開始' },
      company: { stringValue: '株式会社テスト' },
      title: { stringValue: '工場リノベーション廃材処理' },
      category: { stringValue: '産業廃棄物 / 金属類' },
      description: { stringValue: '1 行目\n2 行目' },
      photos: { arrayValue: { values: [photoFields(0), photoFields(1)] } },
      createdAt: { timestampValue: '2026-04-01T00:00:00Z' },
      updatedAt: { timestampValue: '2026-04-02T00:00:00Z' },
      updatedBy: { stringValue: 'admin-uid' },
      ...overrides,
    },
    createTime: '2026-04-01T00:00:00Z',
    updateTime: '2026-04-02T00:00:00Z',
  },
  readTime: '2026-04-03T00:00:00Z',
})

describe('caseStudiesQueryUrl', () => {
  it('本番は firestore.googleapis.com の runQuery を使う', () => {
    expect(caseStudiesQueryUrl({ VITE_FIREBASE_PROJECT_ID: 'willfrontier' })).toBe(
      'https://firestore.googleapis.com/v1/projects/willfrontier/databases/(default)/documents:runQuery',
    )
  })

  it('Emulator では 127.0.0.1:8080 を使い、プロジェクトが無ければ demo-willfrontier にする', () => {
    expect(caseStudiesQueryUrl({ VITE_USE_FIREBASE_EMULATORS: 'true' })).toBe(
      'http://127.0.0.1:8080/v1/projects/demo-willfrontier/databases/(default)/documents:runQuery',
    )
  })

  it('プロジェクトの設定が無い・空のビルドでは undefined（読み込みは失敗として扱う）', () => {
    expect(caseStudiesQueryUrl({})).toBeUndefined()
    expect(caseStudiesQueryUrl({ VITE_FIREBASE_PROJECT_ID: '  ' })).toBeUndefined()
  })

  it('設定が無いビルドに限り、E2E が置いたプロジェクト ID を使う（本番の設定は上書きしない）', () => {
    vi.stubGlobal('__WF_E2E_FIRESTORE_PROJECT_ID__', 'demo-e2e')
    expect(caseStudiesQueryUrl({})).toBe(
      'https://firestore.googleapis.com/v1/projects/demo-e2e/databases/(default)/documents:runQuery',
    )
    expect(caseStudiesQueryUrl({ VITE_FIREBASE_PROJECT_ID: 'willfrontier' })).toContain(
      '/projects/willfrontier/',
    )
  })

  it('プロジェクト ID を URL に使える文字に限る', () => {
    expect(caseStudiesQueryUrl({ VITE_FIREBASE_PROJECT_ID: '../evil' })).toBeUndefined()
  })
})

describe('buildPublishedCaseStudiesQuery', () => {
  it('公開中だけを日付の新しい順に取る（firestore.rules が許可する形）', () => {
    expect(buildPublishedCaseStudiesQuery()).toEqual({
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
    })
  })

  it('件数を指定できる', () => {
    expect(buildPublishedCaseStudiesQuery(4).structuredQuery).toMatchObject({ limit: 4 })
  })
})

describe('decodeFirestoreValue', () => {
  it.each([
    [{ stringValue: 'a' }, 'a'],
    [{ integerValue: '42' }, 42],
    [{ doubleValue: 1.5 }, 1.5],
    [{ booleanValue: true }, true],
    [{ nullValue: null }, null],
    [{ timestampValue: '2026-04-01T00:00:00Z' }, '2026-04-01T00:00:00Z'],
    [{ arrayValue: {} }, []],
    [{ mapValue: {} }, {}],
  ])('%j を %j にする', (value, expected) => {
    expect(decodeFirestoreValue(value)).toEqual(expected)
  })

  it('配列・マップは中身も変換する', () => {
    expect(
      decodeFirestoreValue({
        arrayValue: {
          values: [{ mapValue: { fields: { a: { integerValue: '1' }, b: { stringValue: 'x' } } } }],
        },
      }),
    ).toEqual([{ a: 1, b: 'x' }])
  })

  it('知らない形式は undefined（スキーマの検証で落とす）', () => {
    expect(decodeFirestoreValue({ geoPointValue: { latitude: 0, longitude: 0 } })).toBeUndefined()
    expect(decodeFirestoreValue('text')).toBeUndefined()
  })
})

describe('parseRunQueryResponse', () => {
  it('ドキュメントを ID 付きの事例に変換し、順番を保つ（日時などの余分な項目は除く）', () => {
    const studies = parseRunQueryResponse([documentOf('case-2'), documentOf('case-1')])
    expect(studies.map((study) => study.id)).toEqual(['case-2', 'case-1'])
    expect(studies[0]).toEqual({
      id: 'case-2',
      status: 'published',
      date: '2026-04-01',
      tag: '運用開始',
      company: '株式会社テスト',
      title: '工場リノベーション廃材処理',
      category: '産業廃棄物 / 金属類',
      description: '1 行目\n2 行目',
      photos: [
        {
          path: 'case-studies/case-1/photo-0',
          smallUrl: 'https://firebasestorage.googleapis.com/small-0.webp',
          largeUrl: 'https://firebasestorage.googleapis.com/large-0.webp',
          width: 1600,
          height: 1200,
          alt: '解体前の工場',
        },
        {
          path: 'case-studies/case-1/photo-1',
          smallUrl: 'https://firebasestorage.googleapis.com/small-1.webp',
          largeUrl: 'https://firebasestorage.googleapis.com/large-1.webp',
          width: 1600,
          height: 1200,
          alt: '',
        },
      ],
    })
  })

  it('0 件の応答（document の無い要素だけ）は空の一覧', () => {
    expect(parseRunQueryResponse([{ readTime: '2026-04-03T00:00:00Z' }])).toEqual([])
    expect(parseRunQueryResponse([])).toEqual([])
  })

  it('スキーマに合わないドキュメント・下書きは捨て、ほかは表示する', () => {
    const studies = parseRunQueryResponse([
      documentOf('broken', { title: { stringValue: '' } }),
      documentOf('no-photos', { photos: { arrayValue: {} } }),
      documentOf('draft', { status: { stringValue: 'draft' } }),
      documentOf('ok'),
    ])
    expect(studies.map((study) => study.id)).toEqual(['ok'])
  })

  it('配列でない応答・エラーを含む応答は例外にする', () => {
    expect(() => parseRunQueryResponse({ error: { code: 403 } })).toThrow()
    expect(() => parseRunQueryResponse([{ error: { code: 9, message: 'index' } }])).toThrow()
  })
})

describe('fetchPublishedCaseStudies', () => {
  const env = { VITE_FIREBASE_PROJECT_ID: 'willfrontier' }
  const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })

  it('runQuery に POST し、公開中の事例を返す', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([documentOf('case-1')]))
    vi.stubGlobal('fetch', fetchMock)

    const studies = await fetchPublishedCaseStudies({ env, limit: 4 })

    expect(studies.map((study) => study.id)).toEqual(['case-1'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(
      'https://firestore.googleapis.com/v1/projects/willfrontier/databases/(default)/documents:runQuery',
    )
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual(buildPublishedCaseStudiesQuery(4))
  })

  it('設定が無いビルドでは通信せずに失敗する', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchPublishedCaseStudies({ env: {} })).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('HTTP のエラー・通信の失敗は例外にする', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: {} }, 403)))
    await expect(fetchPublishedCaseStudies({ env })).rejects.toThrow()

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(fetchPublishedCaseStudies({ env })).rejects.toThrow()
  })

  it('応答が無いまま時間が過ぎたら中断して失敗する', async () => {
    vi.useFakeTimers()
    try {
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_url: string, init: RequestInit) =>
            new Promise((_resolve, reject) => {
              init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
            }),
        ),
      )
      const result = fetchPublishedCaseStudies({ env })
      const assertion = expect(result).rejects.toThrow()
      await vi.advanceTimersByTimeAsync(15_000)
      await assertion
    } finally {
      vi.useRealTimers()
    }
  })

  it('呼び出し側の signal で中断できる', async () => {
    const fetchMock = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
        }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()
    const result = fetchPublishedCaseStudies({ env, signal: controller.signal })
    controller.abort()
    await expect(result).rejects.toThrow()
  })
})
