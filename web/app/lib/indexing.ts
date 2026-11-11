// 検索エンジンへの登録（インデックス）を許可するかを、ビルド時の環境変数 VITE_ALLOW_INDEXING から判定する
// 本番切り替え（P10）までは現行の WordPress サイトと重複して載らないよう、既定は「禁止」にする
// 許可は文字列 'true' のときだけ（表記ゆれで意図せず公開しないよう厳密に比較する）
// postbuild のスクリプト（Node で直接実行）からも読み込むため、import.meta.env やエイリアス（~/）を使わない
export const parseAllowIndexing = (value: string | undefined): boolean => value === 'true'
