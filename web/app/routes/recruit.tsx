import type { ReactNode } from 'react'
import { Picture } from '~/components/media/Picture'
import { Video } from '~/components/media/Video'
import { FadeUp } from '~/components/motion/FadeUp'
import { Leaf } from '~/components/motion/Leaf'
import { SectionHeader } from '~/components/page/SectionHeader'
import { getPage } from '~/content/pages'
import {
  RECRUIT_APPLY_STEPS,
  RECRUIT_DAY_FLOW,
  RECRUIT_JOBS,
  RECRUIT_VIDEOS,
  RECRUIT_VOICES,
  RECRUIT_WORKPLACE_PHOTOS,
} from '~/content/recruit'
import { buildMeta } from '~/lib/seo'

const page = getPage('recruit')

export const meta = () => buildMeta(page)

const LEAF_CLASS = '-z-5 opacity-50 max-lg:hidden'

// 【募集職種】などの見出し
const BLOCK_HEADING_CLASS = 'text-xl font-black whitespace-nowrap text-wf-navy lg:text-[26px]'

// 応募の流れの番号（読み上げは ol の順序に任せる）
const STEP_MARKERS = ['❶', '❷', '❸'] as const

// 区切りの破線
function DashedRule({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-0.5 bg-[repeating-linear-gradient(to_right,var(--color-wf-navy)_0_12px,transparent_12px_28px)] ${className}`}
    />
  )
}

// 流れの矢印。スマホでは縦に並べるため下向きにする
function FlowArrow() {
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 justify-center py-1 pl-0.5 lg:flex-1 lg:px-2 lg:py-0"
    >
      <svg width="48" height="20" viewBox="0 0 48 20" className="fill-wf-navy max-lg:hidden">
        <polygon points="0,7 34,7 34,2 48,10 34,18 34,13 0,13" />
      </svg>
      <svg width="12" height="24" viewBox="0 0 20 48" className="fill-wf-navy lg:hidden">
        <polygon points="7,0 7,34 2,34 10,48 18,34 13,34 13,0" />
      </svg>
    </span>
  )
}

// 横並びの流れ（1 日の流れ・応募の流れ）。旧実装は項目と矢印を space-between で並べていた。
// 矢印を各項目の li に含め、残りの幅を均等に分けて同じ間隔にする。スマホでは縦に並べる
function FlowList({ labelledBy, items }: { labelledBy: string; items: readonly ReactNode[] }) {
  return (
    <ol
      aria-labelledby={labelledBy}
      className="flex flex-col items-start text-base font-black text-wf-navy lg:flex-row lg:items-center lg:text-lg"
    >
      {items.map((item, index) => {
        const last = index === items.length - 1
        return (
          <li
            // 項目は文言が重複しうるため、順番をキーにする
            key={index}
            className={`flex flex-col items-start lg:flex-row lg:items-center ${last ? 'lg:flex-none' : 'lg:flex-auto'}`}
          >
            <span>{item}</span>
            {!last && <FlowArrow />}
          </li>
        )
      })}
    </ol>
  )
}

// 旧実装はセクションの高さを画面の高さに固定し、中身を JS の transform: scale() で画面に収めていた。
// 画面収めは廃止して高さを中身に合わせ、スマホでは横並びを縦並び・折り返しにした（旧サイトのスマホ表示は文字が 1 文字ずつ折り返して崩れていた）
function RecruitInfo() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-white px-6 pt-[30px] pb-16 sm:px-10">
      {/* 旧ページには h1 が無かったため、見た目を変えずにページ名を h1 として置く */}
      <h1 className="sr-only">{page.title}</h1>
      {/* 旧実装の葉は本文より手前（z-40）に重なっていたが、文字が読みにくくなるため本文の後ろに置く */}
      <Leaf side="left" position="bottom" trigger="load" className={LEAF_CLASS} />
      <Leaf side="right" position="bottom" trigger="load" className={LEAF_CLASS} />

      <div className="mx-auto max-w-[1200px]">
        {/* 募集職種 */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
          <h2 id="recruit-jobs-heading" className={`${BLOCK_HEADING_CLASS} lg:pt-10`}>
            【募集職種】
          </h2>
          <ul
            aria-labelledby="recruit-jobs-heading"
            className="grid flex-1 grid-cols-2 gap-x-1 gap-y-6 lg:flex lg:justify-around"
          >
            {RECRUIT_JOBS.map((job) => (
              <li
                key={job.title}
                className="flex flex-col items-center gap-1 text-center text-wf-navy"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-14 fill-current lg:size-[72px]"
                >
                  <path d={job.icon} />
                </svg>
                <h3 className="text-lg font-black lg:text-xl">【{job.title}】</h3>
                <p className="text-[15px] font-bold lg:text-[17px]">{job.salary}</p>
              </li>
            ))}
          </ul>
        </div>

        <DashedRule className="mb-10" />

        {/* 1 日の安全管理・業務の流れ */}
        <div className="mb-10 rounded-md bg-wf-notice px-5 py-6 lg:px-9 lg:py-7">
          <h2 id="recruit-day-heading" className={`mb-4 ${BLOCK_HEADING_CLASS}`}>
            1日の安全管理・業務の流れ
          </h2>
          <FlowList
            labelledBy="recruit-day-heading"
            items={RECRUIT_DAY_FLOW.map((step) => (
              <>
                <span aria-hidden="true">●</span>
                {/* 時刻と項目の間は旧実装と同じ全角スペース */}
                {`${step.time}\u3000${step.label}`}
              </>
            ))}
          />
        </div>

        {/* 従業員の声 */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
          <h2 id="recruit-voices-heading" className={`${BLOCK_HEADING_CLASS} lg:pt-8`}>
            【従業員の声】
          </h2>
          <ul
            aria-labelledby="recruit-voices-heading"
            className="flex flex-1 flex-col gap-8 lg:flex-row lg:gap-10"
          >
            {RECRUIT_VOICES.map((voice) => (
              <li key={voice.name} className="flex items-start gap-4 lg:gap-5">
                <div className="size-24 shrink-0 overflow-hidden rounded-full border-2 border-wf-border lg:size-[130px]">
                  {/* 名前を隣に書いているため、写真は装飾として読み上げない（旧実装は名前を alt にしていた） */}
                  <Picture
                    slug={voice.photo}
                    alt=""
                    sizes="130px"
                    className="block size-full object-cover"
                  />
                </div>
                <div className="font-bold text-wf-navy">
                  <p className="mb-1 text-base font-black lg:text-lg">{voice.name}</p>
                  <p className="mb-2 text-sm lg:text-base">{voice.role}</p>
                  <p className="text-sm leading-[1.7] lg:text-base">{voice.quote}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <DashedRule className="mb-7" />

        {/* 応募の流れ */}
        <div>
          <h2
            id="recruit-apply-heading"
            className="mb-4 flex items-center gap-3 text-[17px] font-black tracking-[.15em] text-wf-navy before:h-0.5 before:w-10 before:bg-wf-navy after:h-0.5 after:w-10 after:bg-wf-navy"
          >
            応募の流れ
          </h2>
          <FlowList
            labelledBy="recruit-apply-heading"
            items={RECRUIT_APPLY_STEPS.map((step, index) => (
              <>
                <span aria-hidden="true">{STEP_MARKERS[index]}</span>
                {step}
              </>
            ))}
          />
        </div>
      </div>
    </section>
  )
}

export default function RecruitPage() {
  return (
    <>
      <RecruitInfo />

      <section
        aria-labelledby="day-at-work-heading"
        className="relative isolate w-full bg-white py-[clamp(64px,8vw,120px)]"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <SectionHeader
            id="day-at-work-heading"
            eyebrow="A DAY AT WORK"
            size="md"
            className="mb-12"
          >
            仲間たちの、ある日。
          </SectionHeader>
          <FadeUp>
            <ul aria-label="仲間たちの動画" className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {RECRUIT_VIDEOS.map((slug, index) => (
                <li key={slug}>
                  {/* 1 ページに 4 本置くため、一時停止ボタンを区別できるよう番号付きの名前を付ける */}
                  <Video
                    slug={slug}
                    poster={slug}
                    label={`仲間たちの、ある日の動画 ${index + 1}`}
                    className="aspect-[9/16] overflow-hidden rounded-md bg-black"
                    videoClassName="block size-full object-cover"
                  />
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </section>

      <section
        aria-labelledby="workplace-heading"
        className="relative isolate w-full bg-wf-surface py-[clamp(64px,8vw,120px)]"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <SectionHeader id="workplace-heading" eyebrow="WORKPLACE" size="md" className="mb-12">
            職場環境
          </SectionHeader>
          <FadeUp>
            <ul
              aria-label="職場環境の写真"
              className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
            >
              {RECRUIT_WORKPLACE_PHOTOS.map((slug) => (
                <li key={slug} className="aspect-[4/5] overflow-hidden rounded-md">
                  <Picture
                    slug={slug}
                    alt=""
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="block size-full object-cover"
                  />
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </section>

      {/* 応募フォーム。旧実装は画面の高さに固定して scale() で収めていたが、高さは中身に合わせる */}
      <section className="relative isolate w-full overflow-hidden bg-white px-6 py-[30px] sm:px-10">
        {/* 旧実装はページ表示時に飛び出していたが、ページ下部で見えないうちに終わるためスクロールに合わせる */}
        <Leaf side="left" position="top" className={LEAF_CLASS} />
        <Leaf side="right" position="top" className={LEAF_CLASS} />
        <div className="mx-auto max-w-[1200px]">{/* P8: RecruitForm をここに置く */}</div>
      </section>
    </>
  )
}
