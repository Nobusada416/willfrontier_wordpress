import type { CaseStudy } from '@wf/shared'
import { useCallback, useEffect, useState } from 'react'

// 公開中の施工事例の読み込み状態。
// プリレンダーした HTML とハイドレート直後は loading（スケルトン）で、ブラウザで読み込んでから中身を出す
export type CaseStudiesState =
  | { status: 'loading' }
  | { status: 'success'; caseStudies: CaseStudy[] }
  | { status: 'empty' }
  | { status: 'error' }

type Options = {
  // 取得する件数（トップは 4 件）。指定しなければすべて
  limit?: number
  // false の間は読み込まない（トップは画面に近づいてから読み込む）
  enabled?: boolean
}

export function useCaseStudies({ limit, enabled = true }: Options = {}) {
  const [state, setState] = useState<CaseStudiesState>({ status: 'loading' })
  // 再読み込みのたびに増やし、読み込みをやり直す
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    // 読み込み処理（検証の zod を含む）は、読み込みを始めるときに初めて読み込む（ページ表示時の JavaScript を増やさない）
    import('./caseStudies')
      .then(({ fetchPublishedCaseStudies }) =>
        fetchPublishedCaseStudies({ env: import.meta.env, limit, signal: controller.signal }),
      )
      .then(
        (caseStudies) => {
          if (controller.signal.aborted) return
          setState(
            caseStudies.length > 0 ? { status: 'success', caseStudies } : { status: 'empty' },
          )
        },
        () => {
          if (controller.signal.aborted) return
          setState({ status: 'error' })
        },
      )
    return () => controller.abort()
  }, [enabled, limit, attempt])

  const reload = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((count) => count + 1)
  }, [])

  return { state, reload }
}
