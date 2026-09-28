import { FadeUp } from '~/components/motion/FadeUp'
import { MoreLink } from '~/components/ui/MoreLink'
import { WORKFLOW_STEPS } from '~/content/home'
import { HomeSection } from './HomeSection'

export function Workflow() {
  return (
    <HomeSection id="workflow" title="WORKFLOW" leaves="a">
      <ol aria-label="導入までの流れ" className="mx-auto max-w-[700px] border-t border-wf-blue">
        {WORKFLOW_STEPS.map((step) => (
          <FadeUp
            as="li"
            key={step.number}
            className="grid grid-cols-[auto_1fr] items-center gap-x-[clamp(0.8rem,1.5vw,2rem)] border-b border-wf-blue py-[clamp(0.75rem,1.5vh,1.75rem)] text-left sm:grid-cols-[auto_auto_1fr]"
          >
            <span className="w-[clamp(2.5rem,3.5vw,3.5rem)] text-[clamp(1.2rem,2.2vw,2.2rem)] font-bold text-wf-blue font-en">
              {step.number}
            </span>
            <h3
              lang="en"
              className="text-[clamp(1.1rem,2vw,2rem)] font-en font-bold tracking-wider text-wf-text sm:min-w-[clamp(100px,13vw,200px)] lg:max-xl:min-w-[160px] lg:max-xl:text-2xl"
            >
              {step.en}
            </h3>
            {/* スマホでは英字の下に回す */}
            <p className="col-start-2 text-[clamp(0.8rem,0.9vw,0.9rem)] font-bold tracking-wider text-gray-500 sm:col-start-3 sm:text-right">
              {step.ja}
            </p>
          </FadeUp>
        ))}
      </ol>

      <FadeUp className="mt-12 text-center">
        <MoreLink to="/workflow/" context="WORKFLOW">
          もっと見る
        </MoreLink>
      </FadeUp>
    </HomeSection>
  )
}
