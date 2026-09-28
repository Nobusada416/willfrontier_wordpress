// 会社概要（旧 front-page.php の COMPANY セクション）
export type Office = {
  name: string
  postalCode: string
  address: string
  tel: string
  fax: string
  mail?: string
}

export const OFFICES: readonly Office[] = [
  {
    name: '横浜本社',
    postalCode: '241-0003',
    address: '神奈川県横浜市旭区白根町 895 番地',
    tel: '045-959-3225',
    fax: '045-959-3226',
    mail: 'eco-will@kvj.biglobe.ne.jp',
  },
  {
    name: 'WF-A.BASE',
    postalCode: '243-0807',
    address: '神奈川県厚木市金田 1107-7',
    tel: '046-205-4177',
    fax: '046-205-4178',
  },
]

// 所在地（ADDRESS）は OFFICES から描画するため、それ以外の項目を並び順どおりに持つ
export const COMPANY_PROFILE = {
  before: [
    { term: 'COMPANY NAME', detail: '株式会社 ウィルフロンティア' },
    { term: 'REPRESENTATIVE', detail: '代表取締役　佐々木 宏幸' },
  ],
  after: [
    { term: 'ESTABLISHED', detail: '平成 25 年 10 月 25 日' },
    { term: 'CAPITAL', detail: '1,000 万円' },
    { term: 'BUSINESS', detail: '産業廃棄物収集運搬業 / リサイクル事業 / コンサルティング' },
  ],
} as const
