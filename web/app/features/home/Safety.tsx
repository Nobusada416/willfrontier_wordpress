import { Picture } from '~/components/media/Picture'
import { FadeUp } from '~/components/motion/FadeUp'
import { MoreLink } from '~/components/ui/MoreLink'
import { HomeSection } from './HomeSection'

export function Safety() {
  return (
    <HomeSection id="safety" title="SAFETY" leaves="b">
      <FadeUp>
        <figure className="relative mx-auto w-full max-w-[1000px] overflow-hidden rounded-sm border-[1.5px] border-wf-border bg-black lg:w-[75vw]">
          <div className="h-[clamp(240px,44vh,480px)]">
            <Picture
              slug="wf-079"
              alt="毎朝の安全朝礼"
              sizes="(min-width: 1334px) 1000px, 75vw"
              className="h-full w-full object-cover"
            />
          </div>
          {/* キャッチコピーを読みやすくするため、写真の下側を暗くする */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-black/70 to-transparent"
          />
          <figcaption className="absolute inset-x-0 bottom-0 z-[2] p-6 text-center text-[clamp(1.25rem,3vw,2.4rem)] font-black tracking-wider text-white [text-shadow:0_2px_12px_rgb(0_0_0/0.7),0_0_6px_rgb(0_0_0/0.5)] sm:p-8">
            毎日の安全が、地域の安全をつくる。
          </figcaption>
        </figure>
      </FadeUp>

      <FadeUp className="mt-12 text-center">
        <MoreLink to="/safety/" context="SAFETY" textClassName="text-base sm:text-lg">
          {/* 狭い画面では「・」の後ろで改行する（MoreLink は単語の途中で改行しない） */}
          もっと見る・
          <wbr />
          お問い合わせ
        </MoreLink>
      </FadeUp>
    </HomeSection>
  )
}
