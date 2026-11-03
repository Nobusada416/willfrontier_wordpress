import type { CaseStudy } from '@wf/shared'
import { type ReactNode, type Ref, useRef } from 'react'
import type { CaseStudiesState } from '~/lib/useCaseStudies'

// 施工事例の一覧（/casestudy/ とトップの CASE STUDY）で共通の、読み込みの状態ごとの表示

export const CASE_STUDIES_MESSAGES = {
  loading: '施工事例を読み込んでいます',
  empty: '施工事例は準備中です。お問い合わせからお気軽にご相談ください。',
  error: '施工事例を読み込めませんでした。時間をおいて再度お試しください。',
  reload: '再読み込み',
} as const

// スケルトンの灰色の面（動きを減らす設定では点滅させない）
export const SKELETON_CLASS = 'animate-pulse rounded-md bg-wf-border/50 motion-reduce:animate-none'

type CaseStudiesStatusProps = {
  state: CaseStudiesState
  onReload: () => void
  // 読み込み中に出すスケルトン（読み上げない）
  skeleton: ReactNode
  // 1 件以上あるときの一覧
  children: (caseStudies: CaseStudy[]) => ReactNode
  // 外枠（トップは画面に近づいたかの監視に使う）
  ref?: Ref<HTMLDivElement>
  className?: string
}

export function CaseStudiesStatus({
  state,
  onReload,
  skeleton,
  children,
  ref,
  className,
}: CaseStudiesStatusProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const loading = state.status === 'loading'
  const message =
    state.status === 'empty' || state.status === 'error' ? CASE_STUDIES_MESSAGES[state.status] : ''

  // 押したボタンは読み込み中の表示で消えるため、フォーカスを一覧の枠へ移してから読み込み直す
  const reload = () => {
    containerRef.current?.focus()
    onReload()
  }

  return (
    <div
      ref={(element) => {
        containerRef.current = element
        if (typeof ref === 'function') return ref(element)
        if (ref) ref.current = element
      }}
      data-case-studies
      aria-busy={loading}
      tabIndex={-1}
      className={`outline-none ${className ?? ''}`}
    >
      {/* 読み込み中・0 件・失敗の案内。プリレンダーの時点から置き、内容が変わったら読み上げる */}
      <div role="status">
        {loading && <span className="sr-only">{CASE_STUDIES_MESSAGES.loading}</span>}
        {message && (
          <p className="text-center text-base leading-relaxed font-bold text-wf-text md:text-lg">
            {message}
          </p>
        )}
      </div>
      {state.status === 'error' && (
        <p className="mt-6 text-center">
          <button
            type="button"
            onClick={reload}
            className="inline-flex items-center rounded-full border-2 border-wf-blue bg-white px-8 py-3 font-bold tracking-wider text-wf-blue transition-colors hover:bg-wf-blue hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wf-blue"
          >
            {CASE_STUDIES_MESSAGES.reload}
          </button>
        </p>
      )}
      {loading && (
        <div data-skeleton aria-hidden="true">
          {skeleton}
        </div>
      )}
      {state.status === 'success' && children(state.caseStudies)}
    </div>
  )
}
