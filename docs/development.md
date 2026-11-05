# 開発ガイド

## 必要環境

- Node.js 22（`.nvmrc`）
- Java 11 以上（Firebase Emulator の Firestore・Storage に必要）
  - react-router v8・jsdom v30 は Node 22.22 以上が必要なため、現状は react-router 7 系・jsdom 29 系を使う

## セットアップ

```bash
npm install
```

## よく使うコマンド（リポジトリのルートで実行）

| コマンド                                  | 内容                                                                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                             | 開発サーバー起動（web）                                                                                                      |
| `npm run build`                           | 本番ビルド。`web/build/client/` に静的 HTML とアセットを出力                                                                 |
| `npm run build:deploy -w web`             | デプロイ用のビルド。Firebase の設定（deployment.md）が無いと失敗する                                                         |
| `npm run test`                            | Vitest でユニットテスト                                                                                                      |
| `npm run typecheck`                       | ルート（tests/・tools/）と各ワークスペースの `tsc`（web は React Router の型生成も行う）                                     |
| `npm run test:rules`                      | Firestore・Storage の Emulator でセキュリティルールのテスト（`tests/rules/`）。Java が必要                                   |
| `npm run test:integration`                | Functions・Firestore・Auth・Storage の Emulator で結合テスト（`tests/integration/`）。Java が必要                            |
| `npm run admin:grant -- <メールアドレス>` | 施工事例の管理画面の管理者を付ける（[管理者の付与](#管理者の付与施工事例の管理画面)）                                        |
| `npm run seed:case-studies`               | 旧サイトの施工事例 3 件を下書きで入れる（[case-studies.md](./case-studies.md#既存の施工事例の移行本番では-p10-の後に-1-回)） |
| `npm run lint`                            | ESLint                                                                                                                       |
| `npm run format` / `npm run format:check` | Prettier で整形 / 整形チェック                                                                                               |
| `npm run e2e -w web`                      | Playwright で E2E（axe・キーボード操作・画面遷移）。先に `npm run build`                                                     |
| `npm run e2e:admin`                       | 施工事例の管理画面の E2E（Auth・Firestore・Storage の Emulator を起動して実行）。Java が必要                                 |
| `npm run lighthouse -w web`               | Lighthouse CI（モバイル）で主要ページを計測。先に `npm run build`                                                            |
| `npm run serve:static -w web`             | ビルド済みのサイトを Firebase Hosting と同じ振り分けで配信（http://127.0.0.1:4313）                                          |

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
- 施工事例の管理画面（`/admin/`）は上の対象外（`testIgnore: 'admin/**'`）。管理画面は Firebase につながないと中身が出ないため、
  次の「管理画面の E2E」で Emulator につないで確かめる

### 管理画面の E2E（`npm run e2e:admin`）

`web/e2e/admin/` に置き、ルートの `npm run e2e:admin` が `firebase emulators:exec --only auth,firestore,storage` の中で
`web/playwright.admin.config.ts` を実行する。管理画面は Emulator につなぐビルド（`VITE_USE_FIREBASE_EMULATORS=true`）が要るため、
本番向けのビルド（`web/build/`）を上書きしないよう、開発サーバー（`react-router dev`。ポート 4314）で配信する。

```bash
npx -w web playwright install chromium   # 初回のみ
npm run e2e:admin
# 画面のスクリーンショットも保存する場合
ADMIN_SCREENSHOT_DIR=/tmp/admin-shots npm run e2e:admin
```

- テストごとに Auth・Firestore のデータを消し、管理者（`admin` クレーム付き）と一般のアカウントを Admin SDK で作る
- 内容: 権限のないアカウント（「権限がありません」でログアウト）、ログイン → 写真付きで新規作成（ブラウザで webp に縮小して Storage へ。E2E は Chromium のみ）→
  公開 → 未ログインの REST で読める → 非公開で読めなくなる → 編集 → 削除で写真のファイルも消える、未保存で離れるときの確認、
  スマホ幅で一覧の表が枠の中で横にスクロールすること。ログイン・一覧・編集・確認ダイアログを axe（WCAG 2.1 A・AA）で検査する

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
- トップページは写真の xsmall を足した後も目標に届いていない（原因と計測値は [migration-progress.md](./migration-progress.md) の「問題・ブロッカー」）。
  error にすると常に CI が失敗するため、warn で推移を見る。これ以上の軽量化（フォント・JS）は行わない（ユーザー判断、2026-11-05）

Chrome はローカルではインストール済みの Google Chrome、CI では ubuntu-latest の Google Chrome を使う。
Chrome が入っていない環境（Claude Code のクラウド環境など）では、Playwright の Chromium を `CHROME_PATH` で指定する
（例: `CHROME_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npm run lighthouse -w web`）。

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
| Auth        | 9099                                        |
| Storage     | 9199                                        |

Hosting の Emulator は `web/build/client` を配信するため、事前に `npm run build` しておく。

Functions の Emulator は、フォームの通知先のパラメータを `functions/.env.demo-willfrontier`（コミット済み。`example.com` の仮のアドレス）から読む。
手元だけ変えたい場合は `functions/.env.local`（リポジトリには含めない。こちらが優先）に書く。
理由と、App Check・メール送信の確認方法は [forms.md](./forms.md#ローカル開発emulator) を参照。

### セキュリティルールのテスト（`npm run test:rules`）

`tests/rules/` に置き、`firebase emulators:exec --only firestore,storage --project demo-willfrontier-rules` の中で
`@firebase/rules-unit-testing` を使って実行する（設定は `vitest.rules.config.ts`）。

- `firestore.rules.test.ts`: `inquiries`・`mail` ほかのコレクションは、未ログイン・ログイン済みとも読み書きできないこと
- `caseStudies.rules.test.ts`: 未ログイン・一般ユーザー・admin × 公開・下書き × get / list / create / update / delete。
  公開の一覧は `where('status', '==', 'published')` 付きのクエリだけが通ること。
  不正なデータ（項目の欠け・余分な項目・長すぎ・写真 0 枚と 5 枚・`status` の不正・`updatedBy` のなりすまし・
  `updatedAt` がサーバーの時刻でない）は admin でも拒否されること。上限は `@wf/shared` の定数を使い、ルールとずれたら失敗する
- `storage.rules.test.ts`: `case-studies/` の下は誰でも読め、admin だけが決まったパスに webp・JPEG（拡張子と形式が合うもの。2MB まで）を書き込み・削除できること

### 管理者の付与（施工事例の管理画面）

管理画面（`/admin/`）には新規登録・パスワード再設定の機能を置かない。アカウントとカスタムクレーム `admin: true` は、
開発側が `tools/grant-admin.ts`（Admin SDK）で付ける。
ルートの `scripts/` は旧 WordPress テーマ用（lint・format の対象外）のため、新しい運用スクリプトは `tools/` に置く
（`node --experimental-strip-types` で TypeScript のまま実行し、lint・format・型チェックの対象にする）。

```bash
# Emulator（firebase.json の Auth のポート 9099）。npm run emulators で起動しておく
npm run admin:grant -- --emulator editor@example.com                 # いなければ作成して admin を付ける。初期パスワードを表示
npm run admin:grant -- --emulator --reset-password editor@example.com  # パスワードを再発行
npm run admin:grant -- --emulator --revoke editor@example.com          # admin を外す（ユーザーは残す）
npm run admin:grant -- --emulator --list                               # 管理者の一覧

# 本番（Application Default Credentials の権限で実行する）
gcloud auth application-default login
npm run admin:grant -- --project <本番のプロジェクト ID> editor@example.com
```

- 接続先は `--emulator` → 環境変数 `FIREBASE_AUTH_EMULATOR_HOST` → 本番の順に決める。プロジェクトは
  `--project` → `GOOGLE_CLOUD_PROJECT`・`GCLOUD_PROJECT` → `.firebaserc` の default。`demo-` のプロジェクトは Emulator でしか使えない
- 初期パスワードは作成・再発行のときに一度だけ表示する。本人に安全な方法で伝える
- 付けた権限は次にログインしたとき（ID トークンの更新時）から有効になる。外すとリフレッシュトークンも無効にするが、
  発行済みの ID トークン（最長 1 時間）はそのまま使えるため、すぐに止めたいときは管理画面を再読み込みしてもらう
- Emulator の Auth のユーザーは Emulator を止めると消える。起動のたびに付け直す

### 結合テスト（`npm run test:integration`）

`tests/integration/` に置き、functions をビルドしてから `firebase emulators:exec --only functions,firestore,auth,storage --project demo-willfrontier` の中で Vitest を実行する
（設定は `vitest.integration.config.ts`）。画面と同じく Firebase JS SDK の `httpsCallable`（`connectFunctionsEmulator`）で `submitInquiry` を呼び、
保存された `inquiries`・`mail` を Admin SDK で読んで確かめる。テストごとに Firestore Emulator のデータを消す。

- 3 フォームとも `inquiries` と `mail` に同じ ID で 1 件ずつ保存し、`expireAt` が受付日時の 180 日後・30 日後であること
- 全角→半角（電話番号・メールアドレス）、改行コードの LF への統一、1 行の項目の改行の除去（件名に入る担当者名を含む）
- 宛先（パラメータ）、件名・本文、`replyTo` の有無（contact は無し、safety は入力時のみ、recruit は常に）
- 確認用メールアドレス・隠し項目・スキーマに無い項目を保存しないこと
- 隠し項目（`wf_hp`）に値があれば `{ ok: true }` を返して保存しないこと（入力に誤りがあっても同じ）
- 入力エラーは `invalid-argument` と `details.issues`（項目ごとのエラー）を返し、保存しないこと
- App Check のトークンを付けずに呼ぶ（Functions Emulator では強制しない）

`grantAdmin.test.ts` は Auth Emulator で `tools/grant-admin.ts` を確かめる（作成・既存のユーザー・ほかのクレームを残すこと・
外す・パスワードの再発行・一覧・接続先の決め方）。付けた `admin` が、ログインした画面の ID トークンに入ることまで見る。

`seedCaseStudies.test.ts` は Firestore・Storage の Emulator で `tools/seed-case-studies.ts` を確かめる（3 件が仮の日付・社名の下書きで入り、
スキーマに合うこと・写真が Storage にあり URL で読めること・再実行では上書きせずに止まり重複しないこと・`--force` で上書きすること・接続先の決め方）。

`caseStudyAdmin.test.ts` は、管理画面の Firebase の操作（`web/app/features/admin/firebaseAdminApi.ts`）を Auth・Firestore・Storage の
Emulator と本物のセキュリティルールで確かめる。管理者でログイン → 写真付きで作成（下書き）→ 未ログインでは読めない →
公開すると未ログインの REST（公開サイトと同じ読み方）で読める → 写真の差し替えで外した写真が消える → 削除で写真のファイルも消える、
パスワードの誤り・管理者でないアカウント（ログアウトさせる）も見る。写真の縮小（canvas）はブラウザでしか動かないため、
ここでは変換済みの webp・JPEG の代わりのデータを使う（縮小は `photos.test.ts` と管理画面の E2E で確かめる。
Safari の JPEG はアップロード・削除をここで、変換を `photos.test.ts` で確かめる）。

関数の細かい分岐は `functions/src/*.test.ts`（Firestore を差し替えた単体テスト）で確かめ、ここでは Emulator を通した組み合わせを見る。
宛先の期待値は、Emulator と同じ順（`.env` → `.env.demo-willfrontier` → `.env.local`）で `functions/` の値を重ねて求める（手元の `.env.local` で宛先を変えていても通る）。

## CI

`.github/workflows/ci.yml` で次の 6 ジョブを実行する。

- `check`: lint → format チェック → 型チェック → テスト → ビルド（ビルド後にプリレンダー結果を検証）
- `firestore-rules`: Java をセットアップして Firestore・Storage のセキュリティルールのテスト
- `integration`: Java をセットアップして Emulator での結合テスト（`npm run test:integration`）。宛先はコミット済みの `functions/.env.demo-willfrontier` を使う
- `e2e`: ビルド → Playwright の E2E。Chromium は Playwright のバージョンごとに `~/.cache/ms-playwright` をキャッシュする
  （OS の依存ライブラリは毎回 `playwright install-deps` で入れる）。失敗時はレポートを成果物として保存する
- `lighthouse`: ビルド → Lighthouse CI。レポートは成果物として保存する（Performance は warn）
- `e2e-admin`: Java と Chromium をセットアップして、Emulator につないだ管理画面の E2E（`npm run e2e:admin`）

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
トップのモザイクと MISSION の背景のように小さく表示する写真は、短辺 400px の xsmall（`web/public/media/photos/xsmall/`）も用意し、
`Picture` が `srcset` に加える。`python3 -I scripts/photo-xsmall.py` で large から書き出す（対象はスクリプト冒頭。
足りないものは `web/scripts/mediaManifest.test.ts` が検出する）。写真や加工版を作り直したときも書き出し直し、寸法一覧を更新する。
旧テーマの `style.css` はルートの `tailwindcss@3` で生成しているため、P11 まで依存を残す。
