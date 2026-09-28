// サイトの全ページ定義。ルーティング（routes.ts）とプリレンダー対象（react-router.config.ts）の唯一の情報源
export type PageId =
  | 'home'
  | 'mission'
  | 'service'
  | 'workflow'
  | 'vehicles'
  | 'casestudy'
  | 'safety'
  | 'recruit'
  | 'contact'

export type Page = {
  id: PageId
  // 現行サイトの URL 形式に合わせ、トップ以外は末尾スラッシュ付き
  path: string
  // app/ からの相対パス
  file: string
  // <title> に使うページ名
  title: string
}

export const PAGES: readonly Page[] = [
  { id: 'home', path: '/', file: 'routes/home.tsx', title: 'ウィルフロンティア' },
  { id: 'mission', path: '/mission/', file: 'routes/mission.tsx', title: 'MISSION・会社概要' },
  { id: 'service', path: '/service/', file: 'routes/service.tsx', title: 'SERVICE・事業内容' },
  {
    id: 'workflow',
    path: '/workflow/',
    file: 'routes/workflow.tsx',
    title: 'WORKFLOW・処理の流れ',
  },
  { id: 'vehicles', path: '/vehicles/', file: 'routes/vehicles.tsx', title: 'VEHICLES・保有車両' },
  {
    id: 'casestudy',
    path: '/casestudy/',
    file: 'routes/casestudy.tsx',
    title: 'CASE STUDY・施工事例',
  },
  { id: 'safety', path: '/safety/', file: 'routes/safety.tsx', title: 'SAFETY・安全への取り組み' },
  { id: 'recruit', path: '/recruit/', file: 'routes/recruit.tsx', title: 'RECRUIT・採用情報' },
  { id: 'contact', path: '/contact/', file: 'routes/contact.tsx', title: 'CONTACT・お問い合わせ' },
]

// ビルド時に静的 HTML を生成するパス一覧
export const prerenderPaths = (): string[] => PAGES.map((page) => page.path)

export const getPage = (id: PageId): Page => {
  const page = PAGES.find((p) => p.id === id)
  if (!page) throw new Error(`ページ定義が見つかりません: ${id}`)
  return page
}
