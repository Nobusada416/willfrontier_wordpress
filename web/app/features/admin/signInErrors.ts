// 管理画面のログインのエラー。Firebase Auth のエラーコードを分類し、画面に出す文言と場所を決める
// （firebaseAdminApi.ts から読み込むため、エイリアス（~/）を使わない）

export type SignInError =
  | 'invalid-email'
  | 'invalid-credentials'
  | 'too-many-requests'
  | 'user-disabled'
  | 'network'
  // 管理者（カスタムクレーム admin）でないアカウント
  | 'forbidden'
  | 'unknown'

const CODES: Readonly<Record<string, SignInError>> = {
  // メールアドレスの列挙を防ぐ設定（既定）では、どちらの誤りも invalid-credential になる
  'auth/invalid-credential': 'invalid-credentials',
  'auth/invalid-login-credentials': 'invalid-credentials',
  'auth/wrong-password': 'invalid-credentials',
  'auth/user-not-found': 'invalid-credentials',
  'auth/invalid-email': 'invalid-email',
  'auth/too-many-requests': 'too-many-requests',
  'auth/user-disabled': 'user-disabled',
  'auth/network-request-failed': 'network',
}

export const signInErrorFromCode = (code: string | undefined): SignInError =>
  (code && CODES[code]) || 'unknown'

export type SignInErrorMessage = { field: 'email' | 'password' | 'form'; message: string }

export const FORBIDDEN_MESSAGE =
  'このアカウントには管理画面を使う権限がありません。制作担当にご連絡ください。'

const MESSAGES: Readonly<Record<SignInError, SignInErrorMessage>> = {
  // どちらが違うかは明かさない（アカウントの有無を推測させないため）
  'invalid-credentials': { field: 'password', message: 'メールアドレスかパスワードが違います。' },
  'invalid-email': { field: 'email', message: 'メールアドレスの形式が正しくありません。' },
  'too-many-requests': {
    field: 'form',
    message:
      'ログインの失敗が続いたため、一時的にログインできません。しばらく待ってからお試しください。',
  },
  'user-disabled': {
    field: 'form',
    message: 'このアカウントは使えなくなっています。制作担当にご連絡ください。',
  },
  network: {
    field: 'form',
    message: '通信できませんでした。インターネットにつながっているか確かめてください。',
  },
  forbidden: { field: 'form', message: FORBIDDEN_MESSAGE },
  unknown: {
    field: 'form',
    message: 'ログインできませんでした。時間をおいてもう一度お試しください。',
  },
}

export const signInErrorMessage = (error: SignInError): SignInErrorMessage => MESSAGES[error]
