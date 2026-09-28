# タスク: WordPress テーマ → React + TypeScript + Vite + Firebase 移行

計画の全体像は [architecture.md](./architecture.md) を参照。
統合ブランチ `migration/react-firebase` に、フェーズごとのブランチ `migration/pN-*` を PR で取り込む。

## ステップ

- [x] P0: 基盤（workspaces / web 雛形 / TS strict / ESLint・Prettier / Vitest / Tailwind v4 トークン / CI）
- [x] P1: Firebase 基盤（firebase.json / 全拒否ルール / Emulator / functions・shared 雛形）
- [ ] P2: レイアウト（Header・MobileNav・Footer・SkipLink・404・SEO ヘルパー）
- [ ] P3: メディアコンポーネント（Picture / Video / CrossfadeHero）
- [ ] P4: アセット移行（web/public/media へ移動・リンク切れ修正・未使用削除）
- [ ] P5: モーション（Lenis / GSAP / イントロ / 見出し・フェード・葉っぱ）
- [ ] P6: トップページ 10 セクション
- [ ] P7: 下層ページ（mission / service / workflow / vehicles / casestudy）
- [ ] P8: フォーム（shared スキーマ / submitInquiry / contact・safety・recruit）
- [ ] P9: SEO と品質（sitemap / robots / OGP / JSON-LD / Lighthouse / 見た目比較）
- [ ] P10: デプロイ（preview channel / GitHub Actions / Trigger Email / 本番切替）
- [ ] P11: WordPress 関連ファイル削除

## 現在の状態

P1 完了（ブランチ `migration/p1-firebase`、P0 の上に積んでいる）。次は P2（レイアウト）

## 問題・ブロッカー

- react-router v8 は Node 22.22 以上が必要なため、v7 系（7.18）を採用
- typescript-eslint が TypeScript 6.1 未満までの対応のため、TypeScript 6.0 系を採用
- eslint-plugin-jsx-a11y が ESLint 9 までの対応のため、ESLint 9 系を採用
- jsdom 30 は Node 22.22 以上が必要なため、jsdom 29 系を採用
- P0 で、prerender に末尾スラッシュ付きパスを渡すと空の HTML になる不具合を見つけて修正（postbuild で再発検知）
- `npm audit`: firebase-admin 経由の uuid（moderate）が残る。buf 引数を渡す使い方のみ影響し本件は該当しないため、上流の更新待ち
- フォントは計画の自前配信（@fontsource）から Google Fonts 読み込みに変更（自前配信では CSS が 572KB に膨らむため）

## ユーザー確認待ち

1. 実在しない動画 `hero/intro`・`service/demolition` の扱い（P4）
2. `data/`（627MB）を git 履歴から消すか（P4 / P11）
3. 本番を Firebase Hosting に切り替える時期と sakura 環境の廃止（P10）
4. `scripts/generate-pdfs.js` を残すか（P11）
