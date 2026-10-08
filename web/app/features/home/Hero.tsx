import { useRef } from 'react'
import { Link } from 'react-router'
import { MosaicHero } from '~/components/media/MosaicHero'
import { HERO_TILES } from '~/content/home'
import { SITE } from '~/content/site'
import { gsap, useMotion } from '~/lib/motion/gsap'
import { useIntroDone } from '~/lib/motion/intro'

// トップのファーストビュー。背景は 9 枚の写真を順に明滅させるモザイク
// 文字はイントロ（ロゴの幕）が消えてから、上から順に浮かび上がらせる
export function Hero() {
  const panelRef = useRef<HTMLDivElement>(null)
  const introDone = useIntroDone()

  useMotion(
    panelRef,
    (panel) => {
      // イントロ中は app.css により隠したまま待つ
      if (!introDone) return
      gsap.fromTo(
        panel.querySelectorAll('[data-hero-item]'),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15, delay: 0.1 },
      )
    },
    [introDone],
  )

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative isolate flex h-[calc(100svh-var(--spacing-header))] min-h-[600px] w-full items-center justify-center overflow-hidden bg-white"
    >
      {/* 写真の彩度を落として文字を読みやすくする。明るさは加工した写真のまま見せる（暗幕は重ねない） */}
      <MosaicHero slugs={HERO_TILES} columns={3} priority imageClassName="saturate-70" />

      <div className="relative z-10 flex w-full justify-center px-6">
        <div
          ref={panelRef}
          className="flex max-w-[min(900px,92vw)] flex-col items-center rounded-[10px] bg-white/82 px-[clamp(28px,6vw,80px)] py-[clamp(36px,5vw,64px)] text-center shadow-[0_10px_40px_rgb(0_0_0/0.18)] backdrop-blur-md"
        >
          <img
            data-hero-item
            data-reveal
            src="/media/images/logocolor.svg"
            alt={SITE.name}
            width={320}
            height={121}
            className="mb-2 w-56"
          />
          <h1
            id="hero-heading"
            data-hero-item
            data-reveal
            className="mb-4 text-[1.375rem] leading-tight font-black tracking-wider text-wf-deep sm:text-3xl sm:tracking-widest md:text-5xl lg:text-6xl"
          >
            都市インフラを支える、
            <br />
            産業廃棄物テック。
          </h1>
          <p
            data-hero-item
            data-reveal
            lang="en"
            className="mb-8 text-sm font-semibold tracking-widest text-wf-navy md:text-base lg:text-lg"
          >
            Sustainable Urban Infrastructure &amp; Technology
          </p>
          <div data-hero-item data-reveal>
            <Link
              to="/contact/"
              className="inline-flex items-center gap-3 rounded-full bg-wf-blue px-10 py-4 text-lg font-black tracking-widest text-white shadow-lg transition-colors hover:bg-wf-blue-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wf-blue md:text-xl"
            >
              <span aria-hidden="true" className="text-4xl leading-none font-thin">
                &gt;
              </span>
              CONTACT
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
