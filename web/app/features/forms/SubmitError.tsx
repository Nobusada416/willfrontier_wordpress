import { OFFICES } from '~/content/company'

const [headOffice] = OFFICES

// 通信エラーなどで送れなかったときの案内。入力は残っているため、そのまま送り直せる
// 旧実装の「送信に失敗しました。」だけでは次の行動がわからないため、電話での連絡先を添える
export function SubmitError({ failed }: { failed: boolean }) {
  return (
    // 送信に失敗した時点で読み上げられるよう、role="alert" の枠は常に置いて中身だけを出し入れする
    <div role="alert">
      {failed && (
        <p className="mb-6 rounded-md border border-red-300 bg-red-50 px-5 py-4 text-sm font-bold text-red-800">
          送信に失敗しました。時間をおいてもう一度お試しいただくか、お電話
          {headOffice && (
            <>
              （{headOffice.name}{' '}
              <a href={`tel:${headOffice.tel}`} className="underline">
                {headOffice.tel}
              </a>
              ）
            </>
          )}
          でお問い合わせください。
        </p>
      )}
    </div>
  )
}
