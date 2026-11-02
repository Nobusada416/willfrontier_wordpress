import { deleteApp as deleteClientApp, initializeApp as initializeClientApp } from 'firebase/app'
import {
  connectAuthEmulator,
  getAuth as getClientAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { deleteApp, initializeApp, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { grantAdmin, listAdmins, resolveTarget } from '../../tools/grant-admin'

// 管理者の付与スクリプト（tools/grant-admin.ts）を Auth Emulator で確かめる。
// 付けたカスタムクレームが、ログインした管理画面の ID トークンに入ることまで見る
// （firestore.rules・storage.rules は request.auth.token.admin == true で判定する）

const PROJECT_ID = 'demo-willfrontier'
const EMAIL = 'editor@example.com'

const authHost = () => {
  const host = process.env.FIREBASE_AUTH_EMULATOR_HOST
  if (!host) throw new Error('Emulator 上で実行してください（npm run test:integration）')
  return host
}

let adminApp: App
let auth: Auth
const clientApp = initializeClientApp({ projectId: PROJECT_ID, apiKey: 'demo-api-key' }, 'grant')
const clientAuth = getClientAuth(clientApp)

beforeAll(() => {
  connectAuthEmulator(clientAuth, `http://${authHost()}`, { disableWarnings: true })
  // Admin SDK は FIREBASE_AUTH_EMULATOR_HOST（emulators:exec が設定する）の Emulator につなぐ
  adminApp = initializeApp({ projectId: PROJECT_ID }, 'grant-admin-test')
  auth = getAuth(adminApp)
})

afterAll(async () => {
  await deleteApp(adminApp)
  await deleteClientApp(clientApp)
})

beforeEach(async () => {
  await signOut(clientAuth)
  // Auth Emulator のユーザーをすべて消す
  const response = await fetch(`http://${authHost()}/emulator/v1/projects/${PROJECT_ID}/accounts`, {
    method: 'DELETE',
  })
  expect(response.ok).toBe(true)
})

// ログインして ID トークンのカスタムクレームを返す
const claimsAfterSignIn = async (email: string, password: string) => {
  const { user } = await signInWithEmailAndPassword(clientAuth, email, password)
  return (await user.getIdTokenResult(true)).claims
}

describe('grantAdmin', () => {
  it('ユーザーがいなければ作成して admin を付け、初期パスワードを返す', async () => {
    const result = await grantAdmin(auth, { email: EMAIL })
    expect(result).toMatchObject({ email: EMAIL, created: true, admin: true })
    expect(result.password).toMatch(/^[A-Za-z0-9_-]{24}$/)

    const claims = await claimsAfterSignIn(EMAIL, result.password ?? '')
    expect(claims.admin).toBe(true)
  })

  it('メールアドレスは前後の空白を除き小文字にそろえる', async () => {
    const result = await grantAdmin(auth, { email: '  Editor@Example.COM ' })
    expect(result.email).toBe(EMAIL)
  })

  it('既存のユーザーには admin だけを付け、パスワードもほかのクレームも変えない', async () => {
    const user = await auth.createUser({ email: EMAIL, password: 'existing-password' })
    await auth.setCustomUserClaims(user.uid, { team: 'web' })

    const result = await grantAdmin(auth, { email: EMAIL })
    expect(result).toMatchObject({ uid: user.uid, created: false, admin: true })
    expect(result.password).toBeUndefined()

    const claims = await claimsAfterSignIn(EMAIL, 'existing-password')
    expect(claims.admin).toBe(true)
    expect(claims.team).toBe('web')
  })

  it('2 回実行しても同じ結果になる', async () => {
    await grantAdmin(auth, { email: EMAIL })
    const second = await grantAdmin(auth, { email: EMAIL })
    expect(second).toMatchObject({ created: false, admin: true })
  })

  it('パスワードを再発行できる（管理画面にパスワード再設定の機能は無いため）', async () => {
    await grantAdmin(auth, { email: EMAIL })
    const result = await grantAdmin(auth, { email: EMAIL, resetPassword: true })
    expect(result.password).toMatch(/^[A-Za-z0-9_-]{24}$/)
    const claims = await claimsAfterSignIn(EMAIL, result.password ?? '')
    expect(claims.admin).toBe(true)
  })

  it('revoke で admin を外し、ほかのクレームは残す', async () => {
    const user = await auth.createUser({ email: EMAIL, password: 'existing-password' })
    await auth.setCustomUserClaims(user.uid, { team: 'web', admin: true })

    const result = await grantAdmin(auth, { email: EMAIL, revoke: true })
    expect(result).toMatchObject({ uid: user.uid, created: false, admin: false })

    const claims = await claimsAfterSignIn(EMAIL, 'existing-password')
    expect(claims.admin).toBeUndefined()
    expect(claims.team).toBe('web')
  })

  it('revoke で、ほかにクレームが無ければクレームを空にする', async () => {
    await grantAdmin(auth, { email: EMAIL })
    await grantAdmin(auth, { email: EMAIL, revoke: true })
    const user = await auth.getUserByEmail(EMAIL)
    expect(user.customClaims ?? {}).toEqual({})
  })

  it('revoke でユーザーがいなければ作らずにエラー', async () => {
    await expect(grantAdmin(auth, { email: EMAIL, revoke: true })).rejects.toThrow(EMAIL)
    await expect(auth.getUserByEmail(EMAIL)).rejects.toThrow()
  })

  it('メールアドレスの形が正しくなければエラー', async () => {
    await expect(grantAdmin(auth, { email: 'not-an-email' })).rejects.toThrow(
      'メールアドレスが正しくありません',
    )
  })
})

describe('listAdmins', () => {
  it('admin のユーザーだけをメールアドレス順に返す', async () => {
    await grantAdmin(auth, { email: 'b@example.com' })
    await grantAdmin(auth, { email: 'a@example.com' })
    await auth.createUser({ email: 'user@example.com', password: 'password' })
    const admins = await listAdmins(auth)
    expect(admins.map((user) => user.email)).toEqual(['a@example.com', 'b@example.com'])
  })
})

describe('resolveTarget（接続先の決め方）', () => {
  const firebaserc = JSON.stringify({ projects: { default: 'demo-willfrontier' } })

  it('--emulator で firebase.json の Auth Emulator のポートにつなぐ', () => {
    expect(
      resolveTarget({ emulator: true, env: {}, firebaserc, firebaseJsonAuthPort: 9099 }),
    ).toEqual({ projectId: 'demo-willfrontier', emulatorHost: '127.0.0.1:9099' })
  })

  it('FIREBASE_AUTH_EMULATOR_HOST があればその Emulator につなぐ', () => {
    expect(
      resolveTarget({
        env: { FIREBASE_AUTH_EMULATOR_HOST: 'localhost:1234' },
        firebaserc,
        firebaseJsonAuthPort: 9099,
      }),
    ).toEqual({ projectId: 'demo-willfrontier', emulatorHost: 'localhost:1234' })
  })

  it('--project で本番のプロジェクトを指定できる（Emulator は使わない）', () => {
    expect(
      resolveTarget({
        project: 'willfrontier-prod',
        env: {},
        firebaserc,
        firebaseJsonAuthPort: 9099,
      }),
    ).toEqual({ projectId: 'willfrontier-prod', emulatorHost: undefined })
  })

  it('demo- のプロジェクトを Emulator なしで使おうとするとエラー', () => {
    expect(() => resolveTarget({ env: {}, firebaserc, firebaseJsonAuthPort: 9099 })).toThrow(
      '--emulator',
    )
  })
})
