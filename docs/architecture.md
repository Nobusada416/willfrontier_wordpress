# アーキテクチャ

ウィルフロンティア コーポレートサイトは、WordPress クラシックテーマから
**React + TypeScript + Vite + Firebase** 構成へ移行中である（進捗は [migration-progress.md](./migration-progress.md)）。

## 技術スタック

| 領域                 | 採用技術                                                                  | 備考                                                                         |
| -------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| UI                   | React 19 + TypeScript 6（strict）                                         |                                                                              |
| ルーティング・ビルド | React Router 7（framework mode）+ Vite 8                                  | `ssr: false` + `prerender` で全ページをビルド時に静的 HTML 化                |
| CSS                  | Tailwind CSS v4（`@tailwindcss/vite`）                                    | デザイントークンは `web/app/app.css` の `@theme`。複雑な部分のみ CSS Modules |
| フォント             | Google Fonts（Zen Maru Gothic / Quicksand）                               | 自前配信は `@font-face` だけで数百 KB になるため不採用                       |
| ホスティング         | Firebase Hosting                                                          | 設定は `firebase.json`                                                       |
| フォーム             | Cloud Functions v2 → Firestore → Trigger Email 拡張                       | P8 以降                                                                      |
| テスト               | Vitest + React Testing Library（jsdom）                                   | E2E は Playwright（P9 以降）                                                 |
| 静的解析             | ESLint 9（typescript-eslint strict / react-hooks / jsx-a11y）+ Prettier 3 |                                                                              |

## ディレクトリ構成

npm workspaces 構成。移行期間中は WordPress テーマ（ルート直下の `*.php` など）と並存する。

```
package.json            # workspaces: web / shared / functions
eslint.config.mjs  .prettierrc.json  tsconfig.base.json  .nvmrc
tsconfig.json           # ルート直下のテスト（tests/）用
.github/workflows/ci.yml
firebase.json  .firebaserc              # Hosting / Functions / Firestore / Emulator の設定
firestore.rules  firestore.indexes.json # クライアントからの読み書きはすべて拒否
tests/rules/            # Firestore セキュリティルールのテスト（Emulator 上で実行）
shared/                 # @wf/shared: web と functions で共有するフォーム定義（zod）
  src/index.ts
  src/forms/formTypes.ts
functions/              # @wf/functions: Cloud Functions v2（Node 22 / ESM）
  esbuild.config.mjs    # @wf/shared と zod を lib/index.js にバンドル
  src/index.ts          # 共通設定（asia-northeast1 / maxInstances 5）
web/
  react-router.config.ts  # ssr: false / prerender
  vite.config.ts          # Tailwind v4 + React Router
  vitest.config.ts
  app/
    root.tsx              # HTML の骨格（SkipLink・Header・main・Footer）・フォント読み込み・エラー表示
    routes.ts             # content/pages.ts からルートを生成（一致しない URL は routes/not-found.tsx）
    app.css               # Tailwind v4 とデザイントークン
    content/
      pages.ts            # 全ページ定義（ルート・プリレンダー対象の唯一の情報源）
      navigation.ts       # ヘッダー・フッターのリンク定義
      site.ts             # サイト名・正式社名・キャッチコピー・URL
    components/layout/    # Header（PC ナビ・ハンバーガー）/ MobileNav / Footer / SkipLink / Logo
    lib/seo.ts            # buildMeta() / buildNotFoundMeta(): title・description・canonical・OGP、404 の noindex を組み立てる
    routes/*.tsx          # 各ページ（not-found.tsx は 404 ページ）
  public/media/           # ハッシュなしで配信する画像・動画（/media/**）
  scripts/create-404.mjs        # プリレンダーした /404 を 404.html へ移す（postbuild）
  scripts/verify-prerender.mjs  # ビルド後に各ページの title と h1、404.html の noindex を検証（postbuild）
```

## 設計方針

- **ページ定義は 1 か所に集約する**: `web/app/content/pages.ts` の `PAGES` から
  `routes.ts` と `react-router.config.ts` の `prerender` を生成する。
  ナビゲーションのリンク先がすべてプリレンダー対象に含まれることをテストで保証している。
- **URL は現行サイトと同じ末尾スラッシュ形式**（`/mission/`）を維持する。
  - リンクやページ定義のパスは `/mission/` とし、Hosting の `trailingSlash: true` で `/mission` は `/mission/` へ 301 する。
  - ただし React Router の `prerender` には末尾スラッシュなし（`/mission`）で渡す。
    スラッシュ付きで渡すと中身の空の HTML が出力されるため（`prerenderPaths()` で変換済み）。
- **ヘッダー・フッター・`<main>` は `root.tsx` の `Layout` が持つ**: 各ページは `<main>` の中身だけを描画する。
  エラー表示や 404 ページにも同じヘッダー・フッターが付く。
- **meta はページ定義から生成する**: 各ルートは `export const meta = () => buildMeta(page)` とし、
  title・description・canonical・OGP を `content/pages.ts` と `content/site.ts` から組み立てる。
- **404 ページもプリレンダーする**: `*` ルートを `/404` としてプリレンダーし、ビルド後に `404.html` へ移す。
  Firebase Hosting は存在しない URL に `404.html` を 404 ステータスで返す。
- **Firestore はクライアントから直接触らない**: フォームの送信内容は個人情報を含むため、
  セキュリティルールで読み書きをすべて拒否し、Cloud Functions（Admin SDK）だけが書き込む。
- **shared は functions にバンドルする**: Firebase のデプロイは `functions/` だけをアップロードして
  `npm install` するため、ワークスペースの `@wf/shared` を解決できない。
  `functions/tsconfig.json` の `paths` で `../shared/src` を参照し、esbuild で 1 ファイルにまとめる。
- **コンテンツは TypeScript の定数で管理する**: 旧テーマは WordPress の投稿機能を使っておらず、
  すべてテンプレートにハードコードされていたため CMS は導入しない。
