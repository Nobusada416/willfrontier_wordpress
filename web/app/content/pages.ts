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
  // 検索結果・SNS シェア用の説明文（meta description / og:description）
  description: string
}

export const PAGES: readonly Page[] = [
  {
    id: 'home',
    path: '/',
    file: 'routes/home.tsx',
    title: 'ウィルフロンティア',
    description:
      '株式会社ウィルフロンティアは横浜市旭区を拠点に、産業廃棄物の収集運搬・リサイクル・コンサルティングを行う会社です。',
  },
  {
    id: 'mission',
    path: '/mission/',
    file: 'routes/mission.tsx',
    title: 'MISSION・会社概要',
    description:
      'ウィルフロンティアのミッション「環境＝地球＋Forest＋水＋Animal＋街＋人」と、スマイル宣言・地域の美化運動など地域と共に歩む取り組みをご紹介します。',
  },
  {
    id: 'service',
    path: '/service/',
    file: 'routes/service.tsx',
    title: 'SERVICE・事業内容',
    description:
      '産業廃棄物の収集運搬、自社処理施設での積替え・保管、鉄・非鉄の買取、小口回収など、ウィルフロンティアの事業内容をご紹介します。',
  },
  {
    id: 'workflow',
    path: '/workflow/',
    file: 'routes/workflow.tsx',
    title: 'WORKFLOW・処理の流れ',
    description:
      '課題のヒアリングからプランニング、お見積り・ご提案、契約締結、運用開始・定期フォローまでの流れをご紹介します。',
  },
  {
    id: 'vehicles',
    path: '/vehicles/',
    file: 'routes/vehicles.tsx',
    title: 'VEHICLES・保有車両',
    description: 'ウィルフロンティアが保有する産業廃棄物の収集運搬車両をご紹介します。',
  },
  {
    id: 'casestudy',
    path: '/casestudy/',
    file: 'routes/casestudy.tsx',
    title: 'CASE STUDY・施工事例',
    description: 'ウィルフロンティアの産業廃棄物処理・リサイクルの事例をご紹介します。',
  },
  {
    id: 'safety',
    path: '/safety/',
    file: 'routes/safety.tsx',
    title: 'SAFETY・安全への取り組み',
    description:
      '毎日の安全が、地域の安全をつくる。ウィルフロンティアの安全への取り組みとスマイル宣言をご紹介します。',
  },
  {
    id: 'recruit',
    path: '/recruit/',
    file: 'routes/recruit.tsx',
    title: 'RECRUIT・採用情報',
    description:
      'ウィルフロンティアの採用情報。仲間と共に、地域と共に働くスタッフを募集しています。',
  },
  {
    id: 'contact',
    path: '/contact/',
    file: 'routes/contact.tsx',
    title: 'CONTACT・お問い合わせ',
    description:
      '産業廃棄物の収集運搬・処理のご相談やお見積りのご依頼は、こちらのフォームからお問い合わせください。',
  },
]

// 404 ページのプリレンダー先。サイトのページ一覧（PAGES）には含めない
export const NOT_FOUND_PATH = '/404'

// ビルド時に静的 HTML を生成するパス一覧
// 末尾スラッシュ付き（'/mission/'）で渡すと React Router が中身の空の HTML を出力するため除去する。
// 出力先はどちらも mission/index.html で、Firebase Hosting の trailingSlash: true で '/mission/' として配信される
// 404 ページも '/404' として出力し、ビルド後に 404.html へ移す（scripts/create-404.mjs）
export const prerenderPaths = (): string[] => [
  ...PAGES.map((page) => (page.path === '/' ? page.path : page.path.replace(/\/$/, ''))),
  NOT_FOUND_PATH,
]

export const getPage = (id: PageId): Page => {
  const page = PAGES.find((p) => p.id === id)
  if (!page) throw new Error(`ページ定義が見つかりません: ${id}`)
  return page
}
