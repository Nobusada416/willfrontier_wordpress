// 施工事例の一覧（旧 front-page.php の CASE STUDY）
// TODO(P7): 旧サイトの時点で日付・社名が仮の値（○○）のまま。実際の事例が決まったら差し替える
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
