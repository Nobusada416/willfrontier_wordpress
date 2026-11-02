import type { CaseStudyStatus } from '@wf/shared'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { adminEditPath, getAdminPage } from '~/content/pages'
import { useAdminApi, type AdminCaseStudy } from './api'
import { countByStatus, formatCaseStudyDate, sortCaseStudies } from './caseStudyList'
import {
  BUTTON_CLASS,
  CARD_CLASS,
  ErrorNotice,
  LINK_CLASS,
  Notice,
  readListNotice,
  StatusBadge,
} from './ui'

type LoadState =
  { status: 'loading' } | { status: 'failed' } | { status: 'loaded'; items: AdminCaseStudy[] }

type Message = { type: 'notice' | 'error'; text: string }

const toggleMessage = (title: string, status: CaseStudyStatus) =>
  status === 'published'
    ? `「${title}」を公開しました。サイトにすぐ反映されます。`
    : `「${title}」を非公開にしました。サイトには表示されなくなります。`

function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

// ② 施工事例の一覧（ログイン後の /admin/）
export function CaseStudyListScreen() {
  const api = useAdminApi()
  const location = useLocation()
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [message, setMessage] = useState<Message | null>(() => {
    const notice = readListNotice(location.state)
    return notice ? { type: 'notice', text: notice } : null
  })
  // 切り替え中の事例の ID（二重に押せないようにする）
  const [pending, setPending] = useState<string | null>(null)

  // 「もう一度読み込む」で増やして読み込み直す
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    api.listCaseStudies().then(
      (items) => {
        if (active) setState({ status: 'loaded', items: sortCaseStudies(items) })
      },
      (error: unknown) => {
        console.error('施工事例の一覧を読み込めませんでした', error)
        if (active) setState({ status: 'failed' })
      },
    )
    return () => {
      active = false
    }
  }, [api, attempt])

  const reload = () => {
    setState({ status: 'loading' })
    setAttempt((count) => count + 1)
  }

  const toggle = async (item: AdminCaseStudy) => {
    const status: CaseStudyStatus = item.status === 'published' ? 'draft' : 'published'
    setPending(item.id)
    setMessage(null)
    try {
      await api.setStatus(item.id, status)
      setState((current) =>
        current.status === 'loaded'
          ? {
              ...current,
              items: current.items.map((other) =>
                other.id === item.id ? { ...other, status } : other,
              ),
            }
          : current,
      )
      setMessage({ type: 'notice', text: toggleMessage(item.title, status) })
    } catch (error) {
      console.error('公開状態を切り替えられませんでした', error)
      setMessage({
        type: 'error',
        text: `「${item.title}」を切り替えられませんでした。時間をおいてもう一度お試しください。`,
      })
    } finally {
      setPending(null)
    }
  }

  const counts = state.status === 'loaded' ? countByStatus(state.items) : null

  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[26px] font-bold text-wf-navy">施工事例</h1>
          {counts && (
            <p className="text-sm text-wf-text-mid">
              公開中 {counts.published} 件・下書き {counts.draft}{' '}
              件。「公開中」の事例がサイトに表示されます。
            </p>
          )}
        </div>
        <Link
          to={getAdminPage('admin-new').path}
          className={`h-12 px-6 text-base ${BUTTON_CLASS.primary}`}
        >
          <PlusIcon />
          新規作成
        </Link>
      </div>

      {message &&
        (message.type === 'notice' ? (
          <Notice>{message.text}</Notice>
        ) : (
          <ErrorNotice>{message.text}</ErrorNotice>
        ))}

      {state.status === 'loading' && <p className="text-wf-text-mid">読み込み中…</p>}

      {state.status === 'failed' && (
        <div className="flex flex-col items-start gap-3">
          <ErrorNotice>
            一覧を読み込めませんでした。通信状態を確かめて、もう一度お試しください。
          </ErrorNotice>
          <button type="button" onClick={reload} className={`h-11 px-6 ${BUTTON_CLASS.secondary}`}>
            もう一度読み込む
          </button>
        </div>
      )}

      {state.status === 'loaded' && state.items.length === 0 && (
        <p className={`${CARD_CLASS} p-6`}>
          まだ施工事例がありません。「新規作成」から追加してください。
        </p>
      )}

      {state.status === 'loaded' && state.items.length > 0 && (
        // 狭い画面では表を横にスクロールする（キーボードでもスクロールできるよう tabIndex を付ける）。
        // 読み上げ用の文字（sr-only は position: absolute）が枠の外へはみ出さないよう relative にする
        <div
          role="region"
          aria-label="施工事例の一覧"
          tabIndex={0}
          className={`${CARD_CLASS} relative overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wf-blue`}
        >
          <table className="w-full min-w-[760px] border-collapse text-[15px]">
            <thead>
              <tr className="bg-wf-surface text-left text-wf-navy">
                <th scope="col" className="w-[88px] px-4 py-3.5">
                  写真
                </th>
                <th scope="col" className="px-4 py-3.5">
                  タイトル・社名
                </th>
                <th scope="col" className="w-[120px] px-4 py-3.5">
                  日付
                </th>
                <th scope="col" className="w-[110px] px-4 py-3.5">
                  状態
                </th>
                <th scope="col" className="w-[170px] px-4 py-3.5">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {state.items.map((item) => {
                const [mainPhoto] = item.photos
                const actionLabel = item.status === 'published' ? '非公開にする' : '公開する'
                return (
                  <tr key={item.id} className="border-t border-wf-border">
                    <td className="px-4 py-3">
                      {mainPhoto ? (
                        <img
                          src={mainPhoto.smallUrl}
                          alt=""
                          width={64}
                          height={48}
                          loading="lazy"
                          className="h-12 w-16 rounded-md bg-wf-border object-cover"
                        />
                      ) : (
                        <div className="h-12 w-16 rounded-md bg-wf-border" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Link
                          to={adminEditPath(item.id)}
                          className={`text-base font-bold ${LINK_CLASS}`}
                        >
                          {item.title}
                        </Link>
                        <span className="text-[13px] text-wf-text-mid">
                          {`${item.company}\u3000${item.tag}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-en font-medium">
                      {formatCaseStudyDate(item.date)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void toggle(item)}
                        disabled={pending !== null}
                        className={`h-10 px-3.5 text-sm ${BUTTON_CLASS.secondary}`}
                      >
                        <span className="sr-only">「{item.title}」を</span>
                        {actionLabel}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
