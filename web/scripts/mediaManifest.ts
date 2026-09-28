import { readdirSync, readFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { imageSize } from 'image-size'
// 型だけを使う（実行時には消えるため、node で直接実行しても mediaManifest.json の import は起きない）
import type { MediaManifest, Size } from '../app/lib/media.ts'

const readSize = (file: string): Size => {
  const { width, height } = imageSize(readFileSync(file))
  return { width, height }
}

const listFiles = (dir: string, extension: string) =>
  readdirSync(dir)
    .filter((name) => extname(name) === extension)
    .sort()

/**
 * web/public/media の写真と poster の寸法を読み取る
 * srcset の幅（w）と img / video の width・height 属性に使う
 */
export const buildMediaManifest = (publicDir: string): MediaManifest => {
  const photosDir = join(publicDir, 'media/photos')
  const photos: MediaManifest['photos'] = {}
  for (const name of listFiles(join(photosDir, 'large'), '.webp')) {
    const slug = basename(name, '.webp')
    photos[slug] = {
      small: readSize(join(photosDir, 'small', name)),
      large: readSize(join(photosDir, 'large', name)),
    }
  }

  const videosDir = join(publicDir, 'media/videos')
  const posters: MediaManifest['posters'] = {}
  for (const group of readdirSync(videosDir, { withFileTypes: true })) {
    if (!group.isDirectory()) continue
    for (const name of listFiles(join(videosDir, group.name), '.jpg')) {
      posters[`${group.name}/${basename(name, '.jpg')}`] = readSize(
        join(videosDir, group.name, name),
      )
    }
  }

  return { photos, posters }
}
