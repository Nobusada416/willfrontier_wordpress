// デプロイ用のビルド（npm run build:deploy。firebase deploy の hosting の predeploy）の前に、
// フォームの送信に必要な Firebase の設定（VITE_FIREBASE_*・VITE_RECAPTCHA_SITE_KEY）がそろっているかを確かめる。
// 欠けたままビルドすると、ページは表示できてもフォームが送れないサイトがデプロイされてしまう
// （lib/firebase.ts は送信時にしか設定を確かめないため）。
//
// ビルドの「前」に環境変数を確かめる理由:
// - Vite はビルド時に loadEnv（環境変数と web/ の .env 系ファイル。環境変数が優先）で読んだ値を import.meta.env に埋め込む。
//   ここでも同じモード（production）・同じディレクトリで loadEnv するため、ビルドに入る値をそのまま確かめられる
//   （generate-seo-files.ts の VITE_ALLOW_INDEXING と同じ前提。ビルドのモードを変える場合はここも合わせる）
// - ビルド（プリレンダー）を待たずに、欠けている変数名を挙げてすぐ失敗できる
// - ビルド後にバンドルを調べる方式は、値を知らないと探せず（結局ここと同じ読み込みが要る）、
//   圧縮後のコードの形に依存して壊れやすい
//
// 通常の npm run build（CI の check・e2e・lighthouse）では実行しない。
// 設定が欠けていても（reCAPTCHA の登録前など）、ビルドと E2E は止めないため。
// Emulator 向けのビルド（VITE_USE_FIREBASE_EMULATORS=true）は demo プロジェクトで動くため確認しない
import { join } from 'node:path'
import { loadEnv } from 'vite'
import {
  firebaseStorageBucket,
  missingFirebaseEnv,
  usesFirebaseEmulators,
} from '../app/lib/firebaseEnv.ts'

const root = join(import.meta.dirname, '..')
const env = loadEnv('production', root, 'VITE_')

if (usesFirebaseEmulators(env)) {
  console.log(
    'VITE_USE_FIREBASE_EMULATORS=true のため、Firebase の設定の確認を省略しました（Emulator 向けのビルド）',
  )
} else {
  const missing = missingFirebaseEnv(env)
  if (missing.length > 0) {
    console.error('デプロイ用のビルドに必要な Firebase の設定がありません:')
    for (const name of missing) console.error(`  ${name}`)
    console.error(
      'ビルド時の環境変数か web/.env.production.local で渡してください（例は web/.env.example。docs/deployment.md）',
    )
    process.exit(1)
  }
  console.log('Firebase の設定を確認しました（VITE_FIREBASE_*・VITE_RECAPTCHA_SITE_KEY）')
  // 施工事例の写真のバケットは任意（無ければ既定の名前）。古いプロジェクト（appspot.com）で取り違えないよう表示する
  const bucket = firebaseStorageBucket(env, env.VITE_FIREBASE_PROJECT_ID?.trim() ?? '')
  console.log(
    `施工事例の写真の Storage バケット: ${bucket}${env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ? '' : '（既定。VITE_FIREBASE_STORAGE_BUCKET で変更できます）'}`,
  )
}
