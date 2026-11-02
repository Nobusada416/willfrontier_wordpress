import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { FadeUp } from '~/components/motion/FadeUp'
import { MoreLink } from '~/components/ui/MoreLink'
import { CaseStudiesStatus, SKELETON_CLASS } from '~/features/caseStudies/CaseStudiesStatus'
import { formatCaseStudyDate } from '~/features/caseStudies/format'
import { useCaseStudies } from '~/lib/useCaseStudies'
import { HomeSection } from './HomeSection'

// トップに出す件数（公開中の新しい順）
const LIMIT = 4
// 画面に近づいたら読み込み始める距離（components/media/Video.tsx と同じ）
const PRELOAD_MARGIN = '200px'

const ROW_CLASS = 'border-b-[1.5px] border-wf-border'

// 読み込み中に出す 4 行分の形（行の高さは読み込み後とそろえる）
function SummarySkeleton() {
  return (
    <ul className="border-t-[1.5px] border-wf-border">
      {Array.from({ length: LIMIT }, (_, index) => (
        <li key={index} className={`${ROW_CLASS} flex items-center gap-x-4 py-5 max-sm:flex-wrap`}>
          <span className="flex h-7 w-[140px] shrink-0 items-center max-sm:w-full">
            <span className={`block h-5 w-28 ${SKELETON_CLASS}`} />
          </span>
          <span className="flex h-7 flex-1 items-center">
            <span className={`block h-5 w-3/5 ${SKELETON_CLASS}`} />
          </span>
        </li>
      ))}
    </ul>
  )
}

export function CaseStudy() {
  const containerRef = useRef<HTMLDivElement>(null)
  // 一覧が画面に近づいたか（近づいたら読み込む。ページ表示時の通信を増やさない）
  const [near, setNear] = useState(false)
  const { state, reload } = useCaseStudies({ limit: LIMIT, enabled: near })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    // 対応ブラウザ（Baseline）はすべて IntersectionObserver を備えている
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: PRELOAD_MARGIN },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <HomeSection id="case-study" title="CASE STUDY" leaves="a">
      <FadeUp className="mx-auto max-w-2xl">
        <CaseStudiesStatus
          ref={containerRef}
          state={state}
          onReload={reload}
          skeleton={<SummarySkeleton />}
        >
          {(caseStudies) => (
            <ul className="border-t-[1.5px] border-wf-border">
              {caseStudies.map((item) => (
                // 旧実装は各行のリンク先が "#" のままだったため、事例一覧へ移動させる
                <li key={item.id} className={ROW_CLASS}>
                  <Link
                    to="/casestudy/"
                    className="flex items-center gap-x-4 py-5 text-lg font-bold tracking-wider transition-colors hover:bg-[#f0f7fa] max-sm:flex-wrap"
                  >
                    {/* スマホでは日付を 1 行目に置き、社名と矢印を 2 行目に並べる */}
                    <span className="w-[140px] shrink-0 font-en text-wf-blue max-sm:w-full">
                      {formatCaseStudyDate(item.date)}
                    </span>
                    <span className="flex-1 text-wf-ink">{`${item.company}\u3000${item.tag}`}</span>
                    <span aria-hidden="true" className="text-2xl text-wf-blue">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CaseStudiesStatus>
      </FadeUp>

      <FadeUp className="mt-10 text-center">
        <MoreLink to="/casestudy/" context="CASE STUDY">
          もっと見る
        </MoreLink>
      </FadeUp>
    </HomeSection>
  )
}
