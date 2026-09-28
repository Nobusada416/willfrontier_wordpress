import { isInquiryErrorDetails, type InquiryPayload } from '@wf/shared'
import { loadInquiryCallable, type InquiryCallable } from './firebase'

export type SubmitResult =
  | { status: 'ok' }
  // 送信処理の入力チェックで弾かれた（項目名 → エラー文）
  | { status: 'invalid'; fieldErrors: Record<string, string> }
  // 通信エラー・サーバーエラーなど、利用者が入力を直しても解決しない失敗
  | { status: 'error' }

const callSubmitInquiry: InquiryCallable = async (payload) => (await loadInquiryCallable())(payload)

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
    await call(payload)
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
