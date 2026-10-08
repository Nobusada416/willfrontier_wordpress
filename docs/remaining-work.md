# 残りの作業

P0〜P9 は統合ブランチ `migration/react-firebase` にマージ済み（2026-10-08 時点）。
ここでは P10（デプロイ）・P11（WordPress 削除）と、ユーザーの判断・確認が必要な事項をまとめる。
フェーズごとの経緯は [migration-progress.md](./migration-progress.md)、各作業の詳しい手順はリンク先のドキュメントを参照。

## 1. ユーザーに準備してもらうもの（P10 の開始条件）

P10 は次がそろうまで始められない。

| #   | 項目                          | 内容                                                                                                             | 使う場所                                                                   |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | 本番の Firebase プロジェクト  | Blaze プランのプロジェクト ID。Firestore のロケーション（東京 `asia-northeast1` を想定）                         | `.firebaserc`（現在は Emulator 用の `demo-willfrontier`）・CSP・拡張の設定 |
| 2   | メールの送信元と SMTP         | 差出人のアドレス（`DEFAULT_FROM`）、SMTP の接続文字列とパスワード、送信元ドメインの SPF・DKIM の設定             | Trigger Email 拡張（[forms.md](./forms.md#メール)）                        |
| 3   | フォームの通知先              | お問い合わせ・安全・採用の各フォームの宛先（複数可）                                                             | `CONTACT_MAIL_TO` / `SAFETY_MAIL_TO` / `RECRUIT_MAIL_TO`                   |
| 4   | 本番ドメインと切り替え時期    | 公開するドメイン（現在は旧サイトの URL を仮に設定）、DNS を切り替える日、sakura 環境を廃止するか                 | `web/app/content/site.ts` の `SITE.url`・[deployment.md](./deployment.md)  |
| 5   | GitHub Actions からのデプロイ | Workload Identity Federation 用のサービスアカウントを作る権限（GCP の IAM 管理者）。作業はこちらで手順を用意する | `.github/workflows/`                                                       |

## 2. P10: デプロイ

上の準備がそろってから、次の順に進める。

### Firebase の設定

- [ ] `.firebaserc` に本番のプロジェクトを追加する（Emulator 用の `demo-willfrontier` は残す）
- [ ] Web アプリを登録し、`VITE_FIREBASE_API_KEY`・`VITE_FIREBASE_PROJECT_ID`・`VITE_FIREBASE_APP_ID` を本番ビルドに渡す
- [ ] App Check に reCAPTCHA v3 を登録し、`VITE_RECAPTCHA_SITE_KEY` を設定する。開発用の debug token を登録する（[forms.md](./forms.md#app-checkrecaptcha-v3)）
- [ ] トークンの再利用対策（limited-use トークン）が必要か判断する
- [ ] Firestore の TTL を反映する（`firebase deploy --only firestore:indexes`）。セキュリティルールは全拒否のまま反映する

### フォームのメール（Trigger Email 拡張）

[forms.md](./forms.md#メール) の「P10 で行うこと」のとおり。

- [ ] `firebase.json` の `"extensions"` に `firebase/firestore-send-email` をバージョンを固定して登録する
- [ ] `extensions/firestore-send-email.env` の `DEFAULT_FROM`・`DATABASE_REGION` を確定する
- [ ] `firebase deploy --only extensions` で SMTP の接続文字列とパスワード（Secret Manager）を入力する
- [ ] 宛先のパラメータを本番用に設定する（`functions/.env.<プロジェクト ID>` をコミットするか、デプロイ時の入力にするかを決める）
- [ ] `functions/` に専用の lockfile がない問題の方針を決める（[deployment.md](./deployment.md#既知の制約)）

### CSP（Report-Only）

[deployment.md](./deployment.md#content-security-policyreport-only) を参照。

- [ ] `connect-src` の `https://*.cloudfunctions.net` を `https://asia-northeast1-<プロジェクト ID>.cloudfunctions.net` に絞る（`web/scripts/hostingHeaders.test.ts` も合わせて直す）
- [ ] preview channel で reCAPTCHA の読み込みに CSP の違反が出ないことを確かめる
- [ ] 違反の報告を集めるか（`report-to` / `Reporting-Endpoints`）、強制（`Content-Security-Policy`）に切り替えるかを決める。
      強制にする場合は、postbuild で各ページのインラインスクリプトのハッシュを集めてヘッダーに入れる仕組みが必要

### デプロイの自動化

- [ ] GitHub Actions に Workload Identity Federation で Firebase へデプロイするジョブを追加する（鍵ファイルは使わない）
- [ ] PR ごとに preview channel へデプロイし、URL を PR に載せる
- [ ] preview channel に対して E2E を実行する（計画の TDD 対象）
- [ ] デプロイは CI を通過したコミットからだけ行う（`predeploy` はビルドのみで、型チェックとテストを含まないため）
- [ ] [deployment.md](./deployment.md) にデプロイ手順（初回の設定・通常のデプロイ・preview channel・切り戻し）を書く

### 本番前の確認（preview channel）

- [ ] 3 フォームから実際に送信し、`inquiries`・`mail` への保存とメールの受信を確かめる
- [ ] 受信したメールで、送信元ドメインの SPF・DKIM が通っていることを確かめる
- [ ] 送信に失敗したときの案内（本社の電話番号）が出ることを確かめる
- [ ] iPhone の Safari で、メニューを開いたときやイントロ中に背景がスクロールしないか確かめる（既知の制限）
- [ ] JS が動かない環境では動画の場所が黒いままになる（P9 で poster を画面に近づいてから付けるようにしたため）。このままでよいか判断する
- [ ] 色を直したあとの Lighthouse を計り直し、[migration-progress.md](./migration-progress.md) の表を更新する

### 本番切り替え

[deployment.md](./deployment.md#本番切り替え時の-seo-設定) を参照。

- [ ] `SITE.url` を本番ドメインに変更する（canonical・OGP・sitemap・JSON-LD に使う）
- [ ] 本番のビルドだけ `VITE_ALLOW_INDEXING=true` にする（preview channel では設定しない）
- [ ] Firebase Hosting にカスタムドメインを追加し、DNS を切り替える
- [ ] 切り替え後、Google Search Console に sitemap を登録する
- [ ] Lighthouse CI の SEO を判定の対象に入れる（現在は noindex のため必ず 69 点で、判定していない。[development.md](./development.md#lighthouse-ci)）
- [ ] sakura 環境の扱いを決める（残す期間・廃止の時期）

## 3. P10 を待たずに進められるもの

- [ ] **Emulator での結合テスト**（計画の P8 の TDD 対象で、未実施）。`functions/.env.local`（git 管理外。宛先は `example.com` の仮のアドレス）を作り、
      3 フォームの送信から `inquiries`・`mail` への書き込みまでを確かめる（[forms.md](./forms.md#ローカル開発emulator)）。
      P8 の作業中はファイルの作成が許可されず実行できなかった
- [ ] トップページの写真を表示幅に合った小さいサイズでも書き出す（下の「内容の確認」の 7 番の判断による）。
      目標の 85 に届いたら、Lighthouse CI の Performance を `warn` から `error` に戻す（[development.md](./development.md#lighthouse-ci)）
- [ ] `npm audit` で firebase-admin 経由の uuid（moderate）が残っている。本件の使い方は影響を受けないため、上流の更新を待って依存を上げる

## 4. P11: WordPress 関連ファイルの削除

本番を Firebase Hosting に切り替え、sakura へのデプロイが不要になってから行う。

- [ ] 削除するもの: `*.php`、`style.css`、`src/`、`tailwind.config.js`、`docker/`・`docker-compose.yml`、`scripts/build-static.sh`・`scripts/build-all-static.sh`・`scripts/run-all-patterns.sh`、`assets/js/`、`.wrangler/`
- [ ] 旧テーマだけが参照している素材を削除する（葉の png、背景イラストの原寸の jpg など。[architecture.md](./architecture.md)・[migration-progress.md](./migration-progress.md) に記載）
- [ ] ルートの `tailwindcss@3` など、旧テーマのビルドにだけ使う依存を外す
- [ ] git 管理外のローカルのファイル（旧サイトのミラー `static/`、`will-frontier-pattern-*.pdf`）を残すか決める（リポジトリからの削除は不要）
- [ ] `scripts/generate-pdfs.js` を残すか決める（ユーザー確認待ち）
- [ ] `docs/3patterns-presentation.md` のデモ URL（旧サイト）を直すか、資料ごと削除するか決める
- [ ] `docs/` を更新する（`deployment.md` の sakura の節、`development.md` の旧テーマの節など）
- [ ] `migration/react-firebase` を `main` に取り込む（`main` は sakura へ rsync しているため、切り替えと削除が済むまで触らない）
- [ ] `data/`（生素材）は git 履歴から消さない（ユーザー判断、2026-09-28）

## 5. 内容の確認（ユーザーの判断待ち）

旧サイトの内容をそのまま移植したもの、または仮の値を入れたもの。

| #   | 箇所                                 | 内容                                                                                                                     |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 1   | ミッションページの本文               | 誤字と思われる「当社の方々に住みやすく」（地域の方々に？）・「毎日２行っている」（毎日行っている？）                     |
| 2   | 車両ページの副題                     | 「現場を支える12種類の頼れる相棒」に対し、掲載している主要車両は 5 種類                                                  |
| 3   | 安全ページの取り組み                 | 1 件目と 3 件目の見出しがどちらも【安全朝礼】（3 件目の写真は打ち合わせの様子）                                          |
| 4   | 採用ページの 1 日の流れ              | 時刻「AM 00:00」が仮の値                                                                                                 |
| 5   | 採用フォームの個人情報の文面         | 利用目的の文面（仮）、送信内容の保持期間（`inquiries` 180 日・`mail` 30 日の提案値）。プライバシーポリシーのページが無い |
| 6   | トップの CASE STUDY                  | 日付・社名が仮の値（`2026.00.00`・`○○○○○○`）                                                                             |
| 7   | トップページの表示速度               | Lighthouse の Performance が 76（目標 85）。原因の写真を小さいサイズでも書き出すか                                       |
| 8   | トップの VEHICLE LINEUP              | 車両ではなく現場写真（安全朝礼・選別作業・チームワーク）が入っている                                                     |
| 9   | 各ページの説明文（meta description） | 旧サイトに無かったため新規に作成した                                                                                     |
| 10  | OGP 画像と favicon                   | OGP は写真 `wf-097` を切り出した仮の選定。favicon はロゴの「F」の部分から作った                                          |
| 11  | 構造化データ（JSON-LD）              | 本社のメールアドレス（`web/app/content/company.ts`）を検索エンジン向けに公開してよいか                                   |
| 12  | `scripts/generate-pdfs.js`           | P11 で残すか                                                                                                             |

## 6. 片付け（ユーザーの確認後に行う）

- PR に載せる画像の置き場に使ったブランチ（リモートの `pr-assets/p7`・`pr-assets/p9`、ローカルの `pr-assets/p6`）。消すと PR の画像が表示されなくなる
- マージ済みのフェーズごとのブランチ（`migration/p0-*`〜`migration/p9-*`）
- サブエージェントが作業に使った worktree（`.claude/worktrees/`）
