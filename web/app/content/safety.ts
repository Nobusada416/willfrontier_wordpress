// 安全ページ（旧 page-safety.php）の内容。お問い合わせフォームの項目は shared の zod スキーマにある

// 安全の取り組み（写真＋見出し＋説明文）。1 件目と 3 件目の見出しは旧サイトのまま同じ【安全朝礼】
export const SAFETY_PRACTICES = [
  {
    photo: 'wf-079',
    title: '【安全朝礼】',
    text: '毎朝の安全朝礼で、全員の意識を高めてから業務をスタートします。',
  },
  {
    photo: 'wf-086',
    title: '【屋内作業・点検】',
    text: '室内での丁寧な分別・点検作業で品質と安全を両立しています。',
  },
  {
    photo: 'wf-076',
    title: '【安全朝礼】',
    text: '毎朝の安全朝礼でチーム全員の意識を統一。地域と共に安全な作業を実現します。',
  },
] as const

// 「毎日の積み重ねが、現場を守る。」の背景動画
export const SAFETY_TRAINING_VIDEO = 'shorts/s13'

// 装備・点検ギャラリー
export const SAFETY_GALLERY = ['wf-079', 'wf-080', 'wf-081', 'wf-087'] as const

// お問い合わせ後の流れ。title は旧デザインの改行位置で分けた行
export const INQUIRY_STEPS = [
  {
    label: 'STEP1',
    icon: 'phone',
    title: ['お問い合わせ', '（電話またはメール）'],
    note: '基本当日中に折り返し',
  },
  {
    label: 'STEP2',
    icon: 'search',
    title: ['現地確認・見積'],
    note: '無料',
  },
  {
    label: 'STEP3',
    icon: 'handshake',
    title: ['ご契約・回収開始'],
    note: '最短１週間',
  },
] as const

export type InquiryStepIcon = (typeof INQUIRY_STEPS)[number]['icon']

// よくあるご質問
export const SAFETY_FAQS = [
  { question: 'Q.少量の産業廃棄物でも回収してもらえますか？', answer: '少量でも回収可能です' },
  { question: 'Q.見積もりだけの依頼は可能ですか？', answer: '見積のみも可能です' },
  { question: 'Q.急ぎの回収は対応可能ですか？', answer: 'ご相談ください' },
] as const
