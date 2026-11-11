// 施工事例の管理画面（/admin/）の管理者を付ける・外す（カスタムクレーム admin: true）。
// firestore.rules・storage.rules は request.auth.token.admin == true のユーザーにだけ書き込みを許す。
// 管理画面に新規登録の機能は無いため、アカウントはこのスクリプトで作る（docs/development.md）。
//
//   npm run admin:grant -- --emulator editor@example.com            Emulator のユーザーに付ける（いなければ作成）
//   npm run admin:grant -- --project <本番の ID> editor@example.com  本番のユーザーに付ける
//   npm run admin:grant -- --revoke editor@example.com               外す
//   npm run admin:grant -- --reset-password editor@example.com       パスワードを再発行する
//   npm run admin:grant -- --list                                    管理者の一覧
//
// 本番では Application Default Credentials（gcloud auth application-default login）の権限で実行する
import { initializeApp } from 'firebase-admin/app'
import { getAuth, type Auth, type UserRecord } from 'firebase-admin/auth'
import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

export type GrantAdminOptions = {
  email: string
  // true なら admin を外す（ユーザーは消さない）
  revoke?: boolean
  // true ならパスワードを再発行する
  resetPassword?: boolean
}

export type GrantAdminResult = {
  uid: string
  email: string
  // このスクリプトがユーザーを作成したか
  created: boolean
  // 実行後に admin が付いているか
  admin: boolean
  // 作成・再発行したときの初期パスワード（それ以外は返さない）
  password?: string
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 英数字・ハイフン・アンダースコアの 24 文字（144 ビット）
export const generatePassword = () => randomBytes(18).toString('base64url')

const findUser = async (auth: Auth, email: string) => {
  try {
    return await auth.getUserByEmail(email)
  } catch (error) {
    if ((error as { code?: string }).code === 'auth/user-not-found') return undefined
    throw error
  }
}

export const grantAdmin = async (
  auth: Auth,
  { email: rawEmail, revoke = false, resetPassword = false }: GrantAdminOptions,
): Promise<GrantAdminResult> => {
  const email = rawEmail.trim().toLowerCase()
  if (!EMAIL.test(email)) throw new Error(`メールアドレスが正しくありません: ${rawEmail}`)

  let user: UserRecord | undefined = await findUser(auth, email)
  let created = false
  let password: string | undefined

  if (!user) {
    if (revoke) throw new Error(`${email} のユーザーはいません`)
    password = generatePassword()
    // 開発側が作るアカウントのため、メールアドレスは確認済みとする
    user = await auth.createUser({ email, password, emailVerified: true })
    created = true
  } else if (resetPassword) {
    password = generatePassword()
    await auth.updateUser(user.uid, { password })
  }

  // ほかのカスタムクレームは残す
  const claims: Record<string, unknown> = { ...user.customClaims }
  if (revoke) delete claims.admin
  else claims.admin = true
  await auth.setCustomUserClaims(user.uid, Object.keys(claims).length > 0 ? claims : null)

  // 外したときは、ログイン中の管理画面が ID トークンを更新できないようにする
  // （発行済みの ID トークンは最長 1 時間有効なため、すぐに止めるには管理画面の再読み込みが必要）
  if (revoke) await auth.revokeRefreshTokens(user.uid)

  return { uid: user.uid, email, created, admin: !revoke, ...(password ? { password } : {}) }
}

// admin が付いているユーザー（メールアドレス順）
export const listAdmins = async (auth: Auth) => {
  const admins: UserRecord[] = []
  let pageToken: string | undefined
  do {
    const page = await auth.listUsers(1000, pageToken)
    admins.push(...page.users.filter((user) => user.customClaims?.admin === true))
    pageToken = page.pageToken
  } while (pageToken)
  return admins.sort((a, b) => (a.email ?? '').localeCompare(b.email ?? ''))
}

export type TargetOptions = {
  // --project（省略時は環境変数・.firebaserc の default）
  project?: string
  // --emulator（firebase.json の Auth Emulator のポートにつなぐ）
  emulator?: boolean
  env: Record<string, string | undefined>
  // .firebaserc の中身
  firebaserc: string
  firebaseJsonAuthPort: number
}

export type Target = { projectId: string; emulatorHost: string | undefined }

// 接続先（プロジェクトと Emulator）を決める
export const resolveTarget = ({
  project,
  emulator = false,
  env,
  firebaserc,
  firebaseJsonAuthPort,
}: TargetOptions): Target => {
  const defaultProject = (JSON.parse(firebaserc) as { projects?: { default?: string } }).projects
    ?.default
  const projectId = project ?? env.GOOGLE_CLOUD_PROJECT ?? env.GCLOUD_PROJECT ?? defaultProject
  if (!projectId) throw new Error('--project でプロジェクト ID を指定してください')

  const emulatorHost = emulator
    ? `127.0.0.1:${firebaseJsonAuthPort}`
    : env.FIREBASE_AUTH_EMULATOR_HOST || undefined

  // demo- のプロジェクトは Emulator 専用（本番の Firebase には存在しない）
  if (!emulatorHost && projectId.startsWith('demo-')) {
    throw new Error(
      `${projectId} は Emulator 専用のプロジェクトです。Emulator を起動して --emulator を付けるか、--project で本番のプロジェクトを指定してください`,
    )
  }
  return { projectId, emulatorHost }
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const USAGE = `使い方:
  npm run admin:grant -- [--emulator | --project <ID>] [--revoke | --reset-password] <メールアドレス>
  npm run admin:grant -- [--emulator | --project <ID>] --list`

const main = async () => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      project: { type: 'string' },
      emulator: { type: 'boolean', default: false },
      revoke: { type: 'boolean', default: false },
      'reset-password': { type: 'boolean', default: false },
      list: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  })
  const email = positionals[0]
  if (values.help || (!values.list && (!email || positionals.length > 1))) {
    console.log(USAGE)
    process.exitCode = values.help ? 0 : 1
    return
  }
  if (values.revoke && values['reset-password']) {
    throw new Error('--revoke と --reset-password は同時に指定できません')
  }

  const firebaseJson = JSON.parse(readFileSync(resolve(root, 'firebase.json'), 'utf8')) as {
    emulators: { auth: { port: number } }
  }
  const target = resolveTarget({
    project: values.project,
    emulator: values.emulator,
    env: process.env,
    firebaserc: readFileSync(resolve(root, '.firebaserc'), 'utf8'),
    firebaseJsonAuthPort: firebaseJson.emulators.auth.port,
  })
  // Admin SDK はこの環境変数があれば Emulator につなぐ（認証情報は不要）
  if (target.emulatorHost) process.env.FIREBASE_AUTH_EMULATOR_HOST = target.emulatorHost
  console.log(
    target.emulatorHost
      ? `接続先: Emulator（${target.emulatorHost}）・${target.projectId}`
      : `接続先: 本番・${target.projectId}`,
  )

  const auth = getAuth(initializeApp({ projectId: target.projectId }))

  if (values.list) {
    const admins = await listAdmins(auth)
    if (admins.length === 0) console.log('管理者はいません')
    for (const user of admins) console.log(`${user.email ?? '(メールアドレスなし)'}  ${user.uid}`)
    return
  }

  const result = await grantAdmin(auth, {
    email: email ?? '',
    revoke: values.revoke,
    resetPassword: values['reset-password'],
  })
  if (result.created) console.log(`ユーザーを作成しました: ${result.email}（${result.uid}）`)
  console.log(
    result.admin
      ? `管理者にしました: ${result.email}`
      : `管理者から外しました: ${result.email}（ログイン中の管理画面は再読み込みで使えなくなります）`,
  )
  if (result.password) {
    console.log(`初期パスワード: ${result.password}`)
    console.log('このパスワードは再表示できません。本人に安全な方法で伝えてください')
  }
}

// npm run admin:grant で直接実行されたときだけ動かす（テストから読み込むときは動かさない）
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
