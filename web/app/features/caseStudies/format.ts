import type { CaseStudy, CaseStudyPhoto } from '@wf/shared'

// 日付（YYYY-MM-DD）をトップの一覧の表記（YYYY.MM.DD）にする
export const formatCaseStudyDate = (date: string) => date.replaceAll('-', '.')

// 一覧の表示順の番号（CASE 01, 02…）
export const caseNumber = (index: number) => String(index + 1).padStart(2, '0')

// 写真の説明（alt）。管理画面で空のままなら、タイトルと何枚目かで補う
export const casePhotoAlt = (
  study: Pick<CaseStudy, 'title'>,
  photo: CaseStudyPhoto,
  index: number,
) => photo.alt.trim() || `${study.title}の写真（${index + 1} 枚目）`
