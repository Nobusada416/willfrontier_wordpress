import { deleteApp, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import type { Page } from '@playwright/test'

// 管理画面の E2E の準備（Emulator のデータの用意と後片付け）。
// ルートの npm run e2e:admin（firebase emulators:exec）が Emulator の接続先を環境変数で渡す

export const PROJECT_ID = 'demo-willfrontier'
export const ADMIN = { email: 'soumu@example.com', password: 'admin-password' }
export const STAFF = { email: 'staff@example.com', password: 'staff-password' }

export const emulatorHost = (name: string) => {
  const host = process.env[name]
  if (!host) {
    throw new Error(`Emulator の中で実行してください（ルートで npm run e2e:admin）: ${name}`)
  }
  return host
}

export const firestoreUrl = (path = '') =>
  `http://${emulatorHost('FIRESTORE_EMULATOR_HOST')}/v1/projects/${PROJECT_ID}/databases/(default)/documents${path}`

// Auth・Firestore のデータを空にし、管理者（admin クレーム付き）と一般のアカウントを作る
export async function resetEmulators() {
  const authHost = emulatorHost('FIREBASE_AUTH_EMULATOR_HOST')
  const firestoreHost = emulatorHost('FIRESTORE_EMULATOR_HOST')
  await fetch(`http://${authHost}/emulator/v1/projects/${PROJECT_ID}/accounts`, {
    method: 'DELETE',
  })
  await fetch(
    `http://${firestoreHost}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  )

  const app: App = initializeApp({ projectId: PROJECT_ID }, `admin-e2e-${Date.now()}`)
  try {
    const auth = getAuth(app)
    const admin = await auth.createUser(ADMIN)
    await auth.setCustomUserClaims(admin.uid, { admin: true })
    await auth.createUser(STAFF)
  } finally {
    await deleteApp(app)
  }
}

export async function signIn(page: Page, account: { email: string; password: string }) {
  await page.getByLabel('メールアドレス').fill(account.email)
  await page.getByLabel('パスワード').fill(account.password)
  await page.getByRole('button', { name: 'ログイン' }).click()
}

// 画面の確認用のスクリーンショット（環境変数 ADMIN_SCREENSHOT_DIR があるときだけ保存する）
export async function screenshot(page: Page, name: string) {
  const dir = process.env.ADMIN_SCREENSHOT_DIR
  if (!dir) return
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true })
}
