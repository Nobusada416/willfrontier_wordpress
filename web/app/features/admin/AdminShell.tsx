import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { getAdminPage } from '~/content/pages'
import { markMotionReady } from '~/lib/motion/headScript'
import { AdminApiContext, AdminUserContext, type AdminApi, type AdminUser } from './api'
import { LoginScreen } from './LoginScreen'
import { FORBIDDEN_MESSAGE } from './signInErrors'
import { AdminTitleLines, CenteredScreen, ErrorNotice } from './ui'

type AuthState =
  { status: 'loading' } | { status: 'signedOut' } | { status: 'admin'; user: AdminUser }

type AdminShellProps = {
  // Firebase（Auth・Firestore・Storage）の読み込み。画面の表示を待たせないよう、描画後に読み込む
  loadApi: () => Promise<AdminApi>
  children: ReactNode
}

const LIST_PATH = getAdminPage('admin').path

// 管理画面の共通の枠。ログイン状態を見て、ログイン画面か、ヘッダー付きの各画面を出す
// （管理者でないアカウントは「権限がありません」と出してログアウトさせる）
export function AdminShell({ loadApi, children }: AdminShellProps) {
  const [api, setApi] = useState<AdminApi | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' })
  const [notice, setNotice] = useState<string>()
  const { pathname } = useLocation()

  useEffect(() => {
    // E2E が hydrate の完了を待つ目印（公開ページでは SmoothScroll が付ける。lib/motion/headScript.ts）
    markMotionReady()
    let active = true
    loadApi().then(
      (loaded) => active && setApi(loaded),
      (error: unknown) => {
        console.error('管理画面の読み込みに失敗しました', error)
        if (active) setLoadFailed(true)
      },
    )
    return () => {
      active = false
    }
  }, [loadApi])

  useEffect(() => {
    if (!api) return
    return api.onAuthChange((event) => {
      if (event.type === 'admin') {
        setNotice(undefined)
        setAuth({ status: 'admin', user: event.user })
        return
      }
      // 権限なしでログアウトさせたことは、続くログアウトの通知では消さない
      if (event.type === 'forbidden') setNotice(FORBIDDEN_MESSAGE)
      setAuth({ status: 'signedOut' })
    })
  }, [api])

  if (loadFailed) {
    return (
      <CenteredScreen>
        <ErrorNotice>
          管理画面を読み込めませんでした。時間をおいてページを再読み込みしてください。
        </ErrorNotice>
      </CenteredScreen>
    )
  }

  if (!api || auth.status === 'loading') {
    return (
      <CenteredScreen>
        <p role="status" className="text-center text-wf-text-mid">
          読み込み中…
        </p>
      </CenteredScreen>
    )
  }

  if (auth.status === 'signedOut') {
    return (
      <AdminApiContext.Provider value={api}>
        <LoginScreen notice={notice} />
      </AdminApiContext.Provider>
    )
  }

  // 編集画面にはログアウトを置かない（未保存の内容を失わないため。ログアウトは一覧から）
  const showLogout = pathname === LIST_PATH || `${pathname}/` === LIST_PATH

  return (
    <AdminApiContext.Provider value={api}>
      <AdminUserContext.Provider value={auth.user}>
        <div className="min-h-screen bg-wf-bg text-wf-ink">
          <header className="bg-wf-navy text-white">
            <div className="mx-auto flex min-h-16 max-w-[1120px] flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2 sm:px-6">
              <p className="text-base leading-snug font-bold">
                <AdminTitleLines />
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="break-all">{auth.user.email}</span>
                {showLogout && (
                  <button
                    type="button"
                    onClick={() => void api.signOut()}
                    className="h-10 rounded-full border border-white px-4 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    ログアウト
                  </button>
                )}
              </div>
            </div>
          </header>
          {children}
        </div>
      </AdminUserContext.Provider>
    </AdminApiContext.Provider>
  )
}
