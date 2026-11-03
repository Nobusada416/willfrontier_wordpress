# 施工事例の管理画面

ホームページの「施工事例」（`/casestudy/` とトップの CASE STUDY）は、管理画面から追加・編集・公開できます。
「公開」にした事例は、その場でホームページに表示されます（制作担当によるサイトの更新作業は要りません）。

前半は社内で管理画面を使う方向け、後半（[制作担当向け](#制作担当向け)）はアカウントの追加などの作業手順です。

## 管理画面の使い方

### ログイン

1. パソコンのブラウザ（Google Chrome・Microsoft Edge・Safari など）で `https://<ホームページのアドレス>/admin/` を開きます
2. 制作担当から受け取ったメールアドレスとパスワードを入れて「ログイン」を押します

- アカウントの追加・パスワードを忘れたときは、制作担当にご連絡ください（画面からは登録・再設定できません）
- 「このアカウントには管理画面を使う権限がありません」と出たときも、制作担当にご連絡ください
- 使い終わったら、一覧の右上の「ログアウト」を押してください（共用のパソコンでは特に）

### 一覧

ログインすると「施工事例」の一覧が出ます。下書きも公開中も、日付の新しい順に並びます。

- **状態**: 「公開中」（青）はホームページに表示されている事例、「下書き」（灰色）は表示されていない事例です
- **公開する／非公開にする**: 押すとすぐに切り替わり、ホームページにもすぐ反映されます。画面の上に結果が出ます
- **タイトル**を押すと編集の画面に、「**新規作成**」を押すと新しい事例の画面に移ります
- トップの CASE STUDY には、公開中の事例のうち新しい 4 件が出ます

### 新規作成・編集

| 項目                 | 内容                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| 日付                 | 一覧の並び順にも使います                                                         |
| 分類（トップに表示） | トップの CASE STUDY に出る短い分類（「解体工事」「定期回収」など。20 文字まで）  |
| 社名                 | お客様の社名（50 文字まで）                                                      |
| タイトル             | 事例の題名（60 文字まで）                                                        |
| 工事の種類・内容     | タイトルの下に出ます（「産業廃棄物 / 金属類 / 機械設備」など。80 文字まで）      |
| 本文                 | 事例の説明（400 文字まで）。改行はそのまま表示されます                           |
| 写真                 | 1〜4 枚。1 枚目がメインの写真になります                                          |
| 写真の説明           | 写真の内容を短い文で（目の不自由な方の読み上げや、写真が出ないときに使われます） |

- すべての項目が必須です（写真の説明を除く）。足りない項目は、その項目の下に赤字で出ます
- 「**下書き保存**」はホームページに出さずに保存します。「**公開して保存**」は保存してすぐホームページに出します
  （公開中の事例を「下書き保存」すると、ホームページから外れます）
- 保存せずに「一覧に戻る」を押したりページを閉じたりすると、確認が出ます。「保存せずに離れる」を選ぶと入力した内容は消えます

### 写真

- 「写真を追加」を押して選びます（一度に複数選べます）。JPEG・PNG・HEIC、1 枚 20MB までです
- 選んだ写真は、ブラウザの中で自動的に小さくしてから保存されます（元の写真はアップロードされません）
- 写真の右上の「×」で外せます。並び順を変えたいときは、外してから選び直してください
- iPhone の写真（HEIC）は、ブラウザによっては読み込めません。そのときは iPhone の「設定 > カメラ > フォーマット」を
  「互換性優先」にして撮るか、JPEG に変換してから選んでください

### 削除

編集の画面の左下の「削除」を押し、確認で「削除する」を押すと、事例と写真が消えます。**元に戻せません**。
一時的にホームページから外したいだけなら、一覧の「非公開にする」を使ってください。

### 気をつけること

- 下書きの写真も、写真の URL（アドレス）を知っている人は見られます。公開前の事例でも、出してはいけない写真は使わないでください
- 同じ事例を 2 人で同時に編集すると、後から保存した内容で上書きされます

## 制作担当向け

### 仕組み

- 画面: `web/app/routes/admin/`（`/admin/`・`/admin/case-studies/new/`・`/admin/case-studies/edit/?id=...`）と
  `web/app/features/admin/`。静的に書き出すため、編集する事例の ID はクエリで渡す
- ログイン: Firebase Auth（メールアドレスとパスワード）。カスタムクレーム `admin: true` が無いアカウントは、
  ログイン直後とページを開いたときに ID トークンを取り直して確かめ、「権限がありません」と出してログアウトさせる
- データ: Firestore の `caseStudies/{事例の ID}`。写真は Storage の `case-studies/{事例の ID}/{写真の ID}-{small|large}.{webp|jpg}`
  （幅 768px・1600px。元の写真より大きくはしない。1 ファイル 2MB まで）。`photos[].path` は拡張子付きの基準パス
  `case-studies/{事例の ID}/{写真の ID}.{webp|jpg}` で、拡張子で形式が分かる（各サイズのファイルは `caseStudyPhotoFilePath`）。項目と上限は `shared/src/caseStudies/`、
  書き込みの条件は `firestore.rules`・`storage.rules`（[architecture.md](./architecture.md) の「コンテンツは TypeScript の定数で管理する」）
- 写真の流れ: 新規作成の画面を開いた時点で事例の ID を決める → 写真を選ぶとブラウザで縮小（canvas）して webp（できなければ JPEG）に変換 →
  すぐ Storage にアップロード → URL と large の寸法をフォームに入れる。外した写真は、保存前にアップロードしたものはすぐ、
  保存済みのものは保存が終わってから Storage から消す。事例の削除では `case-studies/{事例の ID}/` の下をすべて消す
  （保存せずに画面を閉じた場合など、使われない写真が残ることはある）
- 検索エンジン: 管理画面は常に `noindex, nofollow`、canonical なし、sitemap に載せず、robots.txt で `Disallow: /admin/`
- 表示速度: Auth・Firestore・Storage の SDK は管理画面のレイアウトから `import()` で読み込み、公開ページには入れない
  （ビルド後の `scripts/verify-prerender.mjs` で確かめる）
- 写真の変換は canvas の `toBlob('image/webp')` を使う。Safari は webp で書き出せず黙って PNG を返すため、結果の `type` を確かめ、
  webp でなければ JPEG（画質 0.85）で書き出し直す（`photos.ts`）。Storage のルールは拡張子と形式の組（`.webp` は `image/webp`、
  `.jpg` は `image/jpeg`）だけを許す。E2E（`npm run e2e:admin`）は Chromium だけで、Safari（WebKit）での変換は `photos.test.ts`
  の単体テスト（`toBlob` が PNG を返す場合）で確かめている
- 本番の CSP（`firebase.json`）は、管理画面のために `connect-src` に `identitytoolkit.googleapis.com`・`securetoken.googleapis.com`・
  `firestore.googleapis.com`・`firebasestorage.googleapis.com`、`img-src` に `firebasestorage.googleapis.com` が要る

### 管理者の追加・削除

管理画面には新規登録・パスワード再設定の機能を置いていない。アカウントと権限は `npm run admin:grant`（`tools/grant-admin.ts`）で付ける
（詳しいオプションは [development.md](./development.md#管理者の付与施工事例の管理画面)）。

```bash
# 本番（Application Default Credentials の権限で実行する）
gcloud auth application-default login
npm run admin:grant -- --project <本番のプロジェクト ID> soumu@example.com                  # 追加（いなければ作成。初期パスワードを表示）
npm run admin:grant -- --project <本番のプロジェクト ID> --reset-password soumu@example.com # パスワードの再発行
npm run admin:grant -- --project <本番のプロジェクト ID> --revoke soumu@example.com         # 権限を外す
npm run admin:grant -- --project <本番のプロジェクト ID> --list                             # 管理者の一覧
```

- 初期パスワード・再発行したパスワードは一度だけ表示される。本人に安全な方法で伝える
- 権限を外しても、開いたままの管理画面は ID トークンの期限（最長 1 時間）まで書き込める。すぐ止めたいときは再読み込みしてもらう
  （開き直すと ID トークンを取り直して確かめるため、ログアウトさせられる）

### 本番で使う前の準備（P10）

- Firebase コンソールで Authentication（メール / パスワード）と Cloud Storage を有効にし、`firestore.rules`・`storage.rules`・
  `firestore.indexes.json` をデプロイする
- Storage のバケットが `<プロジェクト ID>.firebasestorage.app` でない（2024 年 10 月より前に作ったプロジェクトの `appspot.com` など）場合は、
  ビルド時の `VITE_FIREBASE_STORAGE_BUCKET` で指定する（`web/.env.example`。`npm run build:deploy` が使うバケットを表示する）

### 既存の施工事例の移行（本番では P10 の後に 1 回）

旧サイトの施工事例 3 件（旧 `page-casestudy.php`。`migration/react-firebase` の `web/app/content/cases.ts` の `CASE_STUDIES`）は、
`npm run seed:case-studies`（`tools/seed-case-studies.ts`）で Firestore と Storage に入れる。

```bash
npm run seed:case-studies -- --emulator                       # Emulator（npm run emulators の起動中）
gcloud auth application-default login
npm run seed:case-studies -- --project <本番のプロジェクト ID>  # 本番。Auth・Storage の有効化とルールのデプロイ（P10）の後に 1 回
```

- 旧データには日付・社名・分類（トップの一覧の tag）が無い（トップの 4 件も `2026.00.00`・`○○○○○○` の仮の値で、移さない）。
  そのため 3 件とも **下書き** で入れ、次の仮の値を入れる。スクリプトの出力にも同じ内容が出る。
  **管理画面で日付・社名・分類を直してから「公開して保存」してもらう**

  | 項目                 | 仮の値                                                                                            |
  | -------------------- | ------------------------------------------------------------------------------------------------- |
  | 日付                 | 実行した日（日本時間）                                                                            |
  | 社名                 | `[社名]`                                                                                          |
  | 分類（トップに表示） | 工事の種類（旧データの meta）から短く: 「産業廃棄物」「公共工事」「定期回収」                     |
  | そのほか             | タイトル・工事の種類・本文は旧データのまま。写真は 4 枚とも旧データの順（説明は空。旧サイトも空） |

- 写真は `web/public/media/photos/{small,large}/<slug>.webp` をそのまま `case-studies/legacy-0N/<slug>-{small|large}.webp` に
  置く（寸法は `web/app/lib/mediaManifest.json` の large のもの）
- ID は固定（`legacy-01`〜`legacy-03`）のため、何度実行しても重複しない。1 件でも既にあれば何も書かずに止まる。
  `--force` を付けると上書きする（その事例の Storage の写真も消して入れ直すため、**管理画面で直した内容は消える**）
- Storage のバケットが `<プロジェクト ID>.firebasestorage.app` でないときは `--bucket <バケット>` で指定する
- 移行後、新しいサイトから参照されなくなる写真（`web/public/media/photos` の `wf-106`〜`wf-111`・`wf-048`・`wf-050`・`wf-037`）は、
  旧テーマの `page-casestudy.php` がまだ参照しており、このスクリプトも読むため削除しない。P11 で扱う
  （`wf-009`・`wf-049` は車両・作業の流れのページでも使っている）

### 手元で動かす

```bash
npm run emulators                                    # Auth 9099・Firestore 8080・Storage 9199 ほか
npm run admin:grant -- --emulator soumu@example.com  # 管理者を作る（初期パスワードが表示される）
VITE_USE_FIREBASE_EMULATORS=true npm run dev         # http://localhost:5173/admin/
```

テスト: 画面は `web/app/features/admin/*.test.tsx`（Vitest。Firebase は偽物に差し替え）、Firebase の操作は
`tests/integration/caseStudyAdmin.test.ts`（`npm run test:integration`）、移行は `tests/integration/seedCaseStudies.test.ts`、画面の操作は `web/e2e/admin/`（`npm run e2e:admin`）。
