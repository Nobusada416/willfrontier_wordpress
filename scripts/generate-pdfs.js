// Will Frontier — 3パターン PDF エクスポート
// 使い方: node scripts/generate-pdfs.js <pattern-name>
//   例: node scripts/generate-pdfs.js pattern-a
// 出力: プロジェクトルートに will-frontier-<pattern-name>.pdf

import puppeteer from 'puppeteer'
import PDFMerger from 'pdf-merger-js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const pattern = process.argv[2]
if (!pattern) {
  console.error('Usage: node generate-pdfs.js <pattern-name>')
  process.exit(1)
}

const baseUrl = 'http://localhost:8081'
const pages = [
  { slug: '', label: '01-home' },
  { slug: 'mission', label: '02-mission' },
  { slug: 'service', label: '03-service' },
  { slug: 'workflow', label: '04-workflow' },
  { slug: 'vehicles', label: '05-vehicles' },
  { slug: 'casestudy', label: '06-casestudy' },
  { slug: 'safety', label: '07-safety' },
  { slug: 'recruit', label: '08-recruit' },
  { slug: 'contact', label: '09-contact' },
]

console.log(`[${pattern}] Launching headless Chrome...`)
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })

const merger = new PDFMerger()

for (const p of pages) {
  const url = p.slug ? `${baseUrl}/${p.slug}/` : `${baseUrl}/`
  process.stdout.write(`[${pattern}] ${p.label} ${url} ... `)
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  } catch (e) {
    console.log(`timeout, retry with domcontentloaded`)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  }
  // GSAP / 動画ポスター / lazy-load 写真の安定待ち
  await new Promise((r) => setTimeout(r, 2500))

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight)
  const pdfBuffer = await page.pdf({
    width: '1440px',
    height: `${scrollHeight}px`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  })
  await merger.add(pdfBuffer)
  console.log(`OK (${(pdfBuffer.length / 1024 / 1024).toFixed(1)}MB, h=${scrollHeight}px)`)
}

const outPath = path.join(projectRoot, `will-frontier-${pattern}.pdf`)
await merger.save(outPath)
await browser.close()
console.log(`[${pattern}] Saved: ${outPath}`)
