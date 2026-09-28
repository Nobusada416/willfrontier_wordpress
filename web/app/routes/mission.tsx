import { Fragment } from 'react'
import { CrossfadeHero } from '~/components/media/CrossfadeHero'
import { FadeUp } from '~/components/motion/FadeUp'
import { Leaf } from '~/components/motion/Leaf'
import { PhotoMasonry } from '~/components/page/PhotoMasonry'
import { SectionHeader } from '~/components/page/SectionHeader'
import {
  COMMUNITY_GALLERY,
  MISSION_EQUATION,
  MISSION_PHOTOS,
  MISSION_TERMS,
  operatorBefore,
} from '~/content/mission'
import { getPage } from '~/content/pages'
import { buildMeta } from '~/lib/seo'

const page = getPage('mission')

export const meta = () => buildMeta(page)

// PC では旧デザインの改行位置を保ち、スマホでは自然に折り返す
const PcBreak = () => <br className="max-lg:hidden" />

// 本文の小見出し（黄色の丸いラベル）
const LABEL_CLASS =
  'mb-1.5 inline-block rounded-full bg-[#ffe600] px-5 py-[5px] text-[13px] font-black text-[#1a1a1a]'

const BODY_CLASS = 'text-sm leading-[1.7] font-bold lg:text-[0.78rem]'

// 本文中の色分けした式「環境＝地球＋…＋人」
function ColoredEquation() {
  return (
    <>
      「
      {MISSION_TERMS.map((term, index) => (
        <Fragment key={term.text}>
          {index > 0 && (
            <span className="text-[1.15rem] font-black text-wf-royal">{operatorBefore(index)}</span>
          )}
          <span className="text-[1.15rem] font-black" style={{ color: term.color }}>
            {term.text}
          </span>
        </Fragment>
      ))}
      」
    </>
  )
}

// 旧実装はスマホでも PC の 2 段組のまま横にはみ出し、本文が細い列に押し込まれていた。
// スマホでは 1 段にし、背景の白い円の代わりに白い面の上に本文を置く
export default function MissionPage() {
  return (
    <>
      <section className="relative isolate w-full overflow-hidden px-4 py-5 sm:px-10">
        <img
          src="/media/images/bg_blue.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 size-full object-cover"
        />
        {/* 装飾の白い円（PC のみ） */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[550px] -left-[60px] -z-5 size-[1000px] rounded-full bg-white max-lg:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[330px] -left-[100px] -z-5 h-[400px] w-[900px] rounded-[50%] bg-white max-lg:hidden"
        />
        <Leaf
          side="left"
          position="bottom"
          trigger="load"
          className="-z-8 opacity-20 max-lg:hidden"
        />
        <Leaf
          side="right"
          position="bottom"
          trigger="load"
          className="-z-8 opacity-20 max-lg:hidden"
        />

        <div className="mx-auto max-w-[1200px] text-wf-ink max-lg:my-6 max-lg:rounded-3xl max-lg:bg-white/90 max-lg:p-5">
          <h1 className="font-bold">
            <span className="mb-2 block text-[1.1rem]">当社は、</span>
            <img
              src="/media/images/calculation.svg"
              alt={MISSION_EQUATION}
              width={793}
              height={43}
              className="mb-2 block h-auto w-full"
            />
            <span className="block text-sm lg:-mt-2.5 lg:text-right lg:text-base">
              を重要なテーマとして捉えています。
            </span>
          </h1>

          <div className="mt-6 lg:mt-0 lg:flex lg:items-start lg:gap-[60px]">
            <div className="min-w-0 flex-1">
              <p className={`mb-3.5 ${BODY_CLASS}`}>
                横浜というアクセスの良い立地に"積替え・保管"施設を開設。
                <PcBreak />
                "収集・運搬から積替え・保管、そして最終処分場への搬入"まで、
                <PcBreak />
                これまでのノウハウとネットワークを活かし、適正処理を担っています。
                <PcBreak />
                時にはコストの最適化はもちろん、
                <PcBreak />
                二次公害を引き起こさない細心の作業手順を実践し、
                <PcBreak />
                収集・運搬、積替え・保管、そして中間処理施設や最終処分場までの
                <PcBreak />
                安全・確実な処理をトータルにコーディネイトしています。
              </p>

              <div className="mb-3.5 flex flex-col items-start gap-1">
                <img
                  src="/media/images/+.svg"
                  alt=""
                  width={76}
                  height={33}
                  className="ml-[110px] w-[50px]"
                />
                <img
                  src="/media/images/smile.svg"
                  alt="スマイル宣言"
                  width={250}
                  height={75}
                  className="ml-5 block h-20 w-auto"
                />
              </div>

              <div className="-mt-[30px] mb-3">
                <h2 className={LABEL_CLASS}>地域と共に</h2>
                <p className={`text-[#1a1a1a] ${BODY_CLASS}`}>
                  当社は、産業廃棄物処理のプロであると同時に、地域の方々のサポーターでも
                  <PcBreak />
                  あります。
                  <PcBreak />
                  <ColoredEquation />
                  という重要な
                  <PcBreak />
                  テーマを掲げ、廃棄物処理だけにとどまらず自然環境や街の人々を最大限に
                  <PcBreak />
                  尊重しながら環境クリエイターという名に恥じぬ様、地域のために力を
                  <PcBreak />
                  尽くしてまいります。
                </p>
              </div>

              <div>
                <h2 className={LABEL_CLASS}>地域の美化運動</h2>
                <p className={BODY_CLASS}>
                  当社の方々に住みやすく、ゴミの無い街づくりをお約束いたします。
                  <PcBreak />
                  企業としてではなく、従業員全員が社会人の基本として、
                  <PcBreak />
                  毎日２行っている地域清掃をはじめ、元気な挨拶、
                  <PcBreak />
                  丁寧な言葉遣いで笑顔あふれる地域をめざし
                  <PcBreak />
                  「スマイル宣言」を伝えてまいります。
                </p>
              </div>
            </div>

            {/* 写真の切り替え（事務スタッフ・安全朝礼・事務所） */}
            <div className="mx-auto mt-8 w-[min(80vw,360px)] shrink-0 lg:mt-0 lg:flex lg:w-[min(550px,42%)] lg:justify-end lg:pt-10">
              <FadeUp className="relative aspect-square w-full overflow-hidden rounded-full bg-gray-100">
                <CrossfadeHero slugs={MISSION_PHOTOS} priority />
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="community-heading"
        className="relative isolate w-full bg-wf-surface py-[clamp(64px,8vw,120px)]"
      >
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <SectionHeader
            id="community-heading"
            eyebrow="WITH THE COMMUNITY"
            size="md"
            className="mb-12"
            lead="現場で働く人、運ばれる資源、そして地域。私たちの周りには、いつも誰かの暮らしがあります。"
          >
            地域と共に
          </SectionHeader>
          <FadeUp>
            <PhotoMasonry label="地域と共にの写真" slugs={COMMUNITY_GALLERY} />
          </FadeUp>
        </div>
      </section>
    </>
  )
}
