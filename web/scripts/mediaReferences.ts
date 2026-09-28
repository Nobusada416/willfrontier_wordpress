import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { photoSrc, photoSrcSet, posterSrc, videoSrc } from '../app/lib/media'

// ソース中の文字列リテラルから、参照しているメディアファイル（/media/...）を求める
// 写真スラッグ（'wf-079'）・動画スラッグ（'shorts/s08'）・直接のパス（'/media/images/x.svg'）を対象にする
const PHOTO_SLUG = /['"`](wf-\d{3})['"`]/g
const VIDEO_SLUG = /['"`](shorts\/s\d{2})['"`]/g
const MEDIA_PATH = /['"`](\/media\/[^'"`\s]+)['"`]/g

const matchesOf = (source: string, pattern: RegExp) =>
  Array.from(source.matchAll(pattern), (match) => match[1] ?? '')

export const findMediaReferences = (source: string): string[] => {
  const photos = matchesOf(source, PHOTO_SLUG).flatMap((slug) => [
    // srcset の 1 つ目（small）と src（large）
    photoSrcSet(slug).split(' ')[0] ?? '',
    photoSrc(slug),
  ])
  const videos = matchesOf(source, VIDEO_SLUG).flatMap((slug) => [videoSrc(slug), posterSrc(slug)])
  return [...new Set([...photos, ...videos, ...matchesOf(source, MEDIA_PATH)])]
}

// ディレクトリ配下の .ts / .tsx（テストを除く）を再帰的に集める
export const collectSourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return collectSourceFiles(path)
    return /\.tsx?$/.test(entry.name) && !entry.name.includes('.test.') ? [path] : []
  })
