// E2E の axe 検査で、やむを得ず許容する文字のコントラスト不足（WCAG AA 未満）の色の組み合わせ。
// ここにない組み合わせのコントラスト不足はテストを失敗させる。
// P9 では旧デザインの色（wf-blue・wf-orange・wf-text-mid・フッターの半透明の白）を許容していたが、
// ユーザーの判断で色を直したため、現在は空にしている。追加する場合は理由を note に書くこと

export type KnownContrastPair = {
  // axe が報告する色（#rrggbb の小文字）
  foreground: string
  background: string
  // どこで使われている組み合わせか（比率は axe の計算値）
  note: string
}

// P9 でユーザーの判断（すべて直す）を受けて色を直したため、現在は許容している組み合わせは無い
export const KNOWN_CONTRAST_PAIRS: readonly KnownContrastPair[] = []

export function isKnownContrastIssue(issue: { foreground: string; background: string }): boolean {
  const foreground = issue.foreground.toLowerCase()
  const background = issue.background.toLowerCase()
  return KNOWN_CONTRAST_PAIRS.some(
    (pair) => pair.foreground === foreground && pair.background === background,
  )
}
