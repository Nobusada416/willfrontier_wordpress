import type { ReactNode } from 'react'
import { Picture } from '~/components/media/Picture'
import { Video } from '~/components/media/Video'
import { FadeUp } from '~/components/motion/FadeUp'
import { HeadingReveal } from '~/components/motion/HeadingReveal'
import { Leaf } from '~/components/motion/Leaf'
import { PhotoMasonry } from '~/components/page/PhotoMasonry'
import { SectionHeader } from '~/components/page/SectionHeader'
import { getPage } from '~/content/pages'
import { SafetyForm } from '~/features/forms/SafetyForm'
import {
  INQUIRY_STEPS,
  type InquiryStepIcon,
  SAFETY_FAQS,
  SAFETY_GALLERY,
  SAFETY_PRACTICES,
  SAFETY_TRAINING_VIDEO,
} from '~/content/safety'
import { buildMeta } from '~/lib/seo'

const page = getPage('safety')

export const meta = () => buildMeta(page)

const LEAF_CLASS = '-z-5 opacity-50 max-lg:hidden'

// お問い合わせ後の流れ・よくあるご質問の小見出し（左右に線を引く）
function LinedHeading({
  id,
  lineClassName,
  className,
  children,
}: {
  id: string
  lineClassName: string
  className: string
  children: ReactNode
}) {
  return (
    <h3
      id={id}
      className={`flex items-center text-lg font-black tracking-[0.15em] md:text-xl ${className}`}
    >
      <span aria-hidden="true" className={`h-0.5 shrink-0 ${lineClassName}`} />
      <span className="mx-4">{children}</span>
      <span aria-hidden="true" className={`h-0.5 shrink-0 ${lineClassName}`} />
    </h3>
  )
}

// STEP の横のアイコン（旧実装と同じ Material Icons の形・握手の画像）
function StepIcon({ icon }: { icon: InquiryStepIcon }) {
  if (icon === 'handshake') {
    return (
      <img
        src="/media/images/handshake.png"
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
        className="size-6 object-contain"
      />
    )
  }
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="fill-wf-navy"
    >
      {icon === 'phone' ? (
        <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z" />
      ) : (
        <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      )}
    </svg>
  )
}

// 旧実装はセクション1・2を画面の高さに固定し、JS の transform: scale() で中身を縮めて収めていた。
// 縮小をやめて高さは中身に合わせ、スマホでは写真と文・STEP を縦に並べる（旧サイトのスマホ表示は縮小で文字が読めなかった）
export default function SafetyPage() {
  return (
    <>
      <section className="relative isolate w-full overflow-hidden bg-white px-6 py-10 md:px-10 lg:py-[60px]">
        {/* 旧ページには h1 が無かった。見た目を変えずにページの主見出しを付ける */}
        <h1 className="sr-only">{page.title}</h1>
        <Leaf side="left" position="bottom" trigger="load" className={LEAF_CLASS} />
        <Leaf side="right" position="top" trigger="load" className={LEAF_CLASS} />
        <ul
          aria-label="安全の取り組み"
          className="mx-auto flex max-w-[1200px] flex-col gap-10 lg:gap-[60px] lg:pl-20"
        >
          {SAFETY_PRACTICES.map((practice) => (
            <FadeUp
              as="li"
              key={practice.photo}
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8"
            >
              <div className="aspect-[3/2] w-full shrink-0 overflow-hidden rounded-md sm:w-[300px]">
                <Picture
                  slug={practice.photo}
                  alt=""
                  sizes="(min-width: 640px) 300px, 100vw"
                  className="block size-full object-cover"
                />
              </div>
              <div className="text-wf-blue">
                <p className="mb-2 text-lg font-black">{practice.title}</p>
                <p className="text-base leading-[1.8] font-medium md:text-[17px]">
                  {practice.text}
                </p>
              </div>
            </FadeUp>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="training-heading"
        className="relative isolate h-[clamp(320px,52vh,560px)] w-full overflow-hidden bg-black"
      >
        {/* 旧テンプレートの暗い幕 bg-black/55 は旧 CSS に含まれず、白い文字が読みにくかった。
            幕の代わりに動画そのものを暗くする（幕を重ねると動画の一時停止ボタンが隠れるため） */}
        <div className="absolute inset-0">
          <Video
            slug={SAFETY_TRAINING_VIDEO}
            poster={SAFETY_TRAINING_VIDEO}
            className="size-full"
            videoClassName="size-full object-cover brightness-45"
          />
        </div>
        {/* 文字の枠が動画の一時停止ボタンを覆うため、クリックは下に通す */}
        <div className="pointer-events-none relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
          <SectionHeader
            id="training-heading"
            eyebrow="SAFETY TRAINING"
            tone="white"
            className="mb-4"
          >
            毎日の積み重ねが、現場を守る。
          </SectionHeader>
        </div>
      </section>

      <section
        aria-labelledby="equipment-heading"
        className="relative isolate w-full bg-wf-surface py-[clamp(64px,8vw,120px)]"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <SectionHeader id="equipment-heading" eyebrow="EQUIPMENT" size="md" className="mb-12">
            装備・点検ギャラリー
          </SectionHeader>
          <FadeUp>
            <PhotoMasonry
              label="装備・点検ギャラリーの写真"
              slugs={SAFETY_GALLERY}
              className="columns-2 md:columns-3 lg:columns-4"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            />
          </FadeUp>
        </div>
      </section>

      <section
        aria-labelledby="inquiry-heading"
        className="relative isolate w-full overflow-hidden bg-white px-6 py-[clamp(48px,6vw,80px)] md:px-10"
      >
        {/* 旧実装はページ表示時に飛び出していたが、画面外で終わってしまうためスクロールで飛び出させる */}
        <Leaf side="left" position="top" className={LEAF_CLASS} />
        <Leaf side="right" position="bottom" className={LEAF_CLASS} />
        {/* スマホでは「お問い合わせ」の途中で折り返さないよう、見出しを旧実装（text-3xl）より小さくする */}
        <div className="mx-auto max-w-[1200px]">
          <HeadingReveal
            as="h2"
            id="inquiry-heading"
            className="mb-8 text-center text-2xl font-black tracking-[0.04em] text-wf-navy [word-break:auto-phrase] sm:text-3xl md:mb-10 md:text-5xl"
          >
            はじめてのお問い合わせも安心です。
          </HeadingReveal>

          <div className="mb-10">
            <LinedHeading
              id="steps-heading"
              lineClassName="w-10 bg-wf-navy"
              className="mb-7 text-wf-navy"
            >
              お問い合わせ後の流れ
            </LinedHeading>
            <ol
              aria-labelledby="steps-heading"
              className="flex flex-col gap-16 md:grid md:grid-cols-3 md:items-center md:gap-20"
            >
              {INQUIRY_STEPS.map((step, index) => (
                <li key={step.label} className="relative text-center">
                  <p className="mb-3.5 inline-flex items-center gap-2.5 text-lg font-bold text-wf-navy">
                    <StepIcon icon={step.icon} />
                    {step.label}
                  </p>
                  <p className="mb-1.5 font-black text-wf-navy">
                    {step.title.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                  <p className="font-bold text-wf-blue">{step.note}</p>
                  {index < INQUIRY_STEPS.length - 1 && (
                    // 次の STEP への矢印。PC では右隣の余白（80px）に、スマホでは下に置く
                    <svg
                      data-step-arrow
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="64"
                      height="36"
                      viewBox="0 0 64 36"
                      className="absolute top-full left-1/2 mt-3 h-[22px] w-10 -translate-x-1/2 rotate-90 fill-wf-navy md:top-1/2 md:left-full md:mt-0 md:ml-10 md:h-9 md:w-16 md:-translate-y-1/2 md:rotate-0"
                    >
                      <polygon points="0,13 40,13 40,5 64,18 40,31 40,23 0,23" />
                    </svg>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div className="mb-10 max-w-[700px]">
            <LinedHeading
              id="faq-heading"
              lineClassName="w-10 bg-wf-blue md:w-[75px]"
              className="mb-6 text-wf-blue"
            >
              よくあるご質問
            </LinedHeading>
            <dl
              aria-labelledby="faq-heading"
              className="flex flex-col gap-4 font-bold text-wf-blue sm:grid sm:grid-cols-[1fr_30px_auto] sm:gap-x-4 sm:gap-y-3.5"
            >
              {SAFETY_FAQS.map((faq) => (
                <div key={faq.question} className="sm:col-span-3 sm:grid sm:grid-cols-subgrid">
                  <dt>{faq.question}</dt>
                  <dd className="sm:col-span-2 sm:grid sm:grid-cols-subgrid">
                    <span aria-hidden="true" className="mr-2 sm:mr-0 sm:text-center">
                      →
                    </span>
                    <span>{faq.answer}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <SafetyForm />
        </div>
      </section>
    </>
  )
}
