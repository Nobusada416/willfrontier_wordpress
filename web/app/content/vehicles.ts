// 車両ページ（旧 page-vehicles.php）の内容

// ヒーローの写真の切り替え
export const VEHICLE_HERO_PHOTOS = ['wf-097', 'wf-007', 'wf-042'] as const

// 主要車両
export const VEHICLE_LINEUP = [
  {
    photo: 'wf-007',
    name: 'アームロール',
    spec: '4t / 8t',
    description: 'コンテナ着脱で現場間移動を効率化。狭小現場にも対応。',
  },
  {
    photo: 'wf-097',
    name: '大型ダンプ',
    spec: '2t〜10t',
    description: '建材・廃材の大量運搬の主力。荷台後部からの一気積み下ろし。',
  },
  {
    photo: 'wf-042',
    name: 'コンテナ運搬車',
    spec: '10〜20㎥対応',
    description: '大容量コンテナでの長距離輸送。複数現場の集約搬送に。',
  },
  {
    photo: 'wf-049',
    name: '中型運搬車',
    spec: '4t',
    description: '都市部の細い道や中小規模現場をカバーする中型主力車。',
  },
  {
    photo: 'wf-009',
    name: '平ボディトラック',
    spec: '汎用 / 多用途',
    description: '機材搬送・大型部材の運搬に。荷台フラットで汎用性高め。',
  },
] as const

// 「現場を動かす、その姿。」の背景動画
export const VEHICLE_MOTION_VIDEO = 'shorts/s08'

// 車両ギャラリー
export const VEHICLE_GALLERY = ['wf-097', 'wf-007', 'wf-042', 'wf-008', 'wf-009', 'wf-040'] as const
