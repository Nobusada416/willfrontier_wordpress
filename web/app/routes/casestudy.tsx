import type { CaseStudy } from '@wf/shared'
import { MosaicHero } from '~/components/media/MosaicHero'
import { Picture } from '~/components/media/Picture'
import { FadeUp } from '~/components/motion/FadeUp'
import { ContactCta } from '~/components/page/ContactCta'
import { PhotoHero } from '~/components/page/PhotoHero'
import { SectionHeader } from '~/components/page/SectionHeader'
import { CASE_HERO_PHOTOS } from '~/content/cases'
import { getPage } from '~/content/pages'
import { CaseStudiesStatus, SKELETON_CLASS } from '~/features/caseStudies/CaseStudiesStatus'
import { caseNumber, casePhotoAlt } from '~/features/caseStudies/format'
import { buildMeta } from '~/lib/seo'
import { useCaseStudies } from '~/lib/useCaseStudies'

const page = getPage('casestudy')

export const meta = () => buildMeta(page)

const TILE_CLASS = 'overflow-hidden rounded-md'
const PHOTO_CLASS = 'size-full object-cover'

// 事例の写真（最大 4 枚。左に大きく 1 枚目、右上に 2 枚目、右下に 3・4 枚目を並べる）
// 枚数が少ないときは空いた場所を残りの写真で埋める（1 枚なら全幅、2 枚なら右を縦いっぱい、3 枚なら右下を 1 枚）
// sizes は本文の幅（最大 1152px から左右の余白を除いた幅）に対する列の割合から見積もる
const CELLS = {
  full: { className: 'col-span-12 row-span-2', sizes: '(min-width: 1152px) 1056px, 90vw' },
  main: { className: 'col-span-7 row-span-2', sizes: '(min-width: 1152px) 610px, 55vw' },
  sideTall: { className: 'col-span-5 row-span-2', sizes: '(min-width: 1152px) 430px, 38vw' },
  side: { className: 'col-span-5', sizes: '(min-width: 1152px) 430px, 38vw' },
  quarter: { className: '', sizes: '(min-width: 1152px) 215px, 19vw' },
} as const

function CasePhotos({ study }: { study: CaseStudy }) {
  const count = study.photos.length
  const cell = (index: number, { className, sizes }: (typeof CELLS)[keyof typeof CELLS]) => {
    const photo = study.photos[index]
    if (!photo) return null
    return (
      <div key={photo.path} className={`${className} ${TILE_CLASS}`}>
        <Picture
          photo={photo}
          alt={casePhotoAlt(study, photo, index)}
          sizes={sizes}
          className={PHOTO_CLASS}
        />
      </div>
    )
  }
  return (
    <div className="grid auto-rows-[clamp(100px,14vw,180px)] grid-cols-12 gap-2">
      {cell(0, count === 1 ? CELLS.full : CELLS.main)}
      {cell(1, count === 2 ? CELLS.sideTall : CELLS.side)}
      {count === 3 && cell(2, CELLS.side)}
      {count >= 4 && (
        <div className="col-span-5 grid grid-cols-2 gap-2">
          {cell(2, CELLS.quarter)}
          {cell(3, CELLS.quarter)}
        </div>
      )}
    </div>
  )
}

// 読み込み中に出す、事例 1 件分の形（写真 4 枚の枠と文字の行）
function CaseSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid auto-rows-[clamp(100px,14vw,180px)] grid-cols-12 gap-2">
        <div className={`col-span-7 row-span-2 ${SKELETON_CLASS}`} />
        <div className={`col-span-5 ${SKELETON_CLASS}`} />
        <div className="col-span-5 grid grid-cols-2 gap-2">
          <div className={SKELETON_CLASS} />
          <div className={SKELETON_CLASS} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className={`h-[clamp(2rem,3.5vw,3.5rem)] w-48 ${SKELETON_CLASS}`} />
        <div className={`h-8 w-3/4 ${SKELETON_CLASS}`} />
        <div className={`h-4 w-1/3 ${SKELETON_CLASS}`} />
        <div className={`h-5 w-full ${SKELETON_CLASS}`} />
        <div className={`h-5 w-2/3 ${SKELETON_CLASS}`} />
      </div>
    </div>
  )
}

// 旧テンプレートは 2 件目の本文を md:order-first で写真の前に出す想定だったが、
// そのクラスは旧 CSS に含まれず、全件「写真の下に本文」で表示されていたためそれに合わせる
export default function CaseStudyPage() {
  // 施工事例は管理画面で公開したものをブラウザで読み込む（プリレンダーの HTML はスケルトン）
  const { state, reload } = useCaseStudies()
  return (
    <>
      <PhotoHero
        background={<MosaicHero slugs={CASE_HERO_PHOTOS} columns={3} priority />}
        title="CASE STUDY"
        subtitle="実績紹介 ─ 現場が語る、私たちの仕事"
      />

      <section
        aria-labelledby="projects-heading"
        className="relative isolate w-full bg-white py-[clamp(64px,8vw,120px)]"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <SectionHeader id="projects-heading" eyebrow="PROJECTS">
            主要施工事例
          </SectionHeader>
          <CaseStudiesStatus state={state} onReload={reload} skeleton={<CaseSkeleton />}>
            {(caseStudies) => (
              <ul
                aria-labelledby="projects-heading"
                className="flex flex-col gap-[clamp(56px,7vw,96px)]"
              >
                {caseStudies.map((study, index) => (
                  <FadeUp as="li" key={study.id}>
                    <article className="flex flex-col gap-8">
                      <CasePhotos study={study} />
                      <div>
                        {/* 旧実装のオレンジ色（text-[#d4874a]）は旧 CSS に含まれず、本文と同じ色で表示されていた */}
                        <p className="mb-3 text-[clamp(2rem,3.5vw,3.5rem)] leading-none font-black tracking-widest">
                          CASE {caseNumber(index)}
                        </p>
                        <h3 className="mb-3 text-2xl font-black tracking-wider text-wf-navy [word-break:auto-phrase] md:text-3xl">
                          {study.title}
                        </h3>
                        <p className="mb-5 text-xs font-bold tracking-wider text-gray-500">
                          {study.category}
                        </p>
                        {/* 本文は管理画面で入力したプレーンテキスト。改行をそのまま表示する */}
                        <p className="text-base leading-relaxed whitespace-pre-line text-wf-text md:text-lg">
                          {study.description}
                        </p>
                      </div>
                    </article>
                  </FadeUp>
                ))}
              </ul>
            )}
          </CaseStudiesStatus>
        </div>
      </section>

      <ContactCta title="あなたの現場、ご相談ください。" />
    </>
  )
}
