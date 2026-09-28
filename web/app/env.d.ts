// ビルド時の環境変数（import.meta.env）の型。vite/client の ImportMetaEnv に追加する
interface ImportMetaEnv {
  // 'true' のときだけ検索エンジンへの登録を許可する（lib/indexing.ts）
  readonly VITE_ALLOW_INDEXING?: string
}
