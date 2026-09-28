// P9 でユーザー判断待ち: 旧デザインの色のままにしている文字のコントラスト不足（WCAG AA 未満）。
// 色を変えるかはユーザーの判断を待っているため、E2E の axe 検査ではここに挙げた色の組み合わせに限って違反を許容する。
// ここにない組み合わせのコントラスト不足（新しく追加した部品など）はテストを失敗させる。
// 色を決めて直したら、該当する行を消すこと（一覧と比率は docs/migration-progress.md の「問題・ブロッカー」）

export type KnownContrastPair = {
  // axe が報告する色（#rrggbb の小文字）
  foreground: string
  background: string
  // どこで使われている組み合わせか（比率は axe の計算値）
  note: string
}

// 背景に使っている白系の色（白・body の既定背景 wf-bg・セクション背景 wf-surface）
const LIGHT_BACKGROUNDS = ['#ffffff', '#f5fafb', '#f6f8fa'] as const

export const KNOWN_CONTRAST_PAIRS: readonly KnownContrastPair[] = [
  // P7 から把握していたもの
  {
    foreground: '#ffffff',
    background: '#d4874a',
    note: '下層ページの CTA ボタン（白文字 × wf-orange、2.85:1）',
  },
  ...LIGHT_BACKGROUNDS.map((background) => ({
    foreground: '#4a9db5',
    background,
    note: '英字ラベル・番号・安全ページの本文など（wf-blue の文字 × 白系の背景、2.9〜3.09:1）',
  })),
  // P9 の axe 検査で新たに見つかったもの
  {
    foreground: '#ffffff',
    background: '#4a9db5',
    note: 'ヘッダー・フッターの CONTACT、送信ボタン、トップのラベルなど（白文字 × wf-blue、3.09:1）',
  },
  ...LIGHT_BACKGROUNDS.map((background) => ({
    foreground: '#4a8a9e',
    background,
    note: '見出しの説明文・補足の文字（wf-text-mid × 白系の背景、3.63〜3.87:1）',
  })),
  {
    foreground: '#c0cedc',
    background: '#2d5c8a',
    note: 'フッターの著作権表示（半透明の白 × wf-navy、4.35:1）',
  },
]

export function isKnownContrastIssue(issue: { foreground: string; background: string }): boolean {
  const foreground = issue.foreground.toLowerCase()
  const background = issue.background.toLowerCase()
  return KNOWN_CONTRAST_PAIRS.some(
    (pair) => pair.foreground === foreground && pair.background === background,
  )
}
