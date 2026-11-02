// ビルド時の環境変数（import.meta.env）の型。vite/client の ImportMetaEnv に追加する
// 設定の例と説明は web/.env.example
interface ImportMetaEnv {
  // 'true' のときだけ検索エンジンへの登録を許可する（lib/indexing.ts）
  readonly VITE_ALLOW_INDEXING?: string
  // フォームの送信（lib/firebase.ts）に使う Firebase の Web アプリ設定と App Check（reCAPTCHA v3）のサイトキー。
  // 本番向けのビルドでは必須で、デプロイ用のビルド（npm run build:deploy）は欠けていると失敗する（lib/firebaseEnv.ts）
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  readonly VITE_RECAPTCHA_SITE_KEY?: string
  // 'true' のときだけ Emulator に接続する。上の設定が無ければ demo プロジェクトで動かす
  readonly VITE_USE_FIREBASE_EMULATORS?: string
}
