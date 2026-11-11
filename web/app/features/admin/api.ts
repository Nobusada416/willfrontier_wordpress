import type {
  CaseStudy,
  CaseStudyFormValues,
  CaseStudyImageContentType,
  CaseStudyImageSize,
  CaseStudyPhoto,
  CaseStudyStatus,
} from '@wf/shared'
import { createContext, useContext } from 'react'
import type { SignInError } from './signInErrors'

// 管理画面が Firebase（Auth・Firestore・Storage）に対して行う操作。
// 画面はこの型だけに依存し、本物（firebaseAdminApi.ts）はルートで遅延して読み込む。
// テストでは偽物（app/test/fakeAdminApi.ts）に差し替える

export type AdminUser = { uid: string; email: string }

// ログイン状態の変化。forbidden は管理者でないアカウントでログインしていた（ログアウト済み）
export type AuthEvent =
  { type: 'signedOut' } | { type: 'admin'; user: AdminUser } | { type: 'forbidden' }

export type SignInResult = { ok: true } | { ok: false; error: SignInError }

// 一覧・編集で扱う事例（最後に保存した日時を並び順に使う）
export type AdminCaseStudy = CaseStudy & { updatedAt: Date | null }

// ブラウザで縮小・変換した写真（photos.ts）。寸法は large のもの
export type ProcessedPhoto = {
  width: number
  height: number
  // small・large の形式（webp。webp を書き出せないブラウザでは JPEG）
  contentType: CaseStudyImageContentType
  files: Record<CaseStudyImageSize, Blob>
}

export type SaveCaseStudyInput = {
  id: string
  // 新規作成（createdAt を付ける）か、既存の更新か
  isNew: boolean
  values: CaseStudyFormValues
  status: CaseStudyStatus
}

export interface AdminApi {
  // ログイン状態の監視。戻り値で監視をやめる
  onAuthChange(listener: (event: AuthEvent) => void): () => void
  // 管理者でなければログアウトして forbidden を返す
  signIn(email: string, password: string): Promise<SignInResult>
  signOut(): Promise<void>
  // 新しい事例の ID（写真をアップロードする前に決める）
  newCaseStudyId(): string
  listCaseStudies(): Promise<AdminCaseStudy[]>
  getCaseStudy(id: string): Promise<AdminCaseStudy | null>
  saveCaseStudy(input: SaveCaseStudyInput): Promise<void>
  // 一覧の「公開する／非公開にする」
  setStatus(id: string, status: CaseStudyStatus): Promise<void>
  // 事例と、その写真のファイルをすべて削除する
  deleteCaseStudy(caseStudy: Pick<CaseStudy, 'id' | 'photos'>): Promise<void>
  // 写真（small・large）をアップロードし、photos に入れる値を返す（説明は空）
  uploadPhoto(caseId: string, photo: ProcessedPhoto): Promise<CaseStudyPhoto>
  // 写真のファイル（基準パス photos[].path ごとに small・large）を消す。既に無いものは無視する
  deletePhotos(paths: readonly string[]): Promise<void>
}

export const AdminApiContext = createContext<AdminApi | null>(null)

export function useAdminApi(): AdminApi {
  const api = useContext(AdminApiContext)
  if (!api) throw new Error('AdminApiContext の中で使ってください')
  return api
}

export const AdminUserContext = createContext<AdminUser | null>(null)

export function useAdminUser(): AdminUser {
  const user = useContext(AdminUserContext)
  if (!user) throw new Error('ログイン後の画面で使ってください')
  return user
}
