import { getAdminPage } from '~/content/pages'
import { CaseStudyEditScreen } from '~/features/admin/CaseStudyEditScreen'
import { buildAdminMeta } from '~/lib/seo'

// /admin/case-studies/edit/?id=... 。施工事例の編集（静的に書き出すため、ID はクエリで受け取る）
export const meta = () => buildAdminMeta(getAdminPage('admin-edit'))

export default function AdminEditCaseStudyPage() {
  return <CaseStudyEditScreen />
}
