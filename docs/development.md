# 開発ガイド

## 必要環境

- Node.js 22（`.nvmrc`）
  - react-router v8・jsdom v30 は Node 22.22 以上が必要なため、現状は react-router 7 系・jsdom 29 系を使う

## セットアップ

```bash
npm install
```

## よく使うコマンド（リポジトリのルートで実行）

| コマンド                                  | 内容                                                         |
| ----------------------------------------- | ------------------------------------------------------------ |
| `npm run dev`                             | 開発サーバー起動（web）                                      |
| `npm run build`                           | 本番ビルド。`web/build/client/` に静的 HTML とアセットを出力 |
| `npm run test`                            | Vitest でユニットテスト                                      |
| `npm run typecheck`                       | React Router の型生成 + `tsc`                                |
| `npm run lint`                            | ESLint                                                       |
| `npm run format` / `npm run format:check` | Prettier で整形 / 整形チェック                               |

`web` 単体では `npm run test:watch -w web` でウォッチ実行できる。

## コーディング規約

- Prettier: セミコロンなし・シングルクォート・trailing comma all・2 スペース
- TypeScript strict（`noUncheckedIndexedAccess` 含む）。`any` と `@ts-ignore` は使わない
- コメントとドキュメントは日本語、識別子は英語
- TDD（Red → Green → Refactor）。テストは実装ファイルと同じ場所に `*.test.ts(x)` で置く
- パスエイリアス `~/` は `web/app/` を指す

## CI

`.github/workflows/ci.yml` で lint → format チェック → 型チェック → テスト → ビルドを実行する。

## 旧 WordPress テーマ

移行完了（P11）まではルート直下の `*.php`・`style.css`・`assets/` などを残す。
旧テーマのローカル確認は `docker compose up`（http://localhost:8081）。
旧テーマの `style.css` はルートの `tailwindcss@3` で生成しているため、P11 まで依存を残す。
