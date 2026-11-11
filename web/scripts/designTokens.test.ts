import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// app.css の @theme の色が、文字に使う組み合わせで WCAG AA（通常の文字 4.5:1）を満たすかを確かめる
const css = readFileSync(join(import.meta.dirname, '../app/app.css'), 'utf8')

const token = (name: string) => {
  const value = new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i').exec(css)?.[1]
  if (!value) throw new Error(`色のトークン --color-${name} がありません`)
  return value
}

// WCAG 2.x の相対輝度
const luminance = (hex: string) => {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((index) => {
    const channel = parseInt(hex.slice(index, index + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a: string, b: string) => {
  const [light = 0, dark = 0] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

const WHITE = '#ffffff'
const AA = 4.5

describe('色のトークンのコントラスト（WCAG AA）', () => {
  // 文字色として白系の背景（白・wf-bg・wf-surface）の上に置くもの
  it.each(['wf-blue', 'wf-text-mid', 'wf-navy', 'wf-ink', 'wf-text', 'wf-danger'])(
    '%s の文字は白系の背景で 4.5:1 以上',
    (name) => {
      for (const background of [WHITE, token('wf-bg'), token('wf-surface')]) {
        expect(contrast(token(name), background)).toBeGreaterThanOrEqual(AA)
      }
    },
  )

  // 白い文字を載せるボタンなどの背景
  it.each(['wf-blue', 'wf-blue-hover', 'wf-orange', 'wf-orange-hover', 'wf-navy', 'wf-danger'])(
    '%s の背景に白い文字を載せて 4.5:1 以上',
    (name) => {
      expect(contrast(WHITE, token(name))).toBeGreaterThanOrEqual(AA)
    },
  )
})

describe('塗りのボタンのマウスを重ねたときの色', () => {
  it.each([
    ['wf-blue-hover', 'wf-blue'],
    ['wf-orange-hover', 'wf-orange'],
  ])('%s は %s より暗い（重ねたときに明るくならない）', (hover, base) => {
    expect(luminance(token(hover))).toBeLessThan(luminance(token(base)))
  })

  // 不透明度を下げたり固定の色にしたりすると、トークンを変えたときに通常時より明るくなり、
  // 白い文字とのコントラストが落ちる（P9 で wf-blue を暗くした際に起きた）
  it('bg-wf-blue・bg-wf-orange のボタンは、hover で不透明度や固定の色を使わない', () => {
    const appDir = join(import.meta.dirname, '../app')
    const files = readdirSync(appDir, { recursive: true, encoding: 'utf8' }).filter(
      (file) => file.endsWith('.tsx') && !file.endsWith('.test.tsx'),
    )
    const offending = files.flatMap((file) =>
      readFileSync(join(appDir, file), 'utf8')
        .split('\n')
        .filter((line) => /bg-wf-(blue|orange)\b/.test(line))
        .filter((line) => /hover:(opacity-|bg-\[)/.test(line))
        .map((line) => `${file}: ${line.trim().slice(0, 80)}`),
    )
    expect(offending).toEqual([])
  })
})
