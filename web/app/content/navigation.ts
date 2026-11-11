export type NavItem = {
  label: string
  href: string
}

// ヘッダーのグローバルナビ。COMPANY はトップの会社概要を指す
// （旧サイトは COMPANY がミッションページを指していたため、MISSION を分けた。ユーザー判断、2026-11-05）
export const GLOBAL_NAV: readonly NavItem[] = [
  { label: 'MISSION', href: '/mission/' },
  { label: 'SERVICE', href: '/service/' },
  { label: 'WORKFLOW', href: '/workflow/' },
  { label: 'VEHICLES', href: '/vehicles/' },
  { label: 'CASE', href: '/casestudy/' },
  { label: 'COMPANY', href: '/#company' },
]

// フッターナビ（トップページの各セクションへ遷移）
// 旧実装は "#service" 形式で下層ページから機能しなかったため、トップ基準の "/#service" 形式にする
export const FOOTER_NAV: readonly NavItem[] = [
  { label: 'SERVICE', href: '/#service' },
  { label: 'WORKFLOW', href: '/#workflow' },
  { label: 'VEHICLES', href: '/#vehicles' },
  { label: 'CASE', href: '/#case-study' },
  { label: 'COMPANY', href: '/#company' },
]

// 旧実装はヘッダーのみ /safety/ を指していたため、お問い合わせページに統一する
export const CONTACT_LINK: NavItem = { label: 'CONTACT', href: '/contact/' }
