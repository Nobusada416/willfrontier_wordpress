import type { AdminCaseStudy } from './api'

// 一覧の並び: 日付の新しい順。同じ日付は最後に保存した新しい順（保存日時の無いものは後ろ）
export const sortCaseStudies = (items: readonly AdminCaseStudy[]): AdminCaseStudy[] =>
  [...items].sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      (b.updatedAt?.getTime() ?? -Infinity) - (a.updatedAt?.getTime() ?? -Infinity) ||
      0,
  )

export const countByStatus = (items: readonly Pick<AdminCaseStudy, 'status'>[]) => ({
  published: items.filter((item) => item.status === 'published').length,
  draft: items.filter((item) => item.status === 'draft').length,
})

// 日付は公開サイトと同じく YYYY.MM.DD で表示する
export const formatCaseStudyDate = (date: string) => date.replaceAll('-', '.')
