import { getPage } from '~/content/pages'

const page = getPage('recruit')

export const meta = () => [{ title: `${page.title}｜ウィルフロンティア` }]

// TODO(P6/P7): 旧テンプレートの内容を移植する
export default function RecruitPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-24">
      <h1 className="text-3xl font-bold text-wf-navy">{page.title}</h1>
    </main>
  )
}
