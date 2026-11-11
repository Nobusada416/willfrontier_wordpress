// 共通設定を関数の定義より先に適用する（import は記述順に評価される）
import './globalOptions'
import type { InquiryErrorDetails, SubmitInquiryResponse } from '@wf/shared'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import {
  handleInquiry,
  INQUIRIES_COLLECTION,
  type InquiryDeps,
  type InquiryResult,
  type Write,
} from './handleInquiry'
import { mailTo, shouldEnforceAppCheck } from './params'

// フォームの送信を受け付ける callable 関数。
// 処理の中身は handleInquiry（Firebase に依存しない）に任せ、ここでは応答とエラーの形に変換するだけにする

export type SubmitInquiryDeps = InquiryDeps & {
  logger: Pick<typeof logger, 'info' | 'error'>
}

export const createSubmitInquiryHandler =
  (deps: SubmitInquiryDeps) =>
  async ({ data }: { data: unknown }): Promise<SubmitInquiryResponse> => {
    let result: InquiryResult
    try {
      result = await handleInquiry(data, deps)
    } catch (error) {
      // 原因（設定漏れ・Firestore の障害など）は記録だけしてクライアントには返さない
      deps.logger.error('問い合わせの受け付けに失敗しました', error)
      throw new HttpsError('internal', '送信に失敗しました。しばらくしてから再度お試しください。')
    }

    switch (result.kind) {
      case 'invalid': {
        // 入力値は個人情報を含むため記録しない（項目名だけ）
        deps.logger.info('入力内容に誤りがあるため受け付けませんでした', {
          paths: result.issues.map((issue) => issue.path),
        })
        const details: InquiryErrorDetails = { issues: result.issues }
        throw new HttpsError('invalid-argument', '入力内容に誤りがあります。', details)
      }
      case 'spam':
        deps.logger.info('隠し項目に値があるため破棄しました')
        return { ok: true }
      case 'accepted':
        deps.logger.info('問い合わせを受け付けました', { id: result.id, formType: result.formType })
        return { ok: true }
    }
  }

// Firestore の batch に必要な部分だけの型（テストで差し替えられるようにする）
type BatchTarget<Ref> = {
  doc: (path: string) => Ref
  batch: () => {
    set: (ref: Ref, data: Record<string, unknown>) => unknown
    commit: () => Promise<unknown>
  }
}

// すべての書き込みを 1 つの batch で行う（inquiries と mail のどちらか一方だけが保存されることはない）
export const commitWrites = async <Ref>(db: BatchTarget<Ref>, writes: Write[]) => {
  const batch = db.batch()
  for (const { path, data } of writes) batch.set(db.doc(path), data)
  await batch.commit()
}

// Admin SDK は最初に使うときに初期化する（テストで import しただけでは初期化しない）
const firestore = () => getFirestore(getApps()[0] ?? initializeApp())

export const submitInquiry = onCall(
  { enforceAppCheck: shouldEnforceAppCheck(process.env) },
  createSubmitInquiryHandler({
    now: () => new Date(),
    newId: () => firestore().collection(INQUIRIES_COLLECTION).doc().id,
    mailTo,
    save: (writes) => commitWrites(firestore(), writes),
    logger,
  }),
)
