import { SUBMIT_INQUIRY_FUNCTION, type InquiryPayload } from '@wf/shared'
import type { FirebaseApp } from 'firebase/app'
import {
  firebaseStorageBucket,
  missingFirebaseEnv,
  REQUIRED_FIREBASE_ENV,
  usesFirebaseEmulators,
} from './firebaseEnv'

// Firebase の準備（設定の読み取り・アプリの作成・Emulator の接続先）と、フォームの送信処理（Cloud Functions の submitInquiry）。
// Firebase の SDK は大きいため、ここでは import() で必要になったときに初めて読み込む（ページ表示時には読み込まない）。
// - フォーム: 操作し始めたときに loadInquiryCallable で Functions と App Check を読み込む
// - 施工事例の管理画面（/admin/）: features/admin/loadAdminApi.ts が loadFirebaseApp のアプリに
//   Auth・Firestore・Storage を付ける（管理画面のルートからだけ読み込むため、公開ページのバンドルには入らない）

type Env = Readonly<Record<string, string | undefined>>

export type FirebaseSettings = {
  config: {
    apiKey: string
    projectId: string
    appId: string
    authDomain: string
    // 施工事例の写真の置き場所（管理画面）
    storageBucket: string
  }
  // App Check（reCAPTCHA v3）のサイトキー。Emulator で動かす場合は無くてよい
  recaptchaSiteKey: string | undefined
  useEmulators: boolean
}

// Emulator 用の demo プロジェクト（.firebaserc と同じ）。demo- で始まるプロジェクトは実在のリソースに接続しない
const DEMO_PROJECT_ID = 'demo-willfrontier'
const FUNCTIONS_REGION = 'asia-northeast1'

// Emulator の接続先（firebase.json の emulators と同じポート。lib/firebase.test.ts で確かめる）
export const FIREBASE_EMULATORS = {
  host: '127.0.0.1',
  ports: { functions: 5001, auth: 9099, firestore: 8080, storage: 9199 },
} as const

const withStorageBucket = (
  env: Env,
  config: Omit<FirebaseSettings['config'], 'storageBucket'>,
): FirebaseSettings['config'] => ({
  ...config,
  storageBucket: firebaseStorageBucket(env, config.projectId),
})

export function readFirebaseSettings(env: Env): FirebaseSettings {
  const useEmulators = usesFirebaseEmulators(env)
  if (useEmulators) {
    const projectId = env.VITE_FIREBASE_PROJECT_ID ?? DEMO_PROJECT_ID
    return {
      config: withStorageBucket(env, {
        apiKey: env.VITE_FIREBASE_API_KEY ?? 'demo-api-key',
        projectId,
        appId: env.VITE_FIREBASE_APP_ID ?? 'demo-app-id',
        authDomain: `${projectId}.firebaseapp.com`,
      }),
      recaptchaSiteKey: env.VITE_RECAPTCHA_SITE_KEY,
      useEmulators,
    }
  }

  // デプロイ用のビルド（npm run build:deploy）では、ビルド前に同じ判定で確かめている（scripts/verify-deploy-env.ts）
  const missing = missingFirebaseEnv(env)
  const [apiKey, projectId, appId, recaptchaSiteKey] = REQUIRED_FIREBASE_ENV.map((name) => env[name])
  if (missing.length > 0 || !apiKey || !projectId || !appId || !recaptchaSiteKey) {
    throw new Error(`Firebase の設定がありません: ${missing.join(', ')}`)
  }
  return {
    config: withStorageBucket(env, {
      apiKey,
      projectId,
      appId,
      authDomain: `${projectId}.firebaseapp.com`,
    }),
    recaptchaSiteKey,
    useEmulators,
  }
}

export type LoadedFirebaseApp = { app: FirebaseApp; settings: FirebaseSettings }

let appPromise: Promise<LoadedFirebaseApp> | undefined

async function createFirebaseApp(): Promise<LoadedFirebaseApp> {
  const settings = readFirebaseSettings(import.meta.env)
  const appSdk = await import('firebase/app')
  // 既に作ったアプリを使い回す
  // （同じ名前のアプリを 2 回作ると duplicate-app で失敗し、以後ずっと使えなくなるため）
  const [existingApp] = appSdk.getApps()
  const app = existingApp ?? appSdk.initializeApp(settings.config)
  return { app, settings }
}

// Firebase のアプリを 1 度だけ用意する（フォームと管理画面で共通）。読み込みに失敗した場合は次の呼び出しでやり直す
export function loadFirebaseApp(): Promise<LoadedFirebaseApp> {
  appPromise ??= createFirebaseApp().catch((error: unknown) => {
    appPromise = undefined
    throw error
  })
  return appPromise
}

export type InquiryCallable = (payload: InquiryPayload) => Promise<unknown>

let callablePromise: Promise<InquiryCallable> | undefined

async function createInquiryCallable(): Promise<InquiryCallable> {
  const [{ app, settings }, functionsSdk, appCheckSdk] = await Promise.all([
    loadFirebaseApp(),
    import('firebase/functions'),
    import('firebase/app-check'),
  ])

  if (settings.recaptchaSiteKey) {
    // Emulator で App Check を試す場合は、コンソールに出るデバッグトークンを登録して使う（docs/forms.md）
    if (settings.useEmulators) {
      Object.assign(globalThis, { FIREBASE_APPCHECK_DEBUG_TOKEN: true })
    }
    appCheckSdk.initializeAppCheck(app, {
      provider: new appCheckSdk.ReCaptchaV3Provider(settings.recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    })
  }

  const functions = functionsSdk.getFunctions(app, FUNCTIONS_REGION)
  if (settings.useEmulators) {
    functionsSdk.connectFunctionsEmulator(
      functions,
      FIREBASE_EMULATORS.host,
      FIREBASE_EMULATORS.ports.functions,
    )
  }
  const callable = functionsSdk.httpsCallable<InquiryPayload, unknown>(
    functions,
    SUBMIT_INQUIRY_FUNCTION,
  )
  return (payload) => callable(payload)
}

// 送信処理の呼び出し口を 1 度だけ用意する。読み込みに失敗した場合は次の呼び出しでやり直す
export function loadInquiryCallable(): Promise<InquiryCallable> {
  callablePromise ??= createInquiryCallable().catch((error: unknown) => {
    callablePromise = undefined
    throw error
  })
  return callablePromise
}
