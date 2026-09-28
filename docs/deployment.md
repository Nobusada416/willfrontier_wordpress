# デプロイ

## 現行（WordPress テーマ・移行完了まで）

main ブランチの WordPress テーマを sakura サーバーへ rsync でデプロイしている。
移行用のファイルは WordPress テーマの表示に不要なため、rsync で次も除外すること。

```
web/  functions/  shared/  tests/  .github/  extensions/
firebase.json  .firebaserc  firestore.rules  firestore.indexes.json
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
`firestore.indexes.json` の TTL（`inquiries`・`mail` の `expireAt`）は `firebase deploy --only firestore:indexes` で反映される。
Trigger Email 拡張の導入手順は [forms.md](./forms.md#メール)。

### 本番切り替え時の SEO 設定

既定のビルドは検索エンジンに登録されない（全ページ `noindex`、robots.txt で `Disallow: /`）。
現行の本番は sakura の WordPress で、このビルドはまだ公開されていないため。本番に切り替える際は次の 2 点が必要。

1. `web/app/content/site.ts` の `SITE.url` を本番ドメインに変更する（canonical・OGP・sitemap・JSON-LD の URL に使う。末尾スラッシュなし）
2. 本番用のビルドを `VITE_ALLOW_INDEXING=true` で実行する（例: `VITE_ALLOW_INDEXING=true npm run build`。`web/.env.production` に書いてもよい）。
   `'true'` 以外の値はすべて「禁止」として扱う

preview channel など本番以外のビルドでは設定しないこと。
postbuild の `verify-prerender.mjs` が、robots.txt とページの `noindex` が同じ方針になっていることを検証する。

### Content-Security-Policy（Report-Only）

`firebase.json` で全ページに `Content-Security-Policy-Report-Only` を付けている（テスト: `web/scripts/hostingHeaders.test.ts`）。
違反してもブロックせず、ブラウザのコンソールに報告するだけ。許可している通信先は次のとおり。

| ディレクティブ | 許可するもの                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `script-src`   | 自サイト・インラインスクリプト・reCAPTCHA（App Check）                                                       |
| `style-src`    | 自サイト・インラインの style 属性・Google Fonts の CSS                                                       |
| `font-src`     | 自サイト・Google Fonts                                                                                       |
| `connect-src`  | 自サイト・Cloud Functions（`*.cloudfunctions.net`）・App Check のトークン交換・reCAPTCHA                     |
| `frame-src`    | reCAPTCHA                                                                                                    |
| その他         | `default-src 'self'`・`object-src 'none'`・`base-uri 'self'`・`form-action 'self'`・`frame-ancestors 'none'` |

- プリレンダーした HTML には、React Router の hydration 用のインラインスクリプト（ページごとに中身が違う）と `<head>` のアニメーション用スクリプトがあるため、`script-src` に `'unsafe-inline'` を許可している。強制（`Content-Security-Policy`）に切り替える場合は、postbuild で各ページのインラインスクリプトのハッシュを集めてヘッダーに入れる必要がある
- zod は `jitless` にして `new Function` を使わない（`unsafe-eval` を許可しないため。`shared/src/forms/schemas.ts`）
- P10 で行うこと: `connect-src` の `https://*.cloudfunctions.net` は誰のプロジェクトでも一致するため、本番のプロジェクト ID が決まったら `https://asia-northeast1-<project-id>.cloudfunctions.net` に絞る。違反を集めるなら `report-to`（`Reporting-Endpoints`）の追加を検討する
- P9 時点で、全 9 ページと 404 を Hosting Emulator で開き、違反の報告が出ないことを確認した。reCAPTCHA の読み込みは本番の設定が必要なため、P10 の preview channel で確認する

### 既知の制約

- `functions/` には専用の `package-lock.json` がない（lockfile は npm workspaces のルートにのみある）。
  デプロイ時は `functions/package.json` の semver 範囲で `firebase-functions` / `firebase-admin` が解決されるため、
  ローカルとデプロイ先でマイナーバージョンがずれる可能性がある。P10 で対応方針を決める。
- `predeploy` はビルドのみで、型チェックとテストは含まない。デプロイは CI を通過したコミットから行う。
