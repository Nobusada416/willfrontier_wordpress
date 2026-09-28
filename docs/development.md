# 開発ガイド

## 必要環境

- Node.js 22（`.nvmrc`）
- Java 11 以上（Firebase Emulator の Firestore に必要）
  - react-router v8・jsdom v30 は Node 22.22 以上が必要なため、現状は react-router 7 系・jsdom 29 系を使う

## セットアップ

```bash
npm install
```

## よく使うコマンド（リポジトリのルートで実行）

| コマンド                                  | 内容                                                                             |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| `npm run dev`                             | 開発サーバー起動（web）                                                          |
| `npm run build`                           | 本番ビルド。`web/build/client/` に静的 HTML とアセットを出力                     |
| `npm run test`                            | Vitest でユニットテスト                                                          |
| `npm run typecheck`                       | ルート（tests/）と各ワークスペースの `tsc`（web は React Router の型生成も行う） |
| `npm run lint`                            | ESLint                                                                           |
| `npm run format` / `npm run format:check` | Prettier で整形 / 整形チェック                                                   |

`web` 単体では `npm run test:watch -w web` でウォッチ実行できる。

## コーディング規約

- Prettier: セミコロンなし・シングルクォート・trailing comma all・2 スペース
- TypeScript strict（`noUncheckedIndexedAccess` 含む）。`any` と `@ts-ignore` は使わない
- コメントとドキュメントは日本語、識別子は英語
- TDD（Red → Green → Refactor）。テストは実装ファイルと同じ場所に `*.test.ts(x)` で置く
- パスエイリアス `~/` は `web/app/` を指す

## Firebase Emulator

`.firebaserc` の既定プロジェクトは `demo-willfrontier`。`demo-` で始まる ID は
Emulator 専用の仮プロジェクトで、本番の Firebase にはアクセスしない（本番のプロジェクト ID は P10 で設定）。

| サービス    | ポート                                      |
| ----------- | ------------------------------------------- |
| Emulator UI | 4000                                        |
| Hosting     | 5002（macOS の AirPlay が 5000 を使うため） |
| Functions   | 5001                                        |
| Firestore   | 8080                                        |

Hosting の Emulator は `web/build/client` を配信するため、事前に `npm run build` しておく。

## CI

`.github/workflows/ci.yml` で次の 2 ジョブを実行する。

- `check`: lint → format チェック → 型チェック → テスト → ビルド（ビルド後にプリレンダー結果を検証）
- `firestore-rules`: Java をセットアップして Firestore セキュリティルールのテスト

## 旧 WordPress テーマ

移行完了（P11）まではルート直下の `*.php`・`style.css`・`assets/` などを残す。
旧テーマのローカル確認は `docker compose up`（http://localhost:8081）。
旧テーマの `style.css` はルートの `tailwindcss@3` で生成しているため、P11 まで依存を残す。
