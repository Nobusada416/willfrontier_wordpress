// サイト全体の基本情報（SEO・フッターなどで共通に使う）
export const SITE = {
  name: 'ウィルフロンティア',
  legalName: '株式会社ウィルフロンティア',
  // canonical・OGP・sitemap・JSON-LD の URL に使う本番ドメイン（末尾スラッシュなし。www なしを正式とする）
  url: 'https://willfrontier.jp',
} as const

// SNS でシェアされたときの画像（web/public/og-image.jpg。写真 wf-097 を 1200×630 に切り出したもの）
export const OG_IMAGE = {
  path: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: '荷台を傾けたウィルフロンティアの産業廃棄物収集運搬車両',
} as const

// 構造化データ（JSON-LD）のロゴ（web/public/logo.png。media/images/logocolor.svg を書き出したもの）
export const LOGO_PATH = '/logo.png'
