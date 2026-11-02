import { Outlet } from 'react-router'
import { AdminShell } from '~/features/admin/AdminShell'

// 施工事例の管理画面（/admin/ 以下）の共通の枠。ログインの判定と、ヘッダー（タイトル・メールアドレス）を出す。
// Firebase の Auth・Firestore・Storage は表示のあとで import() する（公開ページのバンドルには入らない）
const loadApi = () =>
  import('~/features/admin/loadAdminApi').then(({ loadAdminApi }) => loadAdminApi())

export default function AdminLayout() {
  return (
    <AdminShell loadApi={loadApi}>
      <Outlet />
    </AdminShell>
  )
}
