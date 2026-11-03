import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectStorageEmulator, getStorage } from 'firebase/storage'
import type { FirebaseApp } from 'firebase/app'
import { FIREBASE_EMULATORS, loadFirebaseApp } from '~/lib/firebase'
import type { AdminApi } from './api'
import { createFirebaseAdminApi } from './firebaseAdminApi'

// 管理画面の Firebase（Auth・Firestore・Storage）の準備。
// 管理画面のレイアウト（routes/admin/layout.tsx）から import() で読み込むため、
// これらの SDK は公開ページのバンドルには入らない（フォームの Functions と同じアプリを使い回す）

// ログイン状態はブラウザに保存する（タブを閉じてもログインしたまま）。
// getAuth はポップアップ・リダイレクトでのログインの処理も読み込むため、使う機能だけで初期化する
const createAuth = (app: FirebaseApp): Auth => {
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    })
  } catch {
    // 開発サーバーの再読み込みなどで、既に初期化してあった場合
    return getAuth(app)
  }
}

let apiPromise: Promise<AdminApi> | undefined

async function createAdminApi(): Promise<AdminApi> {
  const { app, settings } = await loadFirebaseApp()
  const auth = createAuth(app)
  const db = getFirestore(app)
  const storage = getStorage(app)
  if (settings.useEmulators) {
    const { host, ports } = FIREBASE_EMULATORS
    connectAuthEmulator(auth, `http://${host}:${ports.auth}`, { disableWarnings: true })
    connectFirestoreEmulator(db, host, ports.firestore)
    connectStorageEmulator(storage, host, ports.storage)
  }
  return createFirebaseAdminApi({ auth, db, storage })
}

// 1 度だけ用意する。読み込みに失敗した場合は次の呼び出しでやり直す
export function loadAdminApi(): Promise<AdminApi> {
  apiPromise ??= createAdminApi().catch((error: unknown) => {
    apiPromise = undefined
    throw error
  })
  return apiPromise
}
