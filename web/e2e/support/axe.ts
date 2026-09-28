import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import type { NodeResult, Result } from 'axe-core'
import { isKnownContrastIssue } from './knownContrastIssues'

// 検査する基準（WCAG 2.1 の A・AA）
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

export type ContrastIssue = {
  target: string
  html: string
  foreground: string
  background: string
  ratio: number
  expected: string
}

export type A11yScan = {
  // 許容リストにない違反（テストを失敗させる）
  violations: Result[]
  // 許容リストに一致したコントラスト不足（報告用）
  knownContrastIssues: ContrastIssue[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

// axe の color-contrast の結果（node.any[].data）から前景色・背景色・比率を取り出す
export function contrastIssueOf(node: NodeResult): ContrastIssue | undefined {
  const data = node.any.find((check) => check.id === 'color-contrast')?.data
  if (!isRecord(data)) return undefined
  const { fgColor, bgColor, contrastRatio, expectedContrastRatio } = data
  if (typeof fgColor !== 'string' || typeof bgColor !== 'string') return undefined
  return {
    target: node.target.join(' '),
    html: node.html,
    foreground: fgColor,
    background: bgColor,
    ratio: typeof contrastRatio === 'number' ? contrastRatio : Number.NaN,
    expected: typeof expectedContrastRatio === 'string' ? expectedContrastRatio : '',
  }
}

// 許容リストに一致するコントラスト不足を違反から除き、報告用に分ける
function splitKnownContrast(violations: Result[]): A11yScan {
  const knownContrastIssues: ContrastIssue[] = []
  const remaining: Result[] = []
  for (const violation of violations) {
    if (violation.id !== 'color-contrast') {
      remaining.push(violation)
      continue
    }
    const unknownNodes = violation.nodes.filter((node) => {
      const issue = contrastIssueOf(node)
      if (issue && isKnownContrastIssue(issue)) {
        knownContrastIssues.push(issue)
        return false
      }
      return true
    })
    if (unknownNodes.length > 0) remaining.push({ ...violation, nodes: unknownNodes })
  }
  return { violations: remaining, knownContrastIssues }
}

export async function scanA11y(page: Page): Promise<A11yScan> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  return splitKnownContrast(results.violations)
}

// 失敗時に読みやすいよう、違反を「ルール: 要素」の一覧にする
export function formatViolations(violations: Result[]): string[] {
  return violations.flatMap((violation) =>
    violation.nodes.map((node) => {
      const contrast = violation.id === 'color-contrast' ? contrastIssueOf(node) : undefined
      const detail = contrast
        ? ` 前景 ${contrast.foreground} / 背景 ${contrast.background} / 比率 ${contrast.ratio}`
        : ''
      return `${violation.id}: ${node.target.join(' ')}${detail}`
    }),
  )
}
