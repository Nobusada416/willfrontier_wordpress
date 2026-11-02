import type { CaseStudy, CaseStudyPhoto } from '@wf/shared'

// テスト用の施工事例（公開中）
export const testPhoto = (caseId: string, index: number, alt = ''): CaseStudyPhoto => ({
  path: `case-studies/${caseId}/photo-${index}`,
  smallUrl: `https://firebasestorage.googleapis.com/${caseId}-${index}-small.webp`,
  largeUrl: `https://firebasestorage.googleapis.com/${caseId}-${index}-large.webp`,
  width: 1600,
  height: 1200,
  alt,
})

export const testCaseStudy = (id: string, overrides: Partial<CaseStudy> = {}): CaseStudy => ({
  id,
  status: 'published',
  date: '2026-04-01',
  tag: '運用開始',
  company: `株式会社${id}`,
  title: `事例 ${id} のタイトル`,
  category: '産業廃棄物 / 金属類',
  description: `事例 ${id} の本文`,
  photos: [0, 1, 2, 3].map((index) => testPhoto(id, index)),
  ...overrides,
})
