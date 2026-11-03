import { useState, type FormEvent } from 'react'
import { useAdminApi } from './api'
import { signInErrorMessage, type SignInErrorMessage } from './signInErrors'
import { BUTTON_CLASS, CARD_CLASS, CenteredScreen, ErrorNotice, Field, INPUT_CLASS } from './ui'

type FieldErrors = { email?: string; password?: string }

// ① ログイン（/admin/。ログインしていなければ、どの管理画面の URL でもこの画面を出す）
// 新規登録・パスワードの再設定は置かない（アカウントは制作担当が作る。docs/case-studies.md）
export function LoginScreen({ notice }: { notice?: string | undefined }) {
  const api = useAdminApi()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [result, setResult] = useState<SignInErrorMessage | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedEmail = email.trim()
    const errors: FieldErrors = {
      ...(trimmedEmail ? {} : { email: 'メールアドレスを入力してください' }),
      ...(password ? {} : { password: 'パスワードを入力してください' }),
    }
    setFieldErrors(errors)
    setResult(null)
    if (errors.email || errors.password) {
      const form = event.currentTarget
      form.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()
      return
    }
    setSubmitting(true)
    const signedIn = await api.signIn(trimmedEmail, password)
    setSubmitting(false)
    // 成功したら、ログイン状態の監視（AdminShell）が画面を切り替える
    if (!signedIn.ok) setResult(signInErrorMessage(signedIn.error))
  }

  const emailError = fieldErrors.email ?? (result?.field === 'email' ? result.message : undefined)
  const passwordError =
    fieldErrors.password ?? (result?.field === 'password' ? result.message : undefined)
  const formError = result?.field === 'form' ? result.message : notice

  return (
    <CenteredScreen>
      <form
        noValidate
        aria-label="ログイン"
        onSubmit={onSubmit}
        className={`${CARD_CLASS} flex flex-col gap-5 p-6 sm:p-8`}
      >
        {formError && <ErrorNotice>{formError}</ErrorNotice>}
        <Field label="メールアドレス" error={emailError}>
          {(props) => (
            <input
              {...props}
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={INPUT_CLASS}
            />
          )}
        </Field>
        <Field label="パスワード" error={passwordError}>
          {(props) => (
            <input
              {...props}
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={INPUT_CLASS}
            />
          )}
        </Field>
        <button
          type="submit"
          disabled={submitting}
          className={`h-[52px] px-7 text-[17px] ${BUTTON_CLASS.primary}`}
        >
          {submitting ? 'ログインしています…' : 'ログイン'}
        </button>
      </form>
      <p className="text-center text-[13px] text-wf-text-mid">
        アカウントの追加は制作担当にご連絡ください。
      </p>
    </CenteredScreen>
  )
}
