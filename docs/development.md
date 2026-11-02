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

| コマンド                                  | 内容                                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------------------- |
| `npm run dev`                             | 開発サーバー起動（web）                                                             |
| `npm run build`                           | 本番ビルド。`web/build/client/` に静的 HTML とアセットを出力                        |
| `npm run test`                            | Vitest でユニットテスト                                                             |
| `npm run typecheck`                       | ルート（tests/）と各ワークスペースの `tsc`（web は React Router の型生成も行う）    |
| `npm run test:rules`                      | Firestore Emulator でセキュリティルールのテスト（`tests/rules/`）。Java が必要      |
| `npm run test:integration`                | Functions・Firestore の Emulator で結合テスト（`tests/integration/`）。Java が必要  |
| `npm run lint`                            | ESLint                                                                              |
| `npm run format` / `npm run format:check` | Prettier で整形 / 整形チェック                                                      |
| `npm run e2e -w web`                      | Playwright で E2E（axe・キーボード操作・画面遷移）。先に `npm run build`            |
| `npm run lighthouse -w web`               | Lighthouse CI（モバイル）で主要ページを計測。先に `npm run build`                   |
| `npm run serve:static -w web`             | ビルド済みのサイトを Firebase Hosting と同じ振り分けで配信（http://127.0.0.1:4313） |

`web` 単体では `npm run test:watch -w web` でウォッチ実行できる。

## E2E（Playwright + axe）

`web/e2e/` に置き、ビルド済みの静的サイト（`web/build/client`）に対して Chromium で実行する。
Vitest（`npm run test`）の対象は `web/app`・`web/scripts` の `*.test.ts(x)` だけで、E2E（`*.spec.ts`）は含まれない。

```bash
npm run build
npx -w web playwright install chromium   # 初回のみ
npm run e2e -w web
```

- 配信は `web/scripts/serve-static.ts`（ポート 4313）。`vite preview` は存在しない URL にも 200 でトップを返すため使わず、
  Firebase Hosting と同じく `404.html` を 404 で返し、末尾スラッシュなしの URL を 301 で移す（振り分けは `scripts/staticRouting.ts`）。
  `playwright.config.ts` の `webServer` が自動で起動する（起動済みなら使い回す。CI では毎回起動する）
- 内容
  - `a11y.spec.ts`: 全 9 ページと 404 を PC（1280px）・スマホ（375px）幅で axe（WCAG 2.1 A・AA）検査する。
    スクロールで表示する要素やイントロの幕が検査の邪魔をしないよう「動きを減らす」設定で開く
  - `keyboard.spec.ts`: スキップリンク、スマホ幅のハンバーガーメニュー（Enter で開く・フォーカストラップ・Esc で閉じてボタンへ戻る）
  - `forms.spec.ts`: 3 フォームの未入力送信（エラーと最初の必須項目へのフォーカス）と、送信に失敗したときの案内。
    送信処理（Firebase）は呼ばない（127.0.0.1 以外への通信を遮断する）。送信処理は Vitest と Emulator で確認する
  - `navigation.spec.ts`: フッターナビで下層ページから `/#company`・`/#vehicles` へ移動し、ブラウザの「戻る」で戻る。404 と末尾スラッシュ
  - `console.spec.ts`: 全ページで hydrate の不整合などのコンソールエラーが出ない
- **色のコントラスト**: やむを得ず許容するコントラスト不足は `web/e2e/support/knownContrastIssues.ts` の色の組み合わせ（前景色 × 背景色）に限る（許容した箇所はテスト結果に添付される）。
  P9 で旧デザインの色を直したため、現在は空。一覧にない組み合わせのコントラスト不足と、ほかのルールの違反はテストを失敗させる。
  色のトークン同士の組み合わせは `web/scripts/designTokens.test.ts`（Vitest）でも 4.5:1 以上を確かめる
- 結果（失敗時のトレース・HTML レポート）は `web/test-results/`・`web/playwright-report/` に出力する（リポジトリには含めない）

## Lighthouse CI

`web/lighthouserc.json` の設定で、トップ・service・safety・recruit・contact をモバイル設定（Lighthouse の既定。
低速 4G・CPU 4 倍遅延のシミュレーション）で 3 回ずつ計測し、中央値で判定する。レポートは `web/.lighthouseci/` に出力する（リポジトリには含めない）。

```bash
npm run build
npm run lighthouse -w web
```

| カテゴリ       | 目標    | 判定                                                                                          |
| -------------- | ------- | --------------------------------------------------------------------------------------------- |
| Performance    | 85 以上 | `warn`（下記の理由）                                                                          |
| Accessibility  | 95 以上 | `error`                                                                                       |
| Best Practices | 95 以上 | `error`                                                                                       |
| SEO            | —       | 判定しない（本番切り替えまで全ページ noindex のため `is-crawlable` が必ず失敗し 69 点になる） |

Performance を `warn` にとどめる理由:

- シミュレーションの計測値は、実行するマシン（GitHub Actions のランナーは共有で性能が揺れる）と外部の Google Fonts の応答で数点〜10 点ほど変わる
- トップページは現状 76 点前後で目標に届いていない（原因は [migration-progress.md](./migration-progress.md) の「問題・ブロッカー」）。
  error にすると常に CI が失敗するため、改善するまでは warn で推移を見る

Chrome はローカルではインストール済みの Google Chrome、CI では ubuntu-latest の Google Chrome を使う。

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

Functions の Emulator は、フォームの通知先のパラメータを `functions/.env.demo-willfrontier`（コミット済み。`example.com` の仮のアドレス）から読む。
手元だけ変えたい場合は `functions/.env.local`（リポジトリには含めない。こちらが優先）に書く。
理由と、App Check・メール送信の確認方法は [forms.md](./forms.md#ローカル開発emulator) を参照。

### 結合テスト（`npm run test:integration`）

`tests/integration/` に置き、functions をビルドしてから `firebase emulators:exec --only functions,firestore --project demo-willfrontier` の中で Vitest を実行する
（設定は `vitest.integration.config.ts`）。画面と同じく Firebase JS SDK の `httpsCallable`（`connectFunctionsEmulator`）で `submitInquiry` を呼び、
保存された `inquiries`・`mail` を Admin SDK で読んで確かめる。テストごとに Firestore Emulator のデータを消す。

- 3 フォームとも `inquiries` と `mail` に同じ ID で 1 件ずつ保存し、`expireAt` が受付日時の 180 日後・30 日後であること
- 全角→半角（電話番号・メールアドレス）、改行コードの LF への統一、1 行の項目の改行の除去（件名に入る担当者名を含む）
- 宛先（パラメータ）、件名・本文、`replyTo` の有無（contact は無し、safety は入力時のみ、recruit は常に）
- 確認用メールアドレス・隠し項目・スキーマに無い項目を保存しないこと
- 隠し項目（`wf_hp`）に値があれば `{ ok: true }` を返して保存しないこと（入力に誤りがあっても同じ）
- 入力エラーは `invalid-argument` と `details.issues`（項目ごとのエラー）を返し、保存しないこと
- App Check のトークンを付けずに呼ぶ（Functions Emulator では強制しない）

関数の細かい分岐は `functions/src/*.test.ts`（Firestore を差し替えた単体テスト）で確かめ、ここでは Emulator を通した組み合わせを見る。
宛先の期待値は、Emulator と同じ順（`.env` → `.env.demo-willfrontier` → `.env.local`）で `functions/` の値を重ねて求める（手元の `.env.local` で宛先を変えていても通る）。

## CI

`.github/workflows/ci.yml` で次の 5 ジョブを実行する。

- `check`: lint → format チェック → 型チェック → テスト → ビルド（ビルド後にプリレンダー結果を検証）
- `firestore-rules`: Java をセットアップして Firestore セキュリティルールのテスト
- `integration`: Java をセットアップして Emulator での結合テスト（`npm run test:integration`）。宛先はコミット済みの `functions/.env.demo-willfrontier` を使う
- `e2e`: ビルド → Playwright の E2E。Chromium は Playwright のバージョンごとに `~/.cache/ms-playwright` をキャッシュする
  （OS の依存ライブラリは毎回 `playwright install-deps` で入れる）。失敗時はレポートを成果物として保存する
- `lighthouse`: ビルド → Lighthouse CI。レポートは成果物として保存する（Performance は warn）

## 旧 WordPress テーマ

移行完了（P11）まではルート直下の `*.php`・`style.css`・`assets/` などを残す。
旧テーマのローカル確認は `docker compose up`（http://localhost:8081）。
画像・動画は P4 で `web/public/media/` へ移動したため、旧テーマもそこを参照している（`assets/` には `js/` と、git 管理外の元素材の索引 `_index.md` だけが残る。未使用の素材は削除済み）。

新しい写真・動画を使う場合は `web/public/media/` に置く。ソースから参照したファイル（写真スラッグ `wf-NNN`、
動画スラッグ `shorts/sNN`、`/media/...` のパス）が実在することは `web/scripts/mediaReferences.test.ts` が検証する。
検証対象は `web/app` のソースと、旧テーマ（ルート直下の `*.php`）。動画スラッグは `shorts/sNN` 形式だけを検出するため、別の形式を使う場合は正規表現も直す。
動画の poster は `ffmpeg -ss 1 -i sNN.mp4 -frames:v 1 -q:v 5 sNN.jpg` で作る。
写真・poster を追加・差し替えたら `npm run media:manifest -w web` で寸法一覧（`web/app/lib/mediaManifest.json`）を作り直す。
作り直し忘れは `web/scripts/mediaManifest.test.ts` が検出する。
トップヒーローの写真は、9 枚とも明るさをそろえた加工版（`wf-NNN-hero`）を使う。
元の写真は他ページでも使うので上書きしない。加工版は `python3 -I scripts/hero-highkey.py` で作り直せる（トーンの値はスクリプト冒頭）。
作り直した後は `npm run media:manifest -w web` で寸法一覧も更新する。
旧テーマの `style.css` はルートの `tailwindcss@3` で生成しているため、P11 まで依存を残す。
