# 残りの作業

P0〜P9 と、施工事例の管理画面は統合ブランチ `migration/react-firebase` にマージ済み（2026-11-04 時点）。
ここでは P10（デプロイ）・P11（WordPress 削除）と、ユーザーの判断・確認が必要な事項をまとめる。
フェーズごとの経緯は [migration-progress.md](./migration-progress.md)、各作業の詳しい手順はリンク先のドキュメントを参照。

## 0. 全体の流れと現在地

```
① ユーザーの準備（1 章） ──→ ② P10 デプロイ（2 章） ──→ ③ 本番切り替え（2 章の最後） ──→ ④ P11 WordPress 削除（4 章）
   ここで止まっている           preview channel で確認        DNS を切り替え                  main に取り込み
```

P9 の後に済ませたもの（2026-10〜11）:

| PR            | 内容                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| #42・#44・#49 | main（WordPress）に入ったクライアントの修正要望を React 版に取り込み（退職者が写る wf-100・掲載をやめた wf-087 の差し替えなど） |
| #50           | 依存の脆弱性（zod・body-parser など）を lockfile の更新で修正                                                                   |
| #51           | デプロイ用のビルド（`build:deploy`）で Firebase の設定が無ければ失敗させる                                                      |
| #52           | Emulator の結合テストを追加し、CI の `integration` ジョブで実行                                                                 |
| #53           | 細かい修正（workflow の説明文、mission のタイトル、採用フォームの入力例、Functions のアップロード対象）                         |
| #54〜#57      | 施工事例の管理画面（基盤・管理画面・既存データの移行・公開サイトの表示）。使い方は [case-studies.md](./case-studies.md)         |

## 1. ユーザーに準備してもらうもの（P10 の開始条件）

P10 は次がそろうまで始められない。

| #   | 項目                          | 内容                                                                                                             | 使う場所                                                                     |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | 本番の Firebase プロジェクト  | Blaze プランのプロジェクト ID。Firestore のロケーション（東京 `asia-northeast1` を想定）                         | `.firebaserc`（`willfrontier-hp` を別名 `prod` で登録済み）・CSP・拡張の設定 |
| 2   | メールの送信元と SMTP         | 差出人のアドレス（`DEFAULT_FROM`）、SMTP の接続文字列とパスワード、送信元ドメインの SPF・DKIM の設定             | Trigger Email 拡張（[forms.md](./forms.md#メール)）                          |
| 3   | フォームの通知先              | お問い合わせ・安全・採用の各フォームの宛先（複数可）                                                             | `CONTACT_MAIL_TO` / `SAFETY_MAIL_TO` / `RECRUIT_MAIL_TO`                     |
| 4   | 本番ドメインと切り替え時期    | 公開するドメイン（`https://willfrontier.jp`・www なしに決定）、DNS を切り替える日、sakura 環境を廃止するか       | `web/app/content/site.ts` の `SITE.url`・[deployment.md](./deployment.md)    |
| 5   | GitHub Actions からのデプロイ | Workload Identity Federation 用のサービスアカウントを作る権限（GCP の IAM 管理者）。作業はこちらで手順を用意する | `.github/workflows/`                                                         |

## 2. P10: デプロイ

上の準備がそろってから、次の順に進める。

### Firebase の設定

- [x] `.firebaserc` に本番のプロジェクトを追加する（`prod` → `willfrontier-hp`。Emulator 用の `demo-willfrontier` は default のまま残す）
- [x] Web アプリを登録し、`VITE_FIREBASE_API_KEY`・`VITE_FIREBASE_PROJECT_ID`・`VITE_FIREBASE_APP_ID`・`VITE_FIREBASE_STORAGE_BUCKET` を本番ビルドに渡す
      （`web/.env.production` にコミットして渡す）。
      渡し忘れると `firebase deploy` の predeploy（`npm run build:deploy`）が失敗する（[deployment.md](./deployment.md#フォームの送信に必要な設定firebase)）
- [ ] App Check に Fraud Defense（旧 reCAPTCHA Enterprise）を登録し、`VITE_RECAPTCHA_SITE_KEY` を設定する。開発用の debug token を登録する（[forms.md](./forms.md#app-checkfraud-defense)）。
      reCAPTCHA Classic（v3）は非推奨で登録できなかったため、コードは `ReCaptchaEnterpriseProvider` に変更済み
- [ ] トークンの再利用対策（limited-use トークン）が必要か判断する
- [x] Firestore のルール・インデックス（TTL と施工事例の複合インデックス）を反映する（`firebase deploy --only firestore`）。
      Firestore は `(default)` を `asia-northeast1` に作成した（2026-11-05）。
      ルールは「施工事例の公開分だけ誰でも読める・書き込みは管理者だけ、ほかは全拒否」
- [ ] App Check の debug token を使う経路を決める。今の実装は Emulator のときだけ debug token を有効にするが、Functions Emulator は App Check を強制しないため、
      本番のプロジェクトにつないだ開発用ビルドで使えるようにするか判断する（`web/app/lib/firebase.ts`）

### 施工事例の管理画面（[case-studies.md](./case-studies.md)）

- [x] Firebase Authentication を有効にする（メールとパスワードのみ）。新規登録はさせないため、コンソールで「ユーザーによるアカウント作成」を無効にする（2026-11-05）
- [x] Cloud Storage を有効にし、`storage.rules` を反映する（`firebase deploy --only storage`）。既定のバケットは `asia-northeast1`（2026-11-05）。バケット名を `VITE_FIREBASE_STORAGE_BUCKET` で本番ビルドに渡す
- [ ] `npm run admin:grant -- --project <ID> <メールアドレス>` で管理者のアカウントを作り、初期パスワードを担当者に伝える
- [ ] 本番で `npm run seed:case-studies -- --project <ID>` を 1 回実行し、旧サイトの 3 件（下書き）の日付・社名・分類を管理画面で直して公開する
      （[case-studies.md](./case-studies.md#既存の施工事例の移行本番では-p10-の後に-1-回)）
- [ ] iPhone・Mac の Safari で、写真の追加（JPEG で保存される）を実際に試す（この環境には WebKit が無く、単体テストでしか確かめていない）
- [ ] 下書きの写真も URL を知っていれば見られる（Storage は `case-studies/**` を誰でも読める）。このままでよいか判断する
- [ ] 写真をアップロードしてから保存せずに閉じると、使われないファイルが Storage に残る。定期的に掃除するか判断する

### フォームのメール（Trigger Email 拡張）

[forms.md](./forms.md#メール) の「P10 で行うこと」のとおり。

- [x] `firebase.json` の `"extensions"` に `firebase/firestore-send-email` をバージョンを固定して登録する（0.2.10）
- [x] `extensions/firestore-send-email.env` の `DEFAULT_FROM`・`DATABASE_REGION` を確定する（`info@willfrontier.jp`・`asia-northeast1`）
- [ ] `firebase deploy --only extensions` で SMTP の接続文字列とパスワード（Secret Manager）を入力する（Google Workspace のアプリ パスワード。[forms.md](./forms.md#本番の送信元google-workspace)）
- [ ] 宛先のパラメータを本番用に設定する（`functions/.env.willfrontier-hp` をコミットする。3 フォームとも `info@willfrontier.jp`）
- [ ] `functions/` に専用の lockfile がない問題の方針を決める（[deployment.md](./deployment.md#既知の制約)）
- [x] 拡張機能の関数のロケーションを東京にする（`extensions/firestore-send-email.env` の `firebaseextensions.v1beta.function/location`）
- [ ] **メールの送信失敗に気づける仕組みを作る**。拡張機能が `mail` に `delivery.state=ERROR` を書いても通知されず、利用者には「送信しました」と出るため、
      問い合わせが気づかれずに失われる。Cloud Monitoring のログアラートなどで通知する（Functions の `internal` エラーも同様）
- [ ] 送信回数の制限（レート制限・重複送信の対策）を入れるか決める。今は App Check と `maxInstances: 5` だけ。limited-use トークンの判断とあわせて検討する
- [ ] 宛先のパラメータを、メールアドレスとして正しいかも確かめる（今は空かどうかだけ。`functions/src/handleInquiry.ts`）

### CSP（Report-Only）

[deployment.md](./deployment.md#content-security-policyreport-only) を参照。

- [ ] `connect-src` の `https://*.cloudfunctions.net` を `https://asia-northeast1-<プロジェクト ID>.cloudfunctions.net` に絞る（`web/scripts/hostingHeaders.test.ts` も合わせて直す）
- [ ] preview channel で reCAPTCHA の読み込みに CSP の違反が出ないことを確かめる
- [ ] 違反の報告を集めるか（`report-to` / `Reporting-Endpoints`）、強制（`Content-Security-Policy`）に切り替えるかを決める。
      強制にする場合は、postbuild で各ページのインラインスクリプトのハッシュを集めてヘッダーに入れる仕組みが必要

### デプロイの自動化

- [ ] GitHub Actions に Workload Identity Federation で Firebase へデプロイするジョブを追加する（鍵ファイルは使わない）- サービスアカウントに要るロール（Hosting・Functions・Firestore のルールとインデックス・Storage のルール・拡張機能・Secret Manager・Service Account User など）を整理する - **CI からのデプロイは対話入力ができない**ため、宛先のパラメータ（`functions/.env.<プロジェクト ID>` のコミットか CI での生成）と
      SMTP のパスワード（Secret Manager）を事前に用意する。リポジトリが公開なら、宛先のアドレスが公開されることも判断に入れる - 全体の `firebase deploy` は拡張機能も含むため、`--only` で範囲を決める
- [ ] PR ごとに preview channel へデプロイし、URL を PR に載せる
- [ ] preview channel に対して E2E を実行する（計画の TDD 対象）
- [ ] デプロイは CI を通過したコミットからだけ行う（`predeploy` はビルドのみで、型チェックとテストを含まないため）
- [ ] [deployment.md](./deployment.md) にデプロイ手順（初回の設定・通常のデプロイ・preview channel・切り戻し）を書く

### 本番前の確認（preview channel）

注意: preview channel は本番の Functions・Firestore・Storage・SMTP を使うため、確認や E2E の送信は本番のデータ・実際のメールになる。
また preview channel のドメイン（`*.web.app` など）を reCAPTCHA に登録しておく必要がある。

- [ ] 3 フォームから実際に送信し、`inquiries`・`mail` への保存とメールの受信を確かめる
- [ ] 受信したメールで、送信元ドメインの SPF・DKIM が通っていることを確かめる
- [ ] 送信に失敗したときの案内（本社の電話番号）が出ることを確かめる
- [ ] iPhone の Safari で、メニューを開いたときやイントロ中に背景がスクロールしないか確かめる（既知の制限）
- [ ] JS が動かない環境では動画の場所が黒いままになる（P9 で poster を画面に近づいてから付けるようにしたため）。このままでよいか判断する
- [ ] 色を直したあとの Lighthouse を計り直し、[migration-progress.md](./migration-progress.md) の表を更新する
- [ ] 管理画面でログイン → 事例の作成 → 公開 → 公開サイトに出る → 非公開 → 削除までを、本番の設定で一通り試す

### 本番切り替え

[deployment.md](./deployment.md#本番切り替え時の-seo-設定) を参照。

- [x] `SITE.url` を本番ドメインに変更する（canonical・OGP・sitemap・JSON-LD に使う。`https://willfrontier.jp`）
- [ ] 本番のビルドだけ `VITE_ALLOW_INDEXING=true` にする（preview channel では設定しない）
- [ ] Firebase Hosting にカスタムドメインを追加し、DNS を切り替える
- [ ] `www.willfrontier.jp` もカスタムドメインに追加し、`willfrontier.jp` へ転送する（正式な URL は www なし）
- [ ] 切り替え後、Google Search Console に sitemap を登録する
- [ ] Lighthouse CI の SEO を判定の対象に入れる（現在は noindex のため必ず 69 点で、判定していない。[development.md](./development.md#lighthouse-ci)）
- [ ] sakura 環境の扱いを決める（残す期間・廃止の時期）

## 3. P10 を待たずに進められるもの

- [x] **Emulator での結合テスト**（計画の P8 の TDD 対象）。`npm run test:integration`（`tests/integration/`）で
      3 フォームの送信から `inquiries`・`mail` への書き込みまでを確かめ、CI の `integration` ジョブでも実行する。
      宛先は `functions/.env.demo-willfrontier`（`example.com` の仮のアドレス）をコミットして用意した（理由は [forms.md](./forms.md#宛先のパラメータ)）
- [x] トップページの写真を表示幅に合った小さいサイズでも書き出す。モザイクと MISSION の背景の 7 枚に短辺 400px の xsmall を足した
      （2026-11-05。計測値は [migration-progress.md](./migration-progress.md) の「問題・ブロッカー」）
- [x] トップページの Performance を 85 に上げる → **対応しない**（ユーザー判断、2026-11-05）。写真の軽量化で 70 前後まで上がった。
      残りの原因は全ページ共通の JS（約 180KB）と Google Fonts の CSS（約 117KB）、JS の実行時間で、フォントの自前配信やサブセット化などはこれ以上行わない。
      Lighthouse CI の Performance は `warn` のまま（[development.md](./development.md#lighthouse-ci)）
- [ ] `npm audit` の残り（@grpc/grpc-js・uuid・開発ツール経由のもの）は上流の更新待ち。内容は [migration-progress.md](./migration-progress.md) の「問題・ブロッカー」
- [ ] 小さな改善（優先度は低い）
  - ボットが隠し項目 `wf_hp` を数値で送ると `invalid-argument` と項目名が返る（`functions/src/handleInquiry.ts`）。docs の「入力エラーの詳細を返さない」と食い違う
  - 画面を通さない送信で、zod の英語の既定メッセージがそのまま返る
  - 通知メールに受付日時・ドキュメント ID が無く、`inquiries` と照合しにくい（`functions/src/buildMail.ts`）
  - reCAPTCHA のバッジの表示（隠す場合は規約の文言が必要）
  - `@wf/shared` を 1 つの入口から読むため、フォームのページに施工事例のスキーマも含まれる

## 4. P11: WordPress 関連ファイルの削除

本番を Firebase Hosting に切り替え、sakura へのデプロイが不要になってから行う。

- [ ] 削除するもの: `*.php`、`style.css`、`src/`、`tailwind.config.js`、`docker/`・`docker-compose.yml`、`scripts/build-static.sh`・`scripts/build-all-static.sh`・`scripts/run-all-patterns.sh`、`assets/js/`、`.wrangler/`
- [ ] 旧テーマだけが参照している素材を削除する（葉の png、背景イラストの原寸の jpg など。[architecture.md](./architecture.md)・[migration-progress.md](./migration-progress.md) に記載）
- [ ] 施工事例を Firestore に移した後の旧写真（`web/public/media/photos` の `wf-106`〜`wf-111`・`wf-048`・`wf-050`・`wf-037`）を削除する
      （`page-casestudy.php` と `tools/seed-case-studies.ts` が参照している。本番で seed を実行した後に。[case-studies.md](./case-studies.md)）
- [ ] ルートの `tailwindcss@3` など、旧テーマのビルドにだけ使う依存を外す
- [ ] 削除リストから漏れていたもの: `scripts/package.json`（`scripts/generate-pdfs.js` 用。docker の WordPress が前提）、
      `assets/photos/_index.md`・`assets/videos/_index.md`（移すか消すか）、`.gitignore`・`.prettierignore`・`eslint.config.mjs` の旧テーマ用の記述
- [ ] PHP を消すと `web/scripts/mediaReferences.test.ts` の旧テーマの検証（`phpFiles.length > 0`）と `normalizeThemeSource` が不要になるので、同時に削除する。
      素材を消したら `npm run media:manifest -w web` で寸法の一覧を作り直す
- [ ] CI（`.github/workflows/ci.yml`）の対象ブランチから `migration/react-firebase` を外す
- [ ] `main` には移行ブランチに無いクライアントの修正が入ることがある。取り込む前に、main の新しいコミットが React 版に反映済みか確かめる
      （2026-10 の修正 #41〜#48 は反映済み）
- [ ] git 管理外のローカルのファイル（旧サイトのミラー `static/`、`will-frontier-pattern-*.pdf`）を残すか決める（リポジトリからの削除は不要）
- [ ] `scripts/generate-pdfs.js` を残すか決める（ユーザー確認待ち）
- [ ] `docs/3patterns-presentation.md` のデモ URL（旧サイト）を直すか、資料ごと削除するか決める
- [ ] `docs/` を更新する（`deployment.md` の sakura の節、`development.md` の旧テーマの節など）
- [ ] `migration/react-firebase` を `main` に取り込む（`main` は sakura へ rsync しているため、切り替えと削除が済むまで触らない）
- [ ] `data/`（生素材）は git 履歴から消さない（ユーザー判断、2026-09-28）

## 5. 内容の確認（ユーザーの判断待ち）

旧サイトの内容をそのまま移植したもの、または仮の値を入れたもの。

| #   | 箇所                                           | 内容                                                                                                                                                                                                                                                                                                                                                                         |
| --- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ミッションページの本文                         | 解消（2026-11-04）: パンフレットの文面に合わせ「当社は、地域の方々に住みやすく、…約束いたします」「毎日２回行っている」に直した                                                                                                                                                                                                                                              |
| 2   | 車両ページの副題                               | 解消（2026-11-05）: 種類の数を外し「現場を支える頼れる相棒たち」にした                                                                                                                                                                                                                                                                                                       |
| 3   | 安全ページの取り組み                           | 解消（2026-11-05）: 3 件目（打ち合わせの写真）の見出しを【安全会議】にした。説明文は「毎朝の安全朝礼で…」のまま                                                                                                                                                                                                                                                              |
| 4   | 採用ページの 1 日の流れ                        | 時刻「AM 00:00」が仮の値                                                                                                                                                                                                                                                                                                                                                     |
| 5   | 採用フォームの個人情報の文面                   | 利用目的の文面（仮）、送信内容の保持期間（`inquiries` 180 日・`mail` 30 日の提案値）。プライバシーポリシーのページが無い                                                                                                                                                                                                                                                     |
| 6   | トップの CASE STUDY                            | 解消: 施工事例は管理画面で編集する形にし、仮の値（`2026.00.00`・`○○○○○○`）の 4 件は移さない。旧サイトの 3 件は下書きで移す（2 章の施工事例）                                                                                                                                                                                                                                 |
| 7   | トップページの表示速度                         | 写真は対応済み（2026-11-05）: モザイクと MISSION の背景に短辺 400px の版を足した。85 には届かないが、これ以上の軽量化（フォント・JS）はしない（ユーザー判断、2026-11-05）                                                                                                                                                                                                    |
| 8   | トップの VEHICLE LINEUP                        | 車両ではなく現場写真（安全朝礼・選別作業・チームワーク）が入っている                                                                                                                                                                                                                                                                                                         |
| 9   | 各ページのタイトルと説明文（meta description） | 2026-11-11 に検索向けに見直した（日本語で始める・トップに地域名・説明文 70〜120 字。[architecture.md](./architecture.md)）。施工事例を公開したら、`casestudy` の説明文を事例の内容に合わせて書き換える。採用の勤務地・雇用形態が決まったら `recruit` に足す。「15 品目の許可」は根拠がサービスページの画像の代替テキストだけのため、許可証と照合するまで説明文に入れていない |
| 10  | OGP 画像と favicon                             | OGP は写真 `wf-097` を切り出した仮の選定。favicon はロゴの「F」の部分から作った                                                                                                                                                                                                                                                                                              |
| 11  | 構造化データ（JSON-LD）                        | 解消（2026-11-05）: 迷惑メールを避けるため、本社のメールアドレスは載せない（会社概要の画面には表示したまま）                                                                                                                                                                                                                                                                 |
| 12  | `scripts/generate-pdfs.js`                     | P11 で残すか                                                                                                                                                                                                                                                                                                                                                                 |
| 13  | ヘッダーナビの「COMPANY」                      | 解消（2026-11-05）: ヘッダーを MISSION・SERVICE・WORKFLOW・VEHICLES・CASE・COMPANY にし、COMPANY はトップの会社概要（`/#company`）を指す                                                                                                                                                                                                                                     |

## 6. 片付け（ユーザーの確認後に行う）

- PR に載せる画像の置き場に使ったブランチ（リモートの `pr-assets/p7`・`pr-assets/p9`、ローカルの `pr-assets/p6`）。消すと PR の画像が表示されなくなる
- マージ済みのフェーズごとのブランチ（`migration/p0-*`〜`migration/p9-*`）と、その後のブランチ
  （`migration/port-main-fixes`・`migration/audit-fix`・`migration/p10-*`・`migration/p8-emulator-integration`・`migration/cms-p*`・`fix/*-react`）
- サブエージェントが作業に使った worktree（`.claude/worktrees/`）
