import { getAdminPage } from '~/content/pages'
import { CaseStudyListScreen } from '~/features/admin/CaseStudyListScreen'
import { buildAdminMeta } from '~/lib/seo'

// /admin/ 。ログインしていなければログイン画面（routes/admin/layout.tsx）、ログイン後は施工事例の一覧
export const meta = () => buildAdminMeta(getAdminPage('admin'))

export default function AdminIndexPage() {
  return <CaseStudyListScreen />
}
