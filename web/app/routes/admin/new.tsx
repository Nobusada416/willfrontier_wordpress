import { getAdminPage } from '~/content/pages'
import { CaseStudyNewScreen } from '~/features/admin/CaseStudyEditScreen'
import { buildAdminMeta } from '~/lib/seo'

// /admin/case-studies/new/ 。施工事例の新規作成
export const meta = () => buildAdminMeta(getAdminPage('admin-new'))

export default function AdminNewCaseStudyPage() {
  return <CaseStudyNewScreen />
}
