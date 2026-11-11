// トップページだけで使う内容（旧 front-page.php にハードコードされていたもの）

// ヒーローの背景に並べる 9 枚（3 × 3）
// 9 枚とも明るく加工した -hero 版でトーンを揃える
// （元の写真は他ページでも使うので別ファイル。scripts/hero-highkey.py で生成する）
export const HERO_TILES = [
  'wf-112-hero',
  'wf-114-hero',
  'wf-079-hero',
  'wf-095-hero',
  'wf-086-hero',
  'wf-092-hero',
  'wf-104-hero',
  'wf-105-hero',
  'wf-102-hero',
] as const

export const MISSION_BACKGROUND = ['wf-114', 'wf-079', 'wf-092'] as const

// SERVICE の 5 つの円（上段 2・中段 1・下段 2 の順）。lines は円の中での改行位置
export type ServicePoint = {
  lines: readonly string[]
  badge?: string
}

export const SERVICE_POINTS: readonly ServicePoint[] = [
  { lines: ['自社の', '処理施設を', '（積替え・保管）', '所有'] },
  { lines: ['自社', '中間処理場'], badge: 'WF-A.BASE' },
  { lines: ['鉄・非鉄', '買い取ります。'] },
  { lines: ['どんな', '産業廃棄物にも', '対応'] },
  { lines: ['現場', 'パトロール', '小口回収でも', 'お気軽に'] },
]

export const WORKFLOW_STEPS = [
  { number: '01', en: 'HEARING', ja: '現状の課題ヒアリング' },
  { number: '02', en: 'PLANNING', ja: '最適なプランニング' },
  { number: '03', en: 'PROPOSAL', ja: 'お見積り・ご提案' },
  { number: '04', en: 'CONTRACT', ja: '契約締結' },
  { number: '05', en: 'OPERATION', ja: '運用開始・定期フォロー' },
] as const

// VEHICLE LINEUP のスライド（旧サイトの時点で車両ではなく現場写真が入っている）
export const VEHICLE_SLIDES = [
  { slug: 'wf-079', en: 'SAFETY', ja: '安全朝礼' },
  { slug: 'wf-086', en: 'SORTING', ja: '選別作業' },
  { slug: 'wf-092', en: 'TEAM', ja: 'チームワーク' },
] as const

export const RECRUIT_PEOPLE = [
  { slug: 'wf-114', sub: 'TEAM', label: '仲間と、共に。' },
  { slug: 'wf-092', sub: 'SMILE', label: '笑顔で、つながる。' },
  { slug: 'wf-079', sub: 'COMMUNITY', label: '地域と、共に生きる。' },
] as const
