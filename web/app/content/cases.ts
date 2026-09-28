// トップの施工事例の一覧（旧 front-page.php の CASE STUDY）
// TODO: 旧サイトの時点で日付・社名が仮の値（○○）のまま。実際の事例が決まったら差し替える（docs/migration-progress.md のユーザー確認待ち）
export type CaseSummary = {
  date: string
  company: string
  tag: string
}

export const CASE_SUMMARIES: readonly CaseSummary[] = [
  { date: '2026.00.00', company: '○○○○○○', tag: '運用開始' },
  { date: '2026.00.00', company: '○○○○○○', tag: '構築' },
  { date: '2026.00.00', company: '○○○○○○', tag: '実証実験' },
  { date: '2026.00.00', company: '○○○○○○', tag: '研修' },
]

// 施工事例ページ（旧 page-casestudy.php）のヒーローの写真（3 列 × 2 段）
export const CASE_HERO_PHOTOS = [
  'wf-112',
  'wf-114',
  'wf-079',
  'wf-086',
  'wf-087',
  'wf-092',
] as const

export type CaseStudy = {
  number: string
  title: string
  // 分類（「産業廃棄物 / 金属類 / 機械設備」など）
  meta: string
  description: string
  // 1 枚目が大きく、残り 3 枚が右側に並ぶ
  photos: readonly [string, string, string, string]
}

// 施工事例ページの主要施工事例
export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    number: '01',
    title: '工場リノベーション廃材処理',
    meta: '産業廃棄物 / 金属類 / 機械設備',
    description:
      '稼働中の工場を一部解体し、設備更新に伴う大量の廃材を選別。再資源化率 92% を達成。',
    photos: ['wf-106', 'wf-107', 'wf-108', 'wf-109'],
  },
  {
    number: '02',
    title: '大型工事現場での連続搬出',
    meta: '公共工事 / 大量運搬 / 安全管理',
    description:
      '都市部の再開発現場で連日大量に発生する廃材を、複数台体制で連続搬出。工程遅延ゼロで完遂。',
    photos: ['wf-050', 'wf-048', 'wf-110', 'wf-111'],
  },
  {
    number: '03',
    title: '広域運搬・回収実績',
    meta: '関東一円 / 定期回収 / 中継拠点活用',
    description: '複数拠点を持つお客様の廃材を、自社車両網で集約・効率搬送。月間稼働 600 件超。',
    photos: ['wf-009', 'wf-049', 'wf-048', 'wf-037'],
  },
]
