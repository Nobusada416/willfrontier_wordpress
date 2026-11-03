import { isStorageId } from '@wf/shared'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { getAdminPage } from '~/content/pages'
import { useAdminApi, type AdminCaseStudy } from './api'
import { CaseStudyEditor } from './CaseStudyEditor'
import { ErrorNotice, LINK_CLASS } from './ui'

type LoadState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'failed' }
  | { status: 'loaded'; caseStudy: AdminCaseStudy }

function BackLink() {
  return (
    <Link to={getAdminPage('admin').path} className={`self-start text-[15px] ${LINK_CLASS}`}>
      一覧に戻る
    </Link>
  )
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex max-w-[880px] flex-col gap-4 px-4 py-10 sm:px-6">
      <h1 className="text-[26px] font-bold text-wf-navy">{title}</h1>
      {children}
      <BackLink />
    </main>
  )
}

function EditLoader({ id }: { id: string }) {
  const api = useAdminApi()
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    api.getCaseStudy(id).then(
      (caseStudy) => {
        if (active) setState(caseStudy ? { status: 'loaded', caseStudy } : { status: 'notFound' })
      },
      (error: unknown) => {
        console.error('施工事例を読み込めませんでした', error)
        if (active) setState({ status: 'failed' })
      },
    )
    return () => {
      active = false
    }
  }, [api, id])

  switch (state.status) {
    case 'loading':
      return (
        <Message title="施工事例の編集">
          <p className="text-wf-text-mid">読み込み中…</p>
        </Message>
      )
    case 'notFound':
      return <NotFound />
    case 'failed':
      return (
        <Message title="施工事例の編集">
          <ErrorNotice>
            施工事例を読み込めませんでした。通信状態を確かめて、ページを再読み込みしてください。
          </ErrorNotice>
        </Message>
      )
    case 'loaded':
      return <CaseStudyEditor caseId={id} initial={state.caseStudy} />
  }
}

function NotFound() {
  return (
    <Message title="施工事例が見つかりません">
      <p>削除されたか、URL が正しくない可能性があります。一覧から選び直してください。</p>
    </Message>
  )
}

// /admin/case-studies/edit/?id=... （静的に書き出すため、ID はクエリで受け取る）
export function CaseStudyEditScreen() {
  // useSearchParams は公開ページと共有する react-router のチャンクを大きくするため、location から読む
  const id = new URLSearchParams(useLocation().search).get('id') ?? ''
  if (!isStorageId(id)) return <NotFound />
  // ID が変わったら読み込み直す
  return <EditLoader key={id} id={id} />
}

// /admin/case-studies/new/ 。写真のアップロード先に使うため、事例の ID を先に決める
export function CaseStudyNewScreen() {
  const api = useAdminApi()
  const [id] = useState(() => api.newCaseStudyId())
  return <CaseStudyEditor caseId={id} initial={null} />
}
