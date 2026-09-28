import { MosaicHero } from '~/components/media/MosaicHero'
import { Picture } from '~/components/media/Picture'
import { FadeUp } from '~/components/motion/FadeUp'
import { ContactCta } from '~/components/page/ContactCta'
import { PhotoHero } from '~/components/page/PhotoHero'
import { SectionHeader } from '~/components/page/SectionHeader'
import { CASE_HERO_PHOTOS, CASE_STUDIES, type CaseStudy } from '~/content/cases'
import { getPage } from '~/content/pages'
import { buildMeta } from '~/lib/seo'

const page = getPage('casestudy')

export const meta = () => buildMeta(page)

const TILE_CLASS = 'overflow-hidden rounded-md'
const PHOTO_CLASS = 'size-full object-cover'

// 事例の写真 4 枚（左に大きく 1 枚、右上に 1 枚、右下に 2 枚）
// sizes は本文の幅（最大 1152px から左右の余白を除いた幅）に対する列の割合から見積もる
function CasePhotos({ photos }: { photos: CaseStudy['photos'] }) {
  const [main, second, third, fourth] = photos
  return (
    <div className="grid auto-rows-[clamp(100px,14vw,180px)] grid-cols-12 gap-2">
      <div className={`col-span-7 row-span-2 ${TILE_CLASS}`}>
        <Picture
          slug={main}
          alt=""
          sizes="(min-width: 1152px) 610px, 55vw"
          className={PHOTO_CLASS}
        />
      </div>
      <div className={`col-span-5 ${TILE_CLASS}`}>
        <Picture
          slug={second}
          alt=""
          sizes="(min-width: 1152px) 430px, 38vw"
          className={PHOTO_CLASS}
        />
      </div>
      <div className="col-span-5 grid grid-cols-2 gap-2">
        {[third, fourth].map((slug, index) => (
          <div key={`${slug}-${index}`} className={TILE_CLASS}>
            <Picture
              slug={slug}
              alt=""
              sizes="(min-width: 1152px) 215px, 19vw"
              className={PHOTO_CLASS}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// 旧テンプレートは 2 件目の本文を md:order-first で写真の前に出す想定だったが、
// そのクラスは旧 CSS に含まれず、全件「写真の下に本文」で表示されていたためそれに合わせる
export default function CaseStudyPage() {
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
          <ul
            aria-labelledby="projects-heading"
            className="flex flex-col gap-[clamp(56px,7vw,96px)]"
          >
            {CASE_STUDIES.map((study) => (
              <FadeUp as="li" key={study.number}>
                <article className="flex flex-col gap-8">
                  <CasePhotos photos={study.photos} />
                  <div>
                    {/* 旧実装のオレンジ色（text-[#d4874a]）は旧 CSS に含まれず、本文と同じ色で表示されていた */}
                    <p className="mb-3 text-[clamp(2rem,3.5vw,3.5rem)] leading-none font-black tracking-widest">
                      CASE {study.number}
                    </p>
                    <h3 className="mb-3 text-2xl font-black tracking-wider text-wf-navy [word-break:auto-phrase] md:text-3xl">
                      {study.title}
                    </h3>
                    <p className="mb-5 text-xs font-bold tracking-wider text-gray-500">
                      {study.meta}
                    </p>
                    <p className="text-base leading-relaxed text-wf-text md:text-lg">
                      {study.description}
                    </p>
                  </div>
                </article>
              </FadeUp>
            ))}
          </ul>
        </div>
      </section>

      <ContactCta title="あなたの現場、ご相談ください。" />
    </>
  )
}
