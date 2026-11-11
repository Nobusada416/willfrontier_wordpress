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
  // <title> に使うページ名（「｜サイト名」は lib/seo.ts が付ける）。検索結果に出るため日本語で始め、
  // 地域名はトップだけに入れる。SERVICE・SAFETY・RECRUIT では読み上げ用の h1 にも使う
  title: string
  // 検索結果・SNS シェア用の説明文（meta description / og:description）。70〜120 字で、要点を先に書く
  description: string
}

export const PAGES: readonly Page[] = [
  {
    id: 'home',
    path: '/',
    file: 'routes/home.tsx',
    title: '横浜の産業廃棄物収集運搬・リサイクル',
    description:
      '横浜市旭区のウィルフロンティアは、産業廃棄物の収集運搬、積替え・保管、中間処理、リサイクルを行う会社です。関東一円の自社車両網で、小口回収や鉄・非鉄の買取にも対応します。都市インフラを支える、産業廃棄物テック。',
  },
  {
    id: 'mission',
    path: '/mission/',
    file: 'routes/mission.tsx',
    // 会社概要はこのページに無い（トップの #company）。ミッションと地域の取り組みの内容に合わせる
    title: '企業理念と地域活動',
    description:
      'ウィルフロンティアのミッション「環境＝地球＋Forest＋水＋Animal＋街＋人」と、毎日の地域清掃やスマイル宣言など、地域と共に歩む取り組みをご紹介します。',
  },
  {
    id: 'service',
    path: '/service/',
    file: 'routes/service.tsx',
    title: '事業内容（産業廃棄物の収集運搬・中間処理）',
    description:
      '関東一円の自社車両網による産業廃棄物の収集運搬から、横浜の積替え・保管施設、自社の中間処理施設での処理とリサイクル、鉄・非鉄の買取、対象が一つでも伺う小口回収まで、ウィルフロンティアの事業内容をご紹介します。',
  },
  {
    id: 'workflow',
    path: '/workflow/',
    file: 'routes/workflow.tsx',
    title: '産業廃棄物処理の流れ',
    description:
      '各県の処理業者との処理ネットワークと横浜の積替え・保管施設を活かした、産業廃棄物の受入・選別から中間処理、搬出、リサイクル・最終処分までの流れをご紹介します。',
  },
  {
    id: 'vehicles',
    path: '/vehicles/',
    file: 'routes/vehicles.tsx',
    title: '保有車両（産業廃棄物の収集運搬車両）',
    description:
      '4t・8tのアームロール、2t〜10tの大型ダンプ、10〜20㎥のコンテナ運搬車、都市部の細い道に対応する4t中型車、平ボディトラックなど、産業廃棄物の収集運搬に使う保有車両をご紹介します。',
  },
  {
    id: 'casestudy',
    path: '/casestudy/',
    file: 'routes/casestudy.tsx',
    title: '施工事例',
    description:
      'ウィルフロンティアが手がけた産業廃棄物の収集運搬・処理・リサイクルの事例を順次ご紹介します。少量の回収のご相談も、まずはお気軽にお問い合わせください。',
  },
  {
    id: 'safety',
    path: '/safety/',
    file: 'routes/safety.tsx',
    title: '安全への取り組み',
    description:
      '毎日の安全が、地域の安全をつくる。毎朝の安全朝礼、分別・点検作業、安全会議など、ウィルフロンティアの日々の安全への取り組みと、地域を笑顔にするスマイル宣言をご紹介します。',
  },
  {
    id: 'recruit',
    path: '/recruit/',
    file: 'routes/recruit.tsx',
    title: '採用情報（ドライバー・作業員）',
    description:
      '横浜の産業廃棄物収集運搬会社ウィルフロンティアの採用情報。ドライバー（日給13,000円〜）・作業員・事務・管理候補を募集しています。カジュアルな面接で、最短2週間で入社。',
  },
  {
    id: 'contact',
    path: '/contact/',
    file: 'routes/contact.tsx',
    title: 'お問い合わせ・無料お見積り',
    description:
      '産業廃棄物の収集運搬・処理のご相談やお見積りのご依頼は、フォームからお問い合わせください。基本は当日中に折り返します。現地確認・お見積りは無料で、少量の回収や見積りのみのご相談も承ります。',
  },
]

// 施工事例の管理画面（社内向け。docs/case-studies.md）。
// サイトのページ一覧（PAGES）とは分け、sitemap・canonical の検証・ナビの対象にしない。
// 全画面 noindex（lib/seo.ts の buildAdminMeta）で、robots.txt でも Disallow: /admin/ にする。
// ヘッダー・フッターなどサイト共通の枠は出さず、管理画面の枠（routes/admin/layout.tsx）で表示する。
// 静的に書き出すため動的なセグメントは使わず、編集する事例の ID はクエリ（?id=）で渡す
export type AdminPageId = 'admin' | 'admin-new' | 'admin-edit'

export type AdminPage = {
  id: AdminPageId
  path: string
  file: string
  // <title> に使う画面名
  title: string
}

export const ADMIN_LAYOUT_FILE = 'routes/admin/layout.tsx'

export const ADMIN_PAGES: readonly AdminPage[] = [
  // ログインしていなければログイン画面、ログイン後は施工事例の一覧
  { id: 'admin', path: '/admin/', file: 'routes/admin/index.tsx', title: '施工事例' },
  {
    id: 'admin-new',
    path: '/admin/case-studies/new/',
    file: 'routes/admin/new.tsx',
    title: '施工事例の新規作成',
  },
  {
    id: 'admin-edit',
    path: '/admin/case-studies/edit/',
    file: 'routes/admin/edit.tsx',
    title: '施工事例の編集',
  },
]

export const isAdminPath = (pathname: string) =>
  pathname === '/admin' || pathname.startsWith('/admin/')

export const getAdminPage = (id: AdminPageId): AdminPage => {
  const page = ADMIN_PAGES.find((p) => p.id === id)
  if (!page) throw new Error(`管理画面の定義が見つかりません: ${id}`)
  return page
}

// 編集画面の URL（/admin/case-studies/edit/?id=...）
export const adminEditPath = (id: string) =>
  `${getAdminPage('admin-edit').path}?id=${encodeURIComponent(id)}`

// 404 ページのプリレンダー先。サイトのページ一覧（PAGES）には含めない
export const NOT_FOUND_PATH = '/404'

const toPrerenderPath = (path: string) => (path === '/' ? path : path.replace(/\/$/, ''))

// ビルド時に静的 HTML を生成するパス一覧
// 末尾スラッシュ付き（'/mission/'）で渡すと React Router が中身の空の HTML を出力するため除去する。
// 出力先はどちらも mission/index.html で、Firebase Hosting の trailingSlash: true で '/mission/' として配信される
// 管理画面も書き出す（中身はブラウザでログインしてから読み込む）。
// 404 ページも '/404' として出力し、ビルド後に 404.html へ移す（scripts/create-404.mjs）
export const prerenderPaths = (): string[] => [
  ...PAGES.map((page) => toPrerenderPath(page.path)),
  ...ADMIN_PAGES.map((page) => toPrerenderPath(page.path)),
  NOT_FOUND_PATH,
]

export const getPage = (id: PageId): Page => {
  const page = PAGES.find((p) => p.id === id)
  if (!page) throw new Error(`ページ定義が見つかりません: ${id}`)
  return page
}
