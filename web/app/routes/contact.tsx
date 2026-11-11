import { CrossfadeHero } from '~/components/media/CrossfadeHero'
import { FadeUp } from '~/components/motion/FadeUp'
import { PhotoHero } from '~/components/page/PhotoHero'
import { CONTACT_FAQ, CONTACT_HERO_PHOTOS, CONTACT_STEPS } from '~/content/contact'
import { getPage } from '~/content/pages'
import { ContactForm } from '~/features/forms/ContactForm'
import { buildMeta } from '~/lib/seo'

const page = getPage('contact')

export const meta = () => buildMeta(page)

// 両側に線を引いた小見出し（旧 .section-label）
// 旧実装の文字色 #9ca3af は白背景でコントラスト比 2.5:1 と読みにくいため、gray-500 にした
const SECTION_LABEL_CLASS =
  'mb-5 flex items-center gap-2 text-xs font-black tracking-[0.15em] text-gray-500 before:h-px before:flex-1 before:bg-gray-200 after:h-px after:flex-1 after:bg-gray-200'

export default function ContactPage() {
  return (
    <>
      <PhotoHero
        background={<CrossfadeHero slugs={CONTACT_HERO_PHOTOS} priority />}
        title="CONTACT"
        subtitle="お問い合わせ ─ まずはお気軽にご相談ください"
        height="compact"
        underline
        leaves={false}
      />

      <section
        aria-labelledby="contact-assurance-heading"
        className="relative isolate w-full bg-white px-6 pt-16 pb-20 md:px-10 md:pt-[100px]"
      >
        <div className="mb-9 rounded-md border border-wf-notice-border bg-wf-notice px-6 py-5">
          <h2
            id="contact-assurance-heading"
            className="text-xl font-black tracking-[0.04em] text-gray-800 [word-break:auto-phrase]"
          >
            はじめてのお問い合わせも安心です
          </h2>
        </div>

        <h3 id="contact-steps-heading" className={SECTION_LABEL_CLASS}>
          お問い合わせ後の流れ
        </h3>
        {/* 旧実装はスマホでも 3 列のまま文字が細かく折り返していたため、スマホでは縦に並べる */}
        <FadeUp className="mb-10">
          <ol
            aria-labelledby="contact-steps-heading"
            className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-0"
          >
            {CONTACT_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-1 flex-col items-center text-center sm:flex-row sm:items-start"
              >
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="mb-4 text-lg text-wf-blue max-sm:rotate-90 sm:mb-0 sm:w-9 sm:shrink-0 sm:pt-[18px]"
                  >
                    →
                  </span>
                )}
                <div className="flex-1">
                  <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-bold text-wf-navy">
                    <span aria-hidden="true">{step.icon}</span>
                    <span className="text-[13px] font-black">STEP {index + 1}</span>
                  </p>
                  <p className="mb-1 text-[15px] font-black text-gray-800">{step.title}</p>
                  <p className="text-[11px] font-bold text-wf-blue">{step.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </FadeUp>

        <h3 id="contact-faq-heading" className={SECTION_LABEL_CLASS}>
          よくあるご質問
        </h3>
        <dl className="mx-auto mb-10 flex w-full max-w-[420px] flex-col gap-2 text-[13px] text-wf-ink">
          {CONTACT_FAQ.map((faq) => (
            <div key={faq.question} className="grid grid-cols-[1fr_auto] gap-2">
              {/* 「Q.」と矢印は読み上げない（content の / 以降が読み上げ用の代替テキスト） */}
              <dt className="before:mr-2 before:font-bold before:text-gray-500 before:content-['Q.'_/_'']">
                {faq.question}
              </dt>
              <dd className="font-bold text-wf-navy before:mr-2 before:content-['→'_/_'']">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>

        <ContactForm />
      </section>
    </>
  )
}
