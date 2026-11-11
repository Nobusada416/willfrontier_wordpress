// Firebase（フォームの送信・施工事例の管理画面）に必要なビルド時の環境変数の判定
// lib/firebase.ts と、デプロイ用のビルドの前に確かめる scripts/verify-deploy-env.ts の両方で使う
// postbuild などのスクリプト（Node で直接実行）からも読み込むため、import.meta.env やエイリアス（~/）を使わない
type Env = Readonly<Record<string, string | undefined>>

export const REQUIRED_FIREBASE_ENV = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_RECAPTCHA_SITE_KEY',
] as const

// 未設定・空文字・空白だけの変数名を、必須の順に返す
export const missingFirebaseEnv = (env: Env): string[] =>
  REQUIRED_FIREBASE_ENV.filter((name) => !env[name]?.trim())

// Emulator への接続は文字列 'true' のときだけ（indexing.ts と同じく厳密に比較する）
export const usesFirebaseEmulators = (env: Env): boolean =>
  env.VITE_USE_FIREBASE_EMULATORS === 'true'

// Cloud Storage のバケット（施工事例の写真。管理画面で使う）。任意で、無ければプロジェクトの既定のバケット
// （2024 年 10 月以降に作ったプロジェクトは <projectId>.firebasestorage.app。
// それより前のプロジェクトは <projectId>.appspot.com のため、VITE_FIREBASE_STORAGE_BUCKET で指定する）
export const firebaseStorageBucket = (env: Env, projectId: string): string =>
  env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || `${projectId}.firebasestorage.app`
