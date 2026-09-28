import { CrossfadeHero } from '~/components/media/CrossfadeHero'
import { FadeUp } from '~/components/motion/FadeUp'
import { MoreLink } from '~/components/ui/MoreLink'
import { MISSION_BACKGROUND } from '~/content/home'
import { HomeSection } from './HomeSection'

const TEXT_SHADOW = '[text-shadow:0_2px_8px_rgb(0_0_0/0.45)]'

export function Mission() {
  return (
    <HomeSection
      id="mission"
      title="MISSION"
      leaves="a"
      titleClassName="[text-shadow:0_2px_12px_rgb(0_0_0/0.5)]"
      background={
        // 旧実装は写真の外枠と画像の両方に opacity-40 がかかり、実質 0.16 になっていたため合わせる
        // （テンプレートにあった暗い幕 bg-black/40 は旧 CSS に含まれておらず表示されていなかった）
        <CrossfadeHero slugs={MISSION_BACKGROUND} imageClassName="opacity-16" />
      }
    >
      <div className="text-center">
        <FadeUp className="mb-4">
          <p
            className={`text-[clamp(1.1rem,2.8vw,2.6rem)] leading-tight font-black tracking-wide text-wf-text ${TEXT_SHADOW}`}
          >
            環境 = 地球 + Forest + 水 + Animal + 街 + 人
          </p>
          <p className="mt-2 text-[clamp(0.85rem,1.6vw,1.5rem)] font-bold tracking-wide">
            <span className="box-decoration-clone bg-[linear-gradient(transparent_55%,var(--color-wf-yellow)_55%)] px-[0.15em] text-gray-800">
              を重要なテーマとして捉えています。
            </span>
          </p>
        </FadeUp>

        <FadeUp className="mt-4 mb-8 flex flex-col items-center">
          <img src="/media/images/+.svg" alt="PLUS" width={100} height={43} className="w-[100px]" />
          <p className="mt-3 text-[clamp(1.2rem,2.5vw,2rem)] leading-tight font-black tracking-wide text-amber-500 [text-shadow:0_2px_10px_rgb(0_0_0/0.6),0_0_4px_rgb(0_0_0/0.4)]">
            スマイル宣言
          </p>
        </FadeUp>

        <FadeUp>
          <MoreLink to="/mission/" context="MISSION" textClassName="text-2xl">
            もっと見る
          </MoreLink>
        </FadeUp>
      </div>
    </HomeSection>
  )
}
