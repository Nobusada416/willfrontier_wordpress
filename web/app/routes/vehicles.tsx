import { CrossfadeHero } from '~/components/media/CrossfadeHero'
import { Picture } from '~/components/media/Picture'
import { Video } from '~/components/media/Video'
import { FadeUp } from '~/components/motion/FadeUp'
import { ContactCta } from '~/components/page/ContactCta'
import { PhotoHero } from '~/components/page/PhotoHero'
import { PhotoMasonry } from '~/components/page/PhotoMasonry'
import { SectionHeader } from '~/components/page/SectionHeader'
import { getPage } from '~/content/pages'
import {
  VEHICLE_GALLERY,
  VEHICLE_HERO_PHOTOS,
  VEHICLE_LINEUP,
  VEHICLE_MOTION_VIDEO,
} from '~/content/vehicles'
import { buildMeta } from '~/lib/seo'

const page = getPage('vehicles')

export const meta = () => buildMeta(page)

export default function VehiclesPage() {
  return (
    <>
      <PhotoHero
        background={<CrossfadeHero slugs={VEHICLE_HERO_PHOTOS} priority />}
        title="VEHICLES"
        subtitle="車両ラインナップ ─ 現場を支える12種類の頼れる相棒"
      />

      <section
        aria-labelledby="lineup-heading"
        className="relative isolate w-full bg-white py-[clamp(64px,8vw,120px)]"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <SectionHeader id="lineup-heading" eyebrow="LINEUP">
            主要車両
          </SectionHeader>
          <ul className="flex flex-col gap-8">
            {VEHICLE_LINEUP.map((vehicle) => (
              <FadeUp as="li" key={vehicle.name}>
                <article className="grid overflow-hidden rounded-lg bg-wf-surface md:grid-cols-12">
                  <div className="aspect-video overflow-hidden md:col-span-7">
                    <Picture
                      slug={vehicle.photo}
                      alt=""
                      sizes="(min-width: 768px) 55vw, 100vw"
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-[clamp(24px,3vw,40px)] md:col-span-5">
                    <p className="mb-2 text-xs font-bold text-wf-blue">{vehicle.spec}</p>
                    <h3 className="mb-3 text-2xl font-black tracking-wider text-wf-navy md:text-3xl">
                      {vehicle.name}
                    </h3>
                    <p className="text-sm leading-relaxed text-wf-text md:text-base">
                      {vehicle.description}
                    </p>
                  </div>
                </article>
              </FadeUp>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="motion-heading"
        className="relative isolate h-[clamp(320px,52vh,580px)] w-full overflow-hidden bg-black"
      >
        {/* 暗い幕の代わりに動画そのものを暗くする（幕を重ねると動画の一時停止ボタンが隠れるため） */}
        <div className="absolute inset-0">
          <Video
            slug={VEHICLE_MOTION_VIDEO}
            poster={VEHICLE_MOTION_VIDEO}
            className="size-full"
            videoClassName="size-full object-cover brightness-45"
          />
        </div>
        {/* 文字の枠が動画の一時停止ボタンを覆うため、クリックは下に通す */}
        <div className="pointer-events-none relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
          <SectionHeader
            id="motion-heading"
            eyebrow="IN MOTION"
            tone="white"
            underline
            className="mb-4"
          >
            現場を動かす、その姿。
          </SectionHeader>
        </div>
      </section>

      <section
        aria-labelledby="vehicle-gallery-heading"
        className="relative isolate w-full bg-wf-surface py-[clamp(64px,8vw,120px)]"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <SectionHeader
            id="vehicle-gallery-heading"
            eyebrow="VEHICLE GALLERY"
            size="md"
            className="mb-12"
          >
            車両ギャラリー
          </SectionHeader>
          <FadeUp>
            <PhotoMasonry
              label="車両ギャラリーの写真"
              slugs={VEHICLE_GALLERY}
              className="columns-2 md:columns-3 lg:columns-4"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
          </FadeUp>
        </div>
      </section>

      <ContactCta title="車両配車のご相談はこちら" />
    </>
  )
}
