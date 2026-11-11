// 送信処理（Cloud Functions の callable 関数）と画面の間の取り決め

// 関数名（firebase/functions の httpsCallable に渡す）
export const SUBMIT_INQUIRY_FUNCTION = 'submitInquiry'

// 受け付けたとき（ボットと判定して捨てたときも同じ）の戻り値
export type SubmitInquiryResponse = { ok: true }

// 項目ごとのエラー。path は項目名（react-hook-form の setError に渡せる）。項目に紐づかないエラーは空文字
export type FieldIssue = { path: string; message: string }

// 入力チェックでエラーになったとき（HttpsError の invalid-argument）の details
export type InquiryErrorDetails = { issues: FieldIssue[] }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isFieldIssue = (value: unknown): value is FieldIssue =>
  isRecord(value) && typeof value.path === 'string' && typeof value.message === 'string'

// FirebaseError の details（unknown）が項目ごとのエラーの形式か
export const isInquiryErrorDetails = (value: unknown): value is InquiryErrorDetails =>
  isRecord(value) && Array.isArray(value.issues) && value.issues.every(isFieldIssue)
