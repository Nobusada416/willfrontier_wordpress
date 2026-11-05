import { isInquiryErrorDetails, type InquiryPayload } from '@wf/shared'
import { loadInquiryCallable, type InquiryCallable } from './firebase'

export type SubmitResult =
  | { status: 'ok' }
  // 送信処理の入力チェックで弾かれた（項目名 → エラー文）
  | { status: 'invalid'; fieldErrors: Record<string, string> }
  // 通信エラー・サーバーエラーなど、利用者が入力を直しても解決しない失敗
  | { status: 'error' }

const callSubmitInquiry: InquiryCallable = async (payload) => (await loadInquiryCallable())(payload)

// 送信全体（Firebase の読み込み・App Check のトークン・関数の呼び出し）の時間切れ。
// reCAPTCHA が読み込めない（広告ブロッカーなど）と SDK はトークンを待ち続け、SDK の時間切れ（通信だけが対象）も効かないため。
// 関数のコールドスタートと App Check の準備に十分な長さにする
export const SUBMIT_TIMEOUT_MS = 20_000

class SubmitTimeoutError extends Error {
  constructor() {
    super(`送信が ${SUBMIT_TIMEOUT_MS / 1000} 秒以内に終わりませんでした`)
    this.name = 'SubmitTimeoutError'
  }
}

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new SubmitTimeoutError()), SUBMIT_TIMEOUT_MS)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timer)
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

// 送信処理（Cloud Functions）が invalid-argument の details に入れる項目ごとのエラー
// { issues: [{ path: 'tel', message: '…' }] }（shared/src/forms/submit.ts）から、項目ごとに最初のエラー文を取り出す
function fieldErrorsFrom(details: unknown): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  if (!isInquiryErrorDetails(details)) return fieldErrors
  for (const { path, message } of details.issues) {
    // path が空文字のエラーは項目に紐づかないため、送信の失敗として扱う
    if (path !== '' && !(path in fieldErrors)) fieldErrors[path] = message
  }
  return fieldErrors
}

export async function submitInquiry(
  payload: InquiryPayload,
  call: InquiryCallable = callSubmitInquiry,
): Promise<SubmitResult> {
  try {
    await withTimeout(call(payload))
    return { status: 'ok' }
  } catch (error: unknown) {
    if (isRecord(error) && error.code === 'functions/invalid-argument') {
      const fieldErrors = fieldErrorsFrom(error.details)
      if (Object.keys(fieldErrors).length > 0) return { status: 'invalid', fieldErrors }
    }
    // 画面には汎用の文言を出すため、原因の調査用にコンソールへ残す
    console.error('お問い合わせの送信に失敗しました', error)
    return { status: 'error' }
  }
}

// フォームを操作し始めたときに Firebase の読み込みと App Check の準備を始め、送信時の待ち時間を減らす。
// ここでの失敗は送信時にもう一度読み込んで画面に出すため、調査用に記録するだけにする
export function prepareSubmitInquiry() {
  loadInquiryCallable().catch((error: unknown) => {
    console.warn('送信の準備（Firebase の読み込み）に失敗しました', error)
  })
}
