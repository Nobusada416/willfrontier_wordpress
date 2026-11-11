// 入力値の正規化（全角で入力されがちな電話番号・メールアドレスを半角にそろえる）

// 全角の英数字・記号（！〜～）と全角空白を半角にする
export const toHalfWidth = (value: string) =>
  value
    .replace(/[\uff01-\uff5e]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, ' ')

// 電話番号の区切りとして入力されがちなハイフンに似た文字（長音・全角マイナス・ダッシュ類）
const DASH_LIKE = /[ー‐‑–—―−ｰ]/g

export const normalizeTel = (value: string) => toHalfWidth(value).replace(DASH_LIKE, '-').trim()

export const normalizeEmail = (value: string) => toHalfWidth(value).trim()
