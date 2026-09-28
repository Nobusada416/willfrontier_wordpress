# デプロイ

## 現行（WordPress テーマ・移行完了まで）

main ブランチの WordPress テーマを sakura サーバーへ rsync でデプロイしている。
移行用のファイルは WordPress テーマの表示に不要なため、rsync で次も除外すること。

```
web/  functions/  shared/  .github/  extensions/
firebase.json  .firebaserc  firestore.rules  firestore.indexes.json
eslint.config.mjs  .prettierrc.json  .prettierignore  tsconfig.base.json  .nvmrc
```

## 移行後（Firebase Hosting）

P10 で整備する。
