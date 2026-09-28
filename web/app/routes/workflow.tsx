import { Picture } from '~/components/media/Picture'
import { FadeUp } from '~/components/motion/FadeUp'
import { HeadingReveal } from '~/components/motion/HeadingReveal'
import { Leaf } from '~/components/motion/Leaf'
import { ContactCta } from '~/components/page/ContactCta'
import { SectionHeader, UNDERLINE_CLASS } from '~/components/page/SectionHeader'
import { getPage } from '~/content/pages'
import { NETWORK_DESCRIPTION, PROCESS_STEPS } from '~/content/workflow'
import { buildMeta } from '~/lib/seo'

const page = getPage('workflow')

export const meta = () => buildMeta(page)

const LEAF_CLASS = '-z-5 opacity-50 max-lg:hidden'

export default function WorkflowPage() {
  return (
    <>
      <section className="relative isolate w-full overflow-hidden bg-white px-6 py-[clamp(48px,6vw,80px)]">
        <Leaf side="left" position="bottom" trigger="load" className={LEAF_CLASS} />
        <Leaf side="right" position="bottom" trigger="load" className={LEAF_CLASS} />

        <div className="mx-auto w-full max-w-[1200px] text-center">
          {/* 旧実装は h2 だったが、ページの主見出しにあたるため h1 にした */}
          <HeadingReveal
            as="h1"
            className={`mb-5 text-[clamp(1.75rem,4vw,2.6rem)] font-black tracking-[0.05em] text-wf-blue [word-break:auto-phrase] ${UNDERLINE_CLASS}`}
          >
            ウィルフロンティア 処理ネットワーク
          </HeadingReveal>
          <FadeUp
            as="p"
            className="mb-10 inline-block text-left text-[0.95rem] leading-[1.9] font-bold text-wf-blue md:mb-[60px]"
          >
            各県に産業廃棄物処理業者とのネットワークを保有しており、あらゆる産業廃棄物を収集・運搬、中間処理を行い、適正処理を行います。
            <br />
            委託契約書、マニフェスト伝票の作成・発行はもちろん、お見積りは無料ですので、お気軽にお問い合わせください。
          </FadeUp>

          <FadeUp>
            <div>
              {/* スマホでは図の文字が読めない大きさになるため、幅を保って横にスクロールさせる */}
              <div
                role="region"
                aria-label="処理ネットワークの図"
                tabIndex={0}
                className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wf-blue"
              >
                <img
                  src="/media/images/network.svg"
                  alt="ウィルフロンティア 処理ネットワークの図"
                  width={731}
                  height={259}
                  aria-describedby="network-description"
                  className="mx-auto block h-auto w-full max-w-[1000px] min-w-[720px]"
                />
              </div>
              <p aria-hidden="true" className="mt-2 text-xs text-wf-text-mid md:hidden">
                図は横にスクロールできます
              </p>
              {/* 長い説明は図の名前ではなく補足として読ませる（figcaption にすると figure の名前として読み上げが重なる） */}
              <p id="network-description" className="sr-only">
                {NETWORK_DESCRIPTION}
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      <section
        aria-labelledby="steps-heading"
        className="relative isolate w-full bg-wf-surface py-[clamp(64px,8vw,120px)]"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <SectionHeader
            id="steps-heading"
            eyebrow="WORKFLOW"
            lead="受入から最終リサイクルまで、現場で実際に起こっていること"
          >
            処理の5ステップ
          </SectionHeader>
          <ol aria-labelledby="steps-heading">
            {PROCESS_STEPS.map((step) => (
              <FadeUp
                as="li"
                key={step.number}
                className="mb-[clamp(48px,6vw,80px)] grid items-center gap-[clamp(24px,3vw,48px)] last:mb-0 md:grid-cols-[7fr_5fr]"
              >
                <div className="aspect-video overflow-hidden rounded-md">
                  <Picture
                    slug={step.photo}
                    alt=""
                    sizes="(min-width: 768px) 55vw, 100vw"
                    className="size-full object-cover"
                  />
                </div>
                <div>
                  {/* 旧実装のオレンジ色（text-[#d4874a]）は旧 CSS に含まれず、本文と同じ色で表示されていた */}
                  <p className="mb-3 text-[clamp(2rem,3.5vw,3.5rem)] leading-none font-black tracking-widest">
                    STEP {step.number}
                  </p>
                  <h3 className="mb-4 text-2xl font-black tracking-wider text-wf-navy md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="text-base leading-relaxed text-wf-text md:text-lg">
                    {step.description}
                  </p>
                </div>
              </FadeUp>
            ))}
          </ol>
        </div>
      </section>

      <ContactCta title="処理フローのご相談はこちら" />
    </>
  )
}
