// ミッションページ（旧 page-mission.php）の内容

// ミッションの式「環境＝地球＋Forest＋水＋Animal＋街＋人」の各語と色（旧実装の色をそのまま使う）
// 記号（＝・＋）はロゴ色の濃紺で描く
export const MISSION_TERMS = [
  { text: '環境', color: '#e94829' },
  { text: '地球', color: '#00a0e9' },
  { text: 'Forest', color: '#00a040' },
  { text: '水', color: '#003894' },
  { text: 'Animal', color: '#f39800' },
  { text: '街', color: '#541b86' },
  { text: '人', color: '#b60081' },
] as const

// index 番目の語の前に置く記号（最初の語の前は無し、2 語目の前は＝、以降は＋）
export const operatorBefore = (index: number) => (index === 0 ? '' : index === 1 ? '＝' : '＋')

// 式の文字列（画像の代替テキストや読み上げに使う）
export const MISSION_EQUATION = MISSION_TERMS.map(
  (term, index) => `${operatorBefore(index)}${term.text}`,
).join('')

// 右側の丸い写真の切り替え（事務スタッフ・安全朝礼・事務所）
export const MISSION_PHOTOS = ['wf-112', 'wf-079', 'wf-095'] as const

// 「地域と共に」の写真一覧
export const COMMUNITY_GALLERY = [
  'wf-114',
  'wf-092',
  'wf-017',
  'wf-105',
  'wf-101',
  'wf-100',
] as const
