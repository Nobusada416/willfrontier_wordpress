import { IntroOverlay } from '~/components/motion/IntroOverlay'
import { getPage } from '~/content/pages'
import { CaseStudy } from '~/features/home/CaseStudy'
import { Company } from '~/features/home/Company'
import { Gallery } from '~/features/home/Gallery'
import { Hero } from '~/features/home/Hero'
import { Mission } from '~/features/home/Mission'
import { Recruit } from '~/features/home/Recruit'
import { Safety } from '~/features/home/Safety'
import { Service } from '~/features/home/Service'
import { Vehicles } from '~/features/home/Vehicles'
import { Workflow } from '~/features/home/Workflow'
import { buildMeta } from '~/lib/seo'

const page = getPage('home')

export const meta = () => buildMeta(page)

export default function HomePage() {
  return (
    <>
      <IntroOverlay />
      <Hero />
      <Mission />
      <Service />
      <Workflow />
      <Vehicles />
      <Gallery />
      <CaseStudy />
      <Safety />
      <Recruit />
      <Company />
    </>
  )
}
