// サービスページ（旧 page-service.php）の内容

// 図の画像（web/public/media/images/*.svg）の実寸
type DiagramImage = { src: string; width: number; height: number }

// パスは省略せずに書く（参照先の実在をテスト scripts/mediaReferences.test.ts で確かめるため）
const image = (src: string, width: number, height: number): DiagramImage => ({ src, width, height })

export type ServiceFeature = {
  // 丸いバッジの画像と、その文字（画像の文字は輪郭化されているため代替テキストに書き起こす）
  badge: DiagramImage & { alt: string }
  // 吹き出し（買取は立て札）の画像と、その文字
  detail: DiagramImage & { alt: string }
}

// 図の中央の大きな円（装飾）
export const SERVICE_CENTER = image('/media/images/big-circle.svg', 507, 507)

// 図の 5 つの特長。旧実装の図の配置（12 時から時計回り）の順に並べる
export const SERVICE_FEATURES: readonly ServiceFeature[] = [
  {
    badge: { ...image('/media/images/circle1.svg', 200, 200), alt: '鉄、非鉄 買い取ります' },
    detail: {
      ...image('/media/images/bill.svg', 265, 253),
      alt: '鉄・スクラップを買い取り致します。※廃棄物と一緒に処理する場合は分別し、廃棄物の上に鉄・スクラップをのせて下さい。',
    },
  },
  {
    badge: { ...image('/media/images/circle2.svg', 200, 200), alt: '自社中間処理場 WF-A.BASE' },
    detail: {
      ...image('/media/images/bubble1.svg', 215, 184),
      alt: '排出事業者様から委託された産業廃棄物は、当社の処理ネットワークを活かし、適正且つ安全・安心いただける処分場で適正処理を行います。',
    },
  },
  {
    badge: {
      ...image('/media/images/circle3.svg', 200, 200),
      alt: '現場パトロール 小口回収でもお気軽に',
    },
    detail: {
      ...image('/media/images/bubble2.svg', 245, 187),
      alt: '当社は対象がたとえ一つでも、自社トラックに手積みを行いますので、お気軽にご連絡ください。',
    },
  },
  {
    badge: { ...image('/media/images/circle4.svg', 200, 200), alt: 'どんな産業廃棄物にも対応' },
    detail: {
      ...image('/media/images/bubble3.svg', 217, 111),
      alt: '15品目の産業廃棄物取扱い許可を取得しており、どんな産業廃棄物でも適切に運搬いたします。',
    },
  },
  {
    badge: {
      ...image('/media/images/circle5.svg', 200, 200),
      alt: '自社の処理施設を（積替え・保管）所有',
    },
    detail: {
      ...image('/media/images/bubble4.svg', 236, 150),
      alt: '自社の積替え・保管施設と中間処理施設にて、産業廃棄物の適正処理を行い、万全の産業廃棄物管理を行います。',
    },
  },
]

// 事業内容のカード
export const SERVICE_BUSINESSES = [
  {
    photo: 'wf-079',
    name: '収集・運搬',
    description: '関東一円の自社車両網で、廃棄物を計画的・効率的に運搬します。',
  },
  {
    photo: 'wf-086',
    name: '選別作業',
    description: '材質ごとに細かく仕分け、再資源化率を最大化します。',
  },
  {
    photo: 'wf-087',
    name: '中間処理',
    description: '自社処理場で破砕・圧縮・分別を行い、適正処理へつなぎます。',
  },
  {
    photo: 'wf-095',
    name: 'リサイクル',
    description: '鉄・非鉄・コンクリート等を再資源として循環させる仕組み。',
  },
  {
    photo: 'wf-112',
    name: '鉄・非鉄買取',
    description: '発生現場での買取査定で、処分コスト削減もご提案可能。',
  },
] as const
