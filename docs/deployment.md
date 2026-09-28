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
| `/assets/**`                                         | `max-age=31536000, immutable`                   | Vite がハッシュ付きファイル名で出力する                                                                                  |
| `/media/**`                                          | `max-age=604800`（7 日）                        | 写真・動画はハッシュなしのため長期キャッシュしない                                                                       |
| `/assets/`・`/media/` 以外で拡張子のない URL（HTML） | `no-cache`                                      | デプロイ直後から新しい HTML を配信する。`cleanUrls` ではリクエスト URL に `.html` が付かないため、正規表現で判定している |
| 全体                                                 | `nosniff` / HSTS / `X-Frame-Options: DENY` など | セキュリティヘッダー                                                                                                     |

Functions は `asia-northeast1`（東京）、Node 22。デプロイ前に `predeploy` で esbuild によるバンドルを行う。
フォームの通知先（`CONTACT_MAIL_TO` など）はパラメータで、値がないとデプロイ時に入力を求められる。
`firestore.indexes.json` の TTL（`inquiries`・`mail` の `expireAt`）は `firebase deploy --only firestore:indexes` で反映される。
Trigger Email 拡張の導入手順は [forms.md](./forms.md#メール)。

### 既知の制約

- `functions/` には専用の `package-lock.json` がない（lockfile は npm workspaces のルートにのみある）。
  デプロイ時は `functions/package.json` の semver 範囲で `firebase-functions` / `firebase-admin` が解決されるため、
  ローカルとデプロイ先でマイナーバージョンがずれる可能性がある。P10 で対応方針を決める。
- `predeploy` はビルドのみで、型チェックとテストは含まない。デプロイは CI を通過したコミットから行う。
