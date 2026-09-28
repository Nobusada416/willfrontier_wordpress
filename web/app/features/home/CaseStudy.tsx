import { Link } from 'react-router'
import { FadeUp } from '~/components/motion/FadeUp'
import { MoreLink } from '~/components/ui/MoreLink'
import { CASE_SUMMARIES } from '~/content/cases'
import { HomeSection } from './HomeSection'

export function CaseStudy() {
  return (
    <HomeSection id="case-study" title="CASE STUDY" leaves="a">
      <FadeUp className="mx-auto max-w-2xl">
        <ul className="border-t-[1.5px] border-wf-border">
          {CASE_SUMMARIES.map((item, index) => (
            // 旧実装は各行のリンク先が "#" のままだったため、事例一覧へ移動させる
            <li key={`${item.tag}-${index}`} className="border-b-[1.5px] border-wf-border">
              <Link
                to="/casestudy/"
                className="flex items-center gap-x-4 py-5 text-lg font-bold tracking-wider transition-colors hover:bg-[#f0f7fa] max-sm:flex-wrap"
              >
                {/* スマホでは日付を 1 行目に置き、社名と矢印を 2 行目に並べる */}
                <span className="w-[140px] shrink-0 font-en text-wf-blue max-sm:w-full">
                  {item.date}
                </span>
                <span className="flex-1 text-wf-ink">{`${item.company}\u3000${item.tag}`}</span>
                <span aria-hidden="true" className="text-2xl text-wf-blue">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </FadeUp>

      <FadeUp className="mt-10 text-center">
        <MoreLink to="/casestudy/" context="CASE STUDY">
          もっと見る
        </MoreLink>
      </FadeUp>
    </HomeSection>
  )
}
