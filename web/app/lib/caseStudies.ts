import {
  CASE_STUDIES_COLLECTION,
  caseStudyContentSchema,
  type CaseStudy,
  type CaseStudyStatus,
} from '@wf/shared'
import { usesFirebaseEmulators } from './firebaseEnv'

// 公開サイトの施工事例の読み込み。
// Firebase の SDK は大きく表示速度に響くため読み込まず、Firestore の REST（runQuery）を fetch で呼ぶ。
// firestore.rules は status == 'published' の事例だけを誰でも読めるようにしており、
// 一覧のクエリは「status == 'published' ＋ date の新しい順」でないと拒否される（firestore.indexes.json に複合インデックス）

type Env = Readonly<Record<string, string | undefined>>

const PRODUCTION_ORIGIN = 'https://firestore.googleapis.com'
// firebase.json の emulators.firestore と同じ
const EMULATOR_ORIGIN = 'http://127.0.0.1:8080'
// lib/firebase.ts と同じ demo プロジェクト（.firebaserc）
const DEMO_PROJECT_ID = 'demo-willfrontier'
// Firebase のプロジェクト ID に使える文字（URL に埋め込むため、それ以外は設定が無いものとして扱う）
const PROJECT_ID = /^[a-z0-9-]{1,64}$/

const PUBLISHED: CaseStudyStatus = 'published'

// 応答が無いまま待ち続けないよう、この時間で中断して「失敗」の案内を出す
const TIMEOUT_MS = 10_000

declare global {
  // E2E（web/e2e/caseStudies.spec.ts）が page.addInitScript で置く、REST の接続先のプロジェクト ID。
  // E2E のビルドには Firebase の設定が無く通信しないため、応答を差し替えて表示を確かめるときだけ使う。
  // 設定のあるビルド（本番）では使わない
  var __WF_E2E_FIRESTORE_PROJECT_ID__: string | undefined
}

const validProjectId = (value: string | undefined) => {
  const id = value?.trim()
  return id && PROJECT_ID.test(id) ? id : undefined
}

// runQuery の URL。設定が無いビルド（CI・E2E）では undefined を返し、読み込みは失敗として扱う
export function caseStudiesQueryUrl(env: Env): string | undefined {
  const useEmulators = usesFirebaseEmulators(env)
  const configured = env.VITE_FIREBASE_PROJECT_ID?.trim()
  const projectId = configured
    ? validProjectId(configured)
    : useEmulators
      ? DEMO_PROJECT_ID
      : validProjectId(globalThis.__WF_E2E_FIRESTORE_PROJECT_ID__)
  if (!projectId) return undefined
  const origin = useEmulators ? EMULATOR_ORIGIN : PRODUCTION_ORIGIN
  return `${origin}/v1/projects/${projectId}/databases/(default)/documents:runQuery`
}

// 公開中の事例を日付の新しい順に取るクエリ（runQuery の本文）
export function buildPublishedCaseStudiesQuery(limit?: number) {
  return {
    structuredQuery: {
      from: [{ collectionId: CASE_STUDIES_COLLECTION }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'status' },
          op: 'EQUAL',
          value: { stringValue: PUBLISHED },
        },
      },
      orderBy: [{ field: { fieldPath: 'date' }, direction: 'DESCENDING' }],
      ...(limit === undefined ? {} : { limit }),
    },
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const decodeFields = (fields: unknown): Record<string, unknown> =>
  isRecord(fields)
    ? Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)]),
      )
    : {}

// Firestore の REST の値（{ stringValue: 'a' } など）を JavaScript の値にする。
// 施工事例で使わない形式（geoPointValue・referenceValue・bytesValue）は undefined にし、スキーマの検証で落とす
export function decodeFirestoreValue(value: unknown): unknown {
  if (!isRecord(value)) return undefined
  if ('stringValue' in value) return value.stringValue
  // 64 bit 整数は文字列で届く。施工事例の整数（写真の寸法）は Number で正確に表せる範囲
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('booleanValue' in value) return value.booleanValue
  if ('nullValue' in value) return null
  if ('timestampValue' in value) return value.timestampValue
  if ('arrayValue' in value) {
    const values = isRecord(value.arrayValue) ? value.arrayValue.values : undefined
    return Array.isArray(values) ? values.map(decodeFirestoreValue) : []
  }
  if ('mapValue' in value) {
    return decodeFields(isRecord(value.mapValue) ? value.mapValue.fields : undefined)
  }
  return undefined
}

// ドキュメントの name（projects/…/documents/caseStudies/{ID}）の末尾が事例の ID
const documentId = (name: unknown) =>
  typeof name === 'string' ? name.slice(name.lastIndexOf('/') + 1) : ''

export class CaseStudiesLoadError extends Error {
  override name = 'CaseStudiesLoadError'
}

// runQuery の応答を事例の一覧にする。
// 応答は「{ document?, readTime }」の配列（0 件なら document の無い要素が 1 つ）。
// スキーマに合わないドキュメントは捨て、ほかの事例は表示する（1 件の不備でページ全体を失敗にしない）
export function parseRunQueryResponse(body: unknown): CaseStudy[] {
  if (!Array.isArray(body)) throw new CaseStudiesLoadError('runQuery の応答が配列ではありません')
  return body.flatMap((entry: unknown): CaseStudy[] => {
    if (!isRecord(entry)) return []
    if (entry.error !== undefined) {
      throw new CaseStudiesLoadError('runQuery の応答にエラーが含まれています')
    }
    if (!isRecord(entry.document)) return []
    const id = documentId(entry.document.name)
    const parsed = caseStudyContentSchema.safeParse(decodeFields(entry.document.fields))
    if (!id || !parsed.success || parsed.data.status !== PUBLISHED) return []
    return [{ id, ...parsed.data }]
  })
}

type FetchOptions = {
  // ビルド時の環境変数（import.meta.env）。Node の結合テストからも呼べるよう、呼び出し側で渡す
  env: Env
  // 取得する件数（トップは 4 件）。指定しなければすべて
  limit?: number
  signal?: AbortSignal
}

// 公開中の施工事例を日付の新しい順に読む。設定が無い・通信の失敗・応答の不備は例外にする
export async function fetchPublishedCaseStudies({
  env,
  limit,
  signal,
}: FetchOptions): Promise<CaseStudy[]> {
  const url = caseStudiesQueryUrl(env)
  if (!url) throw new CaseStudiesLoadError('Firebase のプロジェクトが設定されていません')

  const controller = new AbortController()
  const abort = () => controller.abort(signal?.reason)
  if (signal?.aborted) abort()
  signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(
    () =>
      controller.abort(new CaseStudiesLoadError('施工事例の読み込みが時間内に終わりませんでした')),
    TIMEOUT_MS,
  )
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPublishedCaseStudiesQuery(limit)),
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new CaseStudiesLoadError(`施工事例を読み込めませんでした（HTTP ${response.status}）`)
    }
    return parseRunQueryResponse(await response.json())
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}
