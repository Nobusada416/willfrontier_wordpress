// sitemap.xml と robots.txt の中身を組み立てる（書き出しは generate-seo-files.ts）
type SitemapPage = { path: string }

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

// XML の本文・属性に入れる文字列をエスケープする（1 回の置換で処理するため二重エスケープしない）
export const escapeXml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char)

// ページのパスは末尾スラッシュ付き（'/mission/'）で、canonical と同じ URL になる
export const sitemapUrls = (siteUrl: string, pages: readonly SitemapPage[]): string[] =>
  pages.map((page) => `${siteUrl}${page.path}`)

export const buildSitemapXml = (siteUrl: string, pages: readonly SitemapPage[]): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapUrls(siteUrl, pages).map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n')

// インデックス禁止（既定）のときはクロール自体を止め、sitemap も案内しない
export const buildRobotsTxt = (siteUrl: string, allowIndexing: boolean): string =>
  allowIndexing
    ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n'
