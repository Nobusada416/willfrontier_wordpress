import type { FormType } from '@wf/shared'
import { defineString } from 'firebase-functions/params'

// 通知先メールアドレス（フォーム種別ごと）。コードには書かず、デプロイ時の環境ごとに設定する。
// ローカル（Emulator）は functions/.env.local、本番は functions/.env.<プロジェクト ID> などで設定する（docs/forms.md の「ローカル開発」参照）。
// 複数の宛先はカンマ区切り
const MAIL_TO_PARAMS = {
  contact: defineString('CONTACT_MAIL_TO', {
    description: 'お問い合わせ（/contact/）の通知先メールアドレス',
  }),
  safety: defineString('SAFETY_MAIL_TO', {
    description: '安全ページ（/safety/）の問い合わせの通知先メールアドレス',
  }),
  recruit: defineString('RECRUIT_MAIL_TO', {
    description: '採用応募（/recruit/）の通知先メールアドレス',
  }),
} satisfies Record<FormType, unknown>

export const mailTo = (formType: FormType) => MAIL_TO_PARAMS[formType].value()

// App Check（reCAPTCHA v3）を強制するか。
// Functions Emulator は App Check トークンを検証しない（署名を確かめずに読むだけ）ため、強制しても意味がなく、
// demo- プロジェクトではトークンの取得もできない。Emulator では強制せず、本番では常に強制する
export const shouldEnforceAppCheck = (env: Readonly<Record<string, string | undefined>>) =>
  env.FUNCTIONS_EMULATOR !== 'true'
