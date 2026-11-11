import { FadeUp } from '~/components/motion/FadeUp'
import { MoreLink } from '~/components/ui/MoreLink'
import { SERVICE_POINTS, type ServicePoint } from '~/content/home'
import { HomeSection } from './HomeSection'

function ServiceCircle({ point, className }: { point: ServicePoint; className: string }) {
  return (
    <li
      className={`${className} flex size-[clamp(130px,14.5vw,215px)] shrink-0 items-center justify-center rounded-full bg-wf-blue p-[clamp(10px,1.1vw,16px)] transition-transform hover:scale-105`}
    >
      <div className="flex size-full flex-col items-center justify-center gap-1.5 rounded-full border-2 border-white/85 p-[clamp(8px,1vw,16px)] text-center text-[clamp(12px,1.4vw,22px)] leading-snug font-black text-white">
        <p>
          {/* 改行位置は見た目だけで表し、読み上げでは 1 つの文として続ける */}
          {point.lines.map((line) => (
            <span key={line} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
        </p>
        {point.badge && (
          <span className="border-[1.5px] border-white/70 px-[clamp(8px,1.2vw,20px)] py-1 text-[clamp(10px,1vw,16px)] whitespace-nowrap">
            {point.badge}
          </span>
        )}
      </div>
    </li>
  )
}

// 5 つの円を上段 2・中段 1・下段 2 に重ねて並べる（旧デザインの X 字型）
// 読み上げ順が見た目の順と一致するよう、並び順どおりにグリッドへ置き、中段だけ上下を重ねる
const POSITIONS = [
  'justify-self-start',
  'col-start-3 justify-self-end',
  'col-span-3 justify-self-center -my-[clamp(30px,3.5vw,50px)]',
  'justify-self-start',
  'col-start-3 justify-self-end',
] as const

export function Service() {
  return (
    <HomeSection id="service" title="SERVICE" leaves="b">
      <FadeUp className="mx-auto max-w-[900px]">
        <ul aria-label="サービスの特長" className="grid grid-cols-[auto_1fr_auto]">
          {SERVICE_POINTS.map((point, index) => (
            <ServiceCircle
              key={point.lines.join('')}
              point={point}
              className={POSITIONS[index] ?? ''}
            />
          ))}
        </ul>
      </FadeUp>

      <FadeUp className="mt-8 text-center">
        <MoreLink to="/service/" context="SERVICE">
          もっと見る
        </MoreLink>
      </FadeUp>
    </HomeSection>
  )
}
