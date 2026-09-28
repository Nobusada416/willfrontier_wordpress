import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

// フォームの送信内容（個人情報）とメール送信キューは Cloud Functions（Admin SDK）だけが扱う。
// クライアントからの読み書きはすべて拒否されることを確認する
let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-willfrontier-rules',
    firestore: { rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8') },
  })
})

afterAll(async () => {
  await env.cleanup()
})

beforeEach(async () => {
  await env.clearFirestore()
  // 既存ドキュメントに対する read / update / delete を検証するため、ルールを無視して用意する
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await setDoc(doc(db, 'inquiries/existing'), { name: 'テスト' })
    await setDoc(doc(db, 'mail/existing'), { to: 'test@example.com' })
  })
})

const clients = [
  { label: '未認証ユーザー', db: () => env.unauthenticatedContext().firestore() },
  { label: '認証済みユーザー', db: () => env.authenticatedContext('user-1').firestore() },
]

describe.each(clients)('$label', ({ db }) => {
  describe.each(['inquiries', 'mail', 'anything'])('%s コレクション', (name) => {
    it('新規作成できない', async () => {
      await assertFails(setDoc(doc(db(), `${name}/new`), { foo: 'bar' }))
    })

    it('1 件取得できない', async () => {
      await assertFails(getDoc(doc(db(), `${name}/existing`)))
    })

    it('一覧取得できない', async () => {
      await assertFails(getDocs(collection(db(), name)))
    })

    it('更新できない', async () => {
      await assertFails(updateDoc(doc(db(), `${name}/existing`), { foo: 'baz' }))
    })

    it('削除できない', async () => {
      await assertFails(deleteDoc(doc(db(), `${name}/existing`)))
    })
  })
})
