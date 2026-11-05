# デプロイ

## 現行（WordPress テーマ・移行完了まで）

main ブランチの WordPress テーマを sakura サーバーへ rsync でデプロイしている。
移行用のファイルは WordPress テーマの表示に不要なため、rsync で次も除外すること。

```
web/  functions/  shared/  tests/  tools/  .github/  extensions/
firebase.json  .firebaserc  firestore.rules  firestore.indexes.json  storage.rules
eslint.config.mjs  .prettierrc.json  .prettierignore  .nvmrc
tsconfig.base.json  tsconfig.json  vitest.rules.config.ts
```

## 移行後（Firebase Hosting）

デプロイ手順は P10 で整備する。`firebase.json` の Hosting 設定は次のとおり。

| 項目                                                 | 設定                                            | 理由                                                                                                                     |
| ---------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `public`                                             | `web/build/client`                              | React Router のビルド出力                                                                                                |
| `cleanUrls` / `trailingSlash`                        | `true` / `true`                                 | 現行サイトと同じ `/mission/` 形式の URL を維持                                                                           |
| リダイレクト                                         | `/company/` → `/mission/`（301）                | 旧サイトの `/company/` は空白ページだった                                                                                |
| 404                                                  | `404.html`（ビルド時に生成）                    | 存在しない URL には Hosting が 404 ステータスで返す。`noindex` 付き                                                      |
| `robots.txt` / `sitemap.xml`                         | ビルド時に生成                                  | 既定は `Disallow: /`（下記「本番切り替え時の SEO 設定」）                                                                |
| `/assets/**`                                         | `max-age=31536000, immutable`                   | Vite がハッシュ付きファイル名で出力する                                                                                  |
| `/media/**`                                          | `max-age=604800`（7 日）                        | 写真・動画はハッシュなしのため長期キャッシュしない                                                                       |
| `/assets/`・`/media/` 以外で拡張子のない URL（HTML） | `no-cache`                                      | デプロイ直後から新しい HTML を配信する。`cleanUrls` ではリクエスト URL に `.html` が付かないため、正規表現で判定している |
| 全体                                                 | `nosniff` / HSTS / `X-Frame-Options: DENY` など | セキュリティヘッダー                                                                                                     |

Functions は `asia-northeast1`（東京）、Node 22。デプロイ前に `predeploy` で esbuild によるバンドルを行う。
フォームの通知先（`CONTACT_MAIL_TO` など）はパラメータで、値がないとデプロイ時に入力を求められる。
`firestore.indexes.json` の TTL（`inquiries`・`mail` の `expireAt`）と施工事例の複合インデックス（`caseStudies` の `status` + `date`）は
`firebase deploy --only firestore:indexes` で反映される。セキュリティルールは `firebase deploy --only firestore:rules,storage`。
Trigger Email 拡張の導入手順は [forms.md](./forms.md#メール)。

Functions のソースとしてアップロードするのはビルド結果（`lib/`）と `package.json` だけで、`firebase.json` の `functions.ignore` で残りを除く。

- firebase-tools（15.34 で確認）は、`ignore` を指定しないときの既定が `["node_modules", ".git"]` で、指定するとその値で置き換わる。
  どちらの場合も `firebase-debug.log`・`firebase-debug.*.log`・`.runtimeconfig.json` だけは常に除かれる
  （`node_modules/firebase-tools/lib/deploy/functions/prepareFunctionsUpload.js` の `packageSource`）
- `firebase init functions` が書く既定の ignore（`node_modules`・`.git`・`firebase-debug.log`・`firebase-debug.*.log`・`*.local`。
  `lib/init/features/functions/index.js`）を含めないと、Emulator 用の `functions/.env.local`・`.secret.local` もアップロードされる
- Emulator のデモプロジェクト（`demo-` で始まるプロジェクト ID）用の `.env.demo-*` も除く。本番のデプロイでは読まれず、アップロードする必要がない
- 照合は minimatch の `matchBase: true, dot: true` で、`/` を含まないパターンはどの階層のファイル名にも一致する（`lib/fsAsync.js`）
- `functions/test/uploadIgnore.test.ts` で、firebase-tools の照合を使ってアップロード対象を確かめる

### フォームの送信に必要な設定（Firebase）

フォームの送信には、ビルド時の環境変数 `VITE_FIREBASE_API_KEY`・`VITE_FIREBASE_PROJECT_ID`・`VITE_FIREBASE_APP_ID`・`VITE_RECAPTCHA_SITE_KEY` が必要（内容は [forms.md](./forms.md#firebase-の読み込みwebapplibfirebasetssubmitinquiryts)、例は `web/.env.example`）。
Vite がビルド時にバンドルへ埋め込むため、ビルドするときに渡す。本番（`willfrontier-hp`）の値は **`web/.env.production` にコミットしている**
（どれもバンドルに入りブラウザから見える値で、秘密情報ではないため。CI からのデプロイでも Secrets を用意せずに済む）。
環境変数・`web/.env.production.local`（リポジトリに含めない）があればそちらが優先される。
`web/.env.production` は production モードの `npm run dev`・`npm run build` でも読まれるため、Emulator を使わないビルドは本番の Firebase につながる。

`firebase deploy` の Hosting の `predeploy` は、通常のビルドではなくデプロイ用のビルド `npm run build:deploy -w @wf/web` を実行する。
ビルドの前に `web/scripts/verify-deploy-env.ts` が上の 4 つを確かめ、無い・空（空白だけを含む）なら欠けている変数名を挙げて失敗する。
アプリ（`lib/firebase.ts`）は送信時にしか設定を確かめないため、確認が無いと「ページは表示できるがフォームが送れないサイト」をデプロイできてしまう。

- 確かめるのはビルド前の環境変数。ビルドと同じモード（production）・同じ `web/` の `.env` 系ファイルを Vite の `loadEnv` で読むため、バンドルに入る値と一致する（`VITE_ALLOW_INDEXING` を読む `generate-seo-files.ts` と同じ前提）。
  ビルド後にバンドルを調べる方式は、値を知らないと探せず、圧縮後のコードの形に依存するため採らなかった
- 通常の `npm run build`（CI の check・e2e・lighthouse）は確かめない（`VITE_RECAPTCHA_SITE_KEY` が未登録の間も、ビルドと E2E を止めないため）。
  E2E は本番の設定が入ったビルドに対して実行し、Firebase への通信は遮断・差し替える（[development.md](./development.md#e2eplaywright--axe)）
- `VITE_USE_FIREBASE_EMULATORS=true` のビルドは demo プロジェクトで動くため確かめない。本番向けのビルドでは設定しないこと
- 判定（必須の変数・空の扱い）は `web/app/lib/firebaseEnv.ts` にあり、送信時の確認と共通。テストは `web/scripts/deployEnv.test.ts`

### 本番切り替え時の SEO 設定

既定のビルドは検索エンジンに登録されない（全ページ `noindex`、robots.txt で `Disallow: /`）。
現行の本番は sakura の WordPress で、このビルドはまだ公開されていないため。本番に切り替える際は次の 2 点が必要。

1. `web/app/content/site.ts` の `SITE.url` を本番ドメインにする（canonical・OGP・sitemap・JSON-LD の URL に使う。末尾スラッシュなし）。
   `https://willfrontier.jp`（www なし）に設定済み
2. 本番用のビルドを `VITE_ALLOW_INDEXING=true` で実行する（例: `VITE_ALLOW_INDEXING=true npm run build`）。
   `web/.env.production` はコミットしていて preview channel のビルドでも読まれるため、ここには書かないこと
   `'true'` 以外の値はすべて「禁止」として扱う

preview channel など本番以外のビルドでは設定しないこと。
postbuild の `verify-prerender.mjs` が、robots.txt とページの `noindex` が同じ方針になっていることを検証する。

### Content-Security-Policy（Report-Only）

`firebase.json` で全ページに `Content-Security-Policy-Report-Only` を付けている（テスト: `web/scripts/hostingHeaders.test.ts`）。
違反してもブロックせず、ブラウザのコンソールに報告するだけ。許可している通信先は次のとおり。

| ディレクティブ | 許可するもの                                                                                                                                                                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `script-src`   | 自サイト・インラインスクリプト・reCAPTCHA（App Check）                                                                                                                                                                                              |
| `style-src`    | 自サイト・インラインの style 属性・Google Fonts の CSS                                                                                                                                                                                              |
| `font-src`     | 自サイト・Google Fonts                                                                                                                                                                                                                              |
| `img-src`      | 自サイト・reCAPTCHA・施工事例の写真（Storage の `firebasestorage.googleapis.com`）                                                                                                                                                                  |
| `connect-src`  | 自サイト・Cloud Functions（`*.cloudfunctions.net`）・App Check のトークン交換・reCAPTCHA・Firestore（施工事例の読み込みと管理画面）・Firebase Auth（`identitytoolkit`・`securetoken`。管理画面のログイン）・Storage（管理画面の写真のアップロード） |
| `frame-src`    | reCAPTCHA                                                                                                                                                                                                                                           |
| その他         | `default-src 'self'`・`media-src 'self'`・`object-src 'none'`・`base-uri 'self'`・`form-action 'self'`・`frame-ancestors 'none'`                                                                                                                    |

- プリレンダーした HTML には、React Router の hydration 用のインラインスクリプト（ページごとに中身が違う）と `<head>` のアニメーション用スクリプトがあるため、`script-src` に `'unsafe-inline'` を許可している。強制（`Content-Security-Policy`）に切り替える場合は、postbuild で各ページのインラインスクリプトのハッシュを集めてヘッダーに入れる必要がある
- 施工事例は公開サイトでも Firestore の REST（`runQuery`）を `fetch` で読む（`web/app/lib/caseStudies.ts`。SDK は読み込まない）。Emulator（`http://127.0.0.1:8080` など）は許可していないため、ローカルで Emulator に接続すると違反の報告が出る（Report-Only のため動作は変わらない）
- zod は `jitless` にして `new Function` を使わない（`unsafe-eval` を許可しないため。`shared/src/forms/schemas.ts`）
- P10 で行うこと: `connect-src` の `https://*.cloudfunctions.net` は誰のプロジェクトでも一致するため、本番のプロジェクト ID が決まったら `https://asia-northeast1-<project-id>.cloudfunctions.net` に絞る。違反を集めるなら `report-to`（`Reporting-Endpoints`）の追加を検討する
- P9 時点で、全 9 ページと 404 を Hosting Emulator で開き、違反の報告が出ないことを確認した。reCAPTCHA の読み込みは本番の設定が必要なため、P10 の preview channel で確認する

### 既知の制約

- `functions/` には専用の `package-lock.json` がない（lockfile は npm workspaces のルートにのみある）。
  デプロイ時は `functions/package.json` の semver 範囲で `firebase-functions` / `firebase-admin` が解決されるため、
  ローカルとデプロイ先でマイナーバージョンがずれる可能性がある。P10 で対応方針を決める。
- `predeploy` はビルド（Firebase の設定の確認を含む）のみで、型チェックとテストは含まない。デプロイは CI を通過したコミットから行う。
