// お問い合わせページ（旧 page-contact.php）の内容

// ヒーローの写真の切り替え（事務所・安全朝礼・事務所）
export const CONTACT_HERO_PHOTOS = ['wf-073', 'wf-076', 'wf-095'] as const

// お問い合わせ後の流れ（icon は旧実装の絵文字）
export const CONTACT_STEPS = [
  { icon: '📞', title: 'お問い合わせ', note: '当日中に折り返し' },
  { icon: '🔍', title: '現地確認・見積', note: '無料' },
  { icon: '🤝', title: 'ご契約・回収開始', note: '最短 1週間' },
] as const

export const CONTACT_FAQ = [
  { question: '少量でも回収してもらえますか？', answer: 'はい' },
  { question: '見積もりだけでも依頼できますか？', answer: 'もちろんです' },
  { question: '急ぎの回収は対応可能ですか？', answer: 'ご相談ください' },
] as const
