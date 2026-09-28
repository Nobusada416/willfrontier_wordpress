// サイト全体の基本情報（SEO・フッターなどで共通に使う）
export const SITE = {
  name: 'ウィルフロンティア',
  legalName: '株式会社ウィルフロンティア',
  tagline: '都市インフラを支える、産業廃棄物テック。',
  // canonical・OGP の URL に使う（末尾スラッシュなし）
  // TODO(P10): 本番を Firebase Hosting に切り替える際に本番ドメインへ変更する
  url: 'https://willfrontier-pattern-c.classic-market.jp',
} as const
