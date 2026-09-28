import { Picture } from '~/components/media/Picture'
import { FadeUp } from '~/components/motion/FadeUp'
import { MoreLink } from '~/components/ui/MoreLink'
import { RECRUIT_PEOPLE } from '~/content/home'
import { HomeSection } from './HomeSection'

export function Recruit() {
  return (
    <HomeSection id="recruit" title="RECRUIT" leaves="a">
      <div className="mx-auto max-w-[1152px]">
        <FadeUp>
          <ul className="grid gap-4 md:grid-cols-3">
            {RECRUIT_PEOPLE.map((person) => (
              <li
                key={person.sub}
                className="relative aspect-[3/4] overflow-hidden rounded-md bg-black max-md:aspect-[4/3]"
              >
                <Picture
                  slug={person.slug}
                  alt=""
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/80 to-transparent"
                />
                <div className="absolute inset-x-5.5 bottom-5 text-white">
                  <p lang="en" className="mb-1.5 text-xs font-bold tracking-[.25em] opacity-85">
                    {person.sub}
                  </p>
                  <p className="text-[clamp(1.1rem,1.6vw,1.6rem)] font-black tracking-wider [text-shadow:0_2px_8px_rgb(0_0_0/0.6)]">
                    {person.label}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 border border-wf-notice-border bg-wf-notice px-6 py-4.5 text-center text-[clamp(1.4rem,2.5vw,3rem)] font-black tracking-wider text-wf-navy">
            スマイル宣言はじめませんか？
          </p>
        </FadeUp>

        <FadeUp
          as="p"
          className="border border-t-0 border-wf-notice-border bg-wf-notice px-5 py-[clamp(10px,1.5vh,18px)] text-center text-[clamp(0.85rem,1.3vw,1.25rem)] leading-relaxed font-bold text-wf-navy"
        >
          スマイル宣言とは：元気な挨拶、丁寧な言葉遣いで笑顔あふれる地域をめざす、ウィルフロンティアの取り組み
        </FadeUp>

        <FadeUp className="mt-12 text-center">
          <MoreLink to="/recruit/" variant="block">
            応募する
          </MoreLink>
        </FadeUp>
      </div>
    </HomeSection>
  )
}
