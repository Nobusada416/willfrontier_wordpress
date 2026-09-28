import { IntroOverlay } from '~/components/motion/IntroOverlay'
import { getPage } from '~/content/pages'
import { buildMeta } from '~/lib/seo'

const page = getPage('home')

export const meta = () => buildMeta(page)

// TODO(P6/P7): 旧テンプレートの内容を移植する
export default function HomePage() {
  return (
    <>
      <IntroOverlay />
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h1 className="text-3xl font-bold text-wf-navy">{page.title}</h1>
      </div>
    </>
  )
}
