import type { InquiryPayload } from '@wf/shared'

// フォームの送信処理（Cloud Functions の submitInquiry）を呼ぶための Firebase の準備。
// Firebase の SDK は大きいため、フォームを操作し始めたときに初めて読み込む（ページ表示時には読み込まない）

type Env = Readonly<Record<string, string | undefined>>

export type FirebaseSettings = {
  config: { apiKey: string; projectId: string; appId: string; authDomain: string }
  // App Check（reCAPTCHA v3）のサイトキー。Emulator で動かす場合は無くてよい
  recaptchaSiteKey: string | undefined
  useEmulators: boolean
}

// Emulator 用の demo プロジェクト（.firebaserc と同じ）。demo- で始まるプロジェクトは実在のリソースに接続しない
const DEMO_PROJECT_ID = 'demo-willfrontier'
const FUNCTIONS_REGION = 'asia-northeast1'
const FUNCTIONS_EMULATOR = { host: '127.0.0.1', port: 5001 }

const REQUIRED_ENV = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_RECAPTCHA_SITE_KEY',
] as const

export function readFirebaseSettings(env: Env): FirebaseSettings {
  const useEmulators = env.VITE_USE_FIREBASE_EMULATORS === 'true'
  if (useEmulators) {
    const projectId = env.VITE_FIREBASE_PROJECT_ID ?? DEMO_PROJECT_ID
    return {
      config: {
        apiKey: env.VITE_FIREBASE_API_KEY ?? 'demo-api-key',
        projectId,
        appId: env.VITE_FIREBASE_APP_ID ?? 'demo-app-id',
        authDomain: `${projectId}.firebaseapp.com`,
      },
      recaptchaSiteKey: env.VITE_RECAPTCHA_SITE_KEY,
      useEmulators,
    }
  }

  const missing = REQUIRED_ENV.filter((name) => !env[name])
  const [apiKey, projectId, appId, recaptchaSiteKey] = REQUIRED_ENV.map((name) => env[name])
  if (missing.length > 0 || !apiKey || !projectId || !appId || !recaptchaSiteKey) {
    throw new Error(`Firebase の設定がありません: ${missing.join(', ')}`)
  }
  return {
    config: { apiKey, projectId, appId, authDomain: `${projectId}.firebaseapp.com` },
    recaptchaSiteKey,
    useEmulators,
  }
}

export type InquiryCallable = (payload: InquiryPayload) => Promise<unknown>

let callablePromise: Promise<InquiryCallable> | undefined

async function createInquiryCallable(): Promise<InquiryCallable> {
  const settings = readFirebaseSettings(import.meta.env)
  const [{ initializeApp }, functionsSdk, appCheckSdk] = await Promise.all([
    import('firebase/app'),
    import('firebase/functions'),
    import('firebase/app-check'),
  ])
  const app = initializeApp(settings.config)

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
      FUNCTIONS_EMULATOR.host,
      FUNCTIONS_EMULATOR.port,
    )
  }
  const callable = functionsSdk.httpsCallable<InquiryPayload, unknown>(functions, 'submitInquiry')
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
