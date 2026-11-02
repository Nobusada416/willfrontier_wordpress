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

// 一覧の行と日付の欄（読み込み中の形と共通にし、読み込みの前後で行の高さを変えない）
const ROW_BODY_CLASS =
  'flex items-center gap-x-4 py-5 text-lg font-bold tracking-wider max-sm:flex-wrap'
const DATE_CLASS = 'w-[140px] shrink-0 font-en text-wf-blue max-sm:w-full'
// 文字の行の中に置く灰色の帯（行の高さは文字と同じフォントの行の高さで決まる）
const BAR_CLASS = `inline-block h-5 align-middle ${SKELETON_CLASS}`

// 読み込み中に出す 4 行分の形
function SummarySkeleton() {
  return (
    <ul className="border-t-[1.5px] border-wf-border">
      {Array.from({ length: LIMIT }, (_, index) => (
        <li key={index} className={`${ROW_CLASS} ${ROW_BODY_CLASS}`}>
          <span className={DATE_CLASS}>
            <span className={`${BAR_CLASS} w-28`} />
          </span>
          <span className="flex-1">
            <span className={`${BAR_CLASS} w-3/5`} />
          </span>
          <span className="text-2xl">&nbsp;</span>
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
                    className={`${ROW_BODY_CLASS} transition-colors hover:bg-[#f0f7fa]`}
                  >
                    {/* スマホでは日付を 1 行目に置き、社名と矢印を 2 行目に並べる */}
                    <span className={DATE_CLASS}>{formatCaseStudyDate(item.date)}</span>
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
