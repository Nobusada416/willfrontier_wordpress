import { Picture } from '~/components/media/Picture'
import { FadeUp } from '~/components/motion/FadeUp'
import { Leaf } from '~/components/motion/Leaf'
import { ContactCta } from '~/components/page/ContactCta'
import { SectionHeader } from '~/components/page/SectionHeader'
import { getPage } from '~/content/pages'
import { SERVICE_BUSINESSES, SERVICE_CENTER, SERVICE_FEATURES } from '~/content/service'
import { buildMeta } from '~/lib/seo'

const page = getPage('service')

export const meta = () => buildMeta(page)

// PC の図での位置・幅・重なり順（位置と幅は図全体の幅・高さに対する %）。SERVICE_FEATURES と同じ順に並べる
// 旧実装は px で配置した枠を拡大縮小していた。旧サイトで実際に描画された各画像の位置を
// 画像全体を囲む範囲（幅 1141 : 高さ 793）に対する割合で測り、枠ごと拡大縮小できるようにした
const DIAGRAM_POSITIONS = [
  {
    badge: 'lg:left-[44.05%] lg:top-[14.56%]',
    detail: 'lg:z-3 lg:left-[49.29%] lg:top-0 lg:w-[21.43%]',
  },
  {
    badge: 'lg:left-[63.1%] lg:top-[35.12%]',
    detail: 'lg:z-5 lg:left-[76.19%] lg:top-[11.13%] lg:w-[23.81%]',
  },
  {
    badge: 'lg:left-[55.36%] lg:top-[65.95%]',
    detail: 'lg:z-5 lg:left-[67.86%] lg:top-[74.51%] lg:w-[23.21%]',
  },
  {
    badge: 'lg:left-[33.33%] lg:top-[65.95%]',
    detail: 'lg:z-5 lg:left-[13.1%] lg:top-[81.37%] lg:w-[23.21%]',
  },
  {
    badge: 'lg:left-[25%] lg:top-[35.12%]',
    detail: 'lg:z-5 lg:left-0 lg:top-[17.13%] lg:w-[27.98%]',
  },
] as const

// 旧実装は図を JS の transform: scale() で画面に収めていた。
// PC では図の幅を「画面の高さに収まる幅」と「画面幅」の小さい方にして CSS だけで収める
// （40px はセクションの上下の余白。旧実装の画面収めと同じ値）。
// スマホでは図のままだと吹き出しの文字が読めない大きさになるため、特長と吹き出しを 1 行ずつ縦に並べる
function ServiceDiagram() {
  return (
    <div className="relative mx-auto w-full lg:aspect-[1141/793] lg:w-[min(100%,calc((100svh-var(--spacing-header)-40px)*1141/793))]">
      <img
        src={SERVICE_CENTER.src}
        alt=""
        width={SERVICE_CENTER.width}
        height={SERVICE_CENTER.height}
        className="absolute top-[26.38%] left-[33.33%] z-1 w-[38.1%] max-lg:hidden"
      />
      <ul aria-label="サービスの特長" className="flex flex-col gap-6">
        {SERVICE_FEATURES.map((feature, index) => {
          const position = DIAGRAM_POSITIONS[index]
          return (
            // PC では画像が absolute になり、li は大きさを持たない。位置は図の枠（relative）を基準に決まる
            <li key={feature.badge.src} className="flex items-center gap-3">
              <img
                src={feature.badge.src}
                alt={feature.badge.alt}
                width={feature.badge.width}
                height={feature.badge.height}
                className={`w-28 shrink-0 lg:absolute lg:z-4 lg:w-[15.48%] ${position?.badge ?? ''}`}
              />
              <img
                src={feature.detail.src}
                alt={feature.detail.alt}
                width={feature.detail.width}
                height={feature.detail.height}
                className={`h-auto min-w-0 flex-1 max-lg:max-w-[240px] lg:absolute ${position?.detail ?? ''}`}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function ServicePage() {
  return (
    <>
      <section className="relative isolate flex w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-10 lg:h-[calc(100svh-var(--spacing-header))] lg:min-h-[560px] lg:py-5">
        <h1 className="sr-only">{page.title}</h1>
        <img
          src="/media/images/bg_blue.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 size-full object-cover"
        />
        <Leaf
          side="left"
          position="bottom"
          trigger="load"
          className="-z-5 opacity-30 max-lg:hidden"
        />
        <Leaf
          side="right"
          position="bottom"
          trigger="load"
          className="-z-5 opacity-30 max-lg:hidden"
        />
        <ServiceDiagram />
      </section>

      <section
        aria-labelledby="business-heading"
        className="relative isolate w-full bg-white py-[clamp(64px,8vw,120px)]"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <SectionHeader
            id="business-heading"
            eyebrow="OUR BUSINESS"
            underline
            lead="産業廃棄物の収集から再資源化まで、5つの軸で総合対応"
          >
            事業内容
          </SectionHeader>
          <FadeUp>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICE_BUSINESSES.map((business) => (
                <li key={business.name}>
                  <article className="h-full overflow-hidden rounded-lg bg-wf-surface transition-transform duration-200 hover:-translate-y-1">
                    <div className="aspect-[16/10] overflow-hidden">
                      <Picture
                        slug={business.photo}
                        alt=""
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="mb-3 text-xl font-black tracking-wider text-wf-navy md:text-2xl">
                        {business.name}
                      </h3>
                      <p className="text-sm leading-relaxed text-wf-text md:text-base">
                        {business.description}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </section>

      <ContactCta title="サービスのご相談はこちら" className="bg-wf-surface" />
    </>
  )
}
