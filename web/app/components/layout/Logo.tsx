import { Link } from 'react-router'

// ヘッダー・フッター共通のロゴ（トップページへのリンク）
export function Logo() {
  return (
    <Link to="/" className="block shrink-0 transition-opacity hover:opacity-80">
      <img
        src="/media/images/logocolor.svg"
        alt="ウィルフロンティア トップへ"
        width={130}
        height={49}
        className="h-10 w-auto"
      />
    </Link>
  )
}
