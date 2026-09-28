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
| ホスティング         | Firebase Hosting                                                          | P1 以降                                                                      |
| フォーム             | Cloud Functions v2 → Firestore → Trigger Email 拡張                       | P8 以降                                                                      |
| テスト               | Vitest + React Testing Library（jsdom）                                   | E2E は Playwright（P9 以降）                                                 |
| 静的解析             | ESLint 9（typescript-eslint strict / react-hooks / jsx-a11y）+ Prettier 3 |                                                                              |

## ディレクトリ構成

npm workspaces 構成。移行期間中は WordPress テーマ（ルート直下の `*.php` など）と並存する。

```
package.json            # workspaces: web（P1 で functions / shared を追加）
eslint.config.mjs  .prettierrc.json  tsconfig.base.json  .nvmrc
.github/workflows/ci.yml
web/
  react-router.config.ts  # ssr: false / prerender
  vite.config.ts          # Tailwind v4 + React Router
  vitest.config.ts
  app/
    root.tsx              # HTML の骨格・フォント読み込み・エラー表示
    routes.ts             # content/pages.ts からルートを生成
    app.css               # Tailwind v4 とデザイントークン
    content/
      pages.ts            # 全ページ定義（ルート・プリレンダー対象の唯一の情報源）
      navigation.ts       # ヘッダー・フッターのリンク定義
    routes/*.tsx          # 各ページ
```

## 設計方針

- **ページ定義は 1 か所に集約する**: `web/app/content/pages.ts` の `PAGES` から
  `routes.ts` と `react-router.config.ts` の `prerender` を生成する。
  ナビゲーションのリンク先がすべてプリレンダー対象に含まれることをテストで保証している。
- **URL は現行サイトと同じ末尾スラッシュ形式**（`/mission/`）を維持する。
- **コンテンツは TypeScript の定数で管理する**: 旧テーマは WordPress の投稿機能を使っておらず、
  すべてテンプレートにハードコードされていたため CMS は導入しない。
