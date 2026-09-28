import { Link } from 'react-router'
import { buildNotFoundMeta } from '~/lib/seo'

export const meta = () => buildNotFoundMeta()

// どのルートにも一致しない URL で表示する
// ビルド時に '/404' としてプリレンダーし、Firebase Hosting が返す 404.html として配置する
export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="font-en text-5xl font-bold text-wf-blue">404</p>
      <h1 className="mt-4 text-2xl font-bold text-wf-navy">ページが見つかりません</h1>
      <p className="mt-6 leading-relaxed">
        お探しのページは移動または削除された可能性があります。
        <br />
        URL をご確認のうえ、トップページからお探しください。
      </p>
      <Link
        to="/"
        className="mt-10 inline-flex items-center rounded-full bg-wf-blue px-10 py-3 font-bold tracking-[.1em] text-white transition-opacity hover:opacity-80"
      >
        トップページへ戻る
      </Link>
    </div>
  )
}
