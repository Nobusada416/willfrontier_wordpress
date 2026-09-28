# タスク: WordPress テーマ → React + TypeScript + Vite + Firebase 移行

計画の全体像は [architecture.md](./architecture.md) を参照。
統合ブランチ `migration/react-firebase` に、フェーズごとのブランチ `migration/pN-*` を PR で取り込む。

## ステップ

- [x] P0: 基盤（workspaces / web 雛形 / TS strict / ESLint・Prettier / Vitest / Tailwind v4 トークン / CI）
- [x] P1: Firebase 基盤（firebase.json / 全拒否ルール / Emulator / functions・shared 雛形）
- [x] P2: レイアウト（Header・MobileNav・Footer・SkipLink・404・SEO ヘルパー）
- [x] P3: メディアコンポーネント（Picture / Video / CrossfadeHero / MosaicHero）
- [x] P4: アセット移行（web/public/media へ移動・リンク切れ修正・未使用削除）
- [x] P5: モーション（Lenis / GSAP / イントロ / 見出し・フェード・葉っぱ）
- [ ] P6: トップページ 10 セクション
- [ ] P7: 下層ページ（mission / service / workflow / vehicles / casestudy）
- [ ] P8: フォーム（shared スキーマ / submitInquiry / contact・safety・recruit）
- [ ] P9: SEO と品質（sitemap / robots / OGP / JSON-LD / Lighthouse / 見た目比較）
- [ ] P10: デプロイ（preview channel / GitHub Actions / Trigger Email / 本番切替）
- [ ] P11: WordPress 関連ファイル削除

## 現在の状態

P0〜P4 は統合ブランチ `migration/react-firebase` にマージ済み。P5 完了（ブランチ `migration/p5-motion`）。次は P6（トップページ）

## 問題・ブロッカー

- react-router v8 は Node 22.22 以上が必要なため、v7 系（7.18）を採用
- typescript-eslint が TypeScript 6.1 未満までの対応のため、TypeScript 6.0 系を採用
- eslint-plugin-jsx-a11y が ESLint 9 までの対応のため、ESLint 9 系を採用
- jsdom 30 は Node 22.22 以上が必要なため、jsdom 29 系を採用
- P0 で、prerender に末尾スラッシュ付きパスを渡すと空の HTML になる不具合を見つけて修正（postbuild で再発検知）
- `npm audit`: firebase-admin 経由の uuid（moderate）が残る。buf 引数を渡す使い方のみ影響し本件は該当しないため、上流の更新待ち
- `content/site.ts` の `SITE.url`（canonical・OGP に使う）は現行の公開 URL を仮に設定している。本番ドメインは P10 で確定する
- 各ページの説明文（meta description）は旧サイトに無かったため新規に作成した。文面の確認が必要
- P4 で使用中の画像・動画を `web/public/media/` へ移動し、旧テーマ（PHP）の参照先も書き換えた。WordPress 側を sakura へデプロイする main には、P11 まで取り込まない
- 旧テーマの動画 poster（`shorts/s08`〜`s14` の jpg）が存在せずリンク切れだったため、ffmpeg で生成した
- 旧トップのスマホ表示で参照していた葉の画像（`plant-*-left.svg`）が削除済みでリンク切れだったため、同名の png に差し替えた
- P4 で、どこからも参照されていない素材 240 ファイル（約 75MB。画像 55・写真 134・動画と poster 51）を削除した。必要になれば git 履歴から戻せる
- `data/`（627MB の生素材）は git 履歴から消さない（ユーザー判断、2026-09-28）
- 存在しない動画 `hero/intro`・`service/demolition` は `functions.php` のコメント内の例でのみ参照されており、実際のページでは使われていなかった（P11 で PHP ごと削除）
- 旧実装は写真のクラスを `<picture>` と `<img>` の両方に付けており `opacity-40` が二重にかかっていた。P6・P7 の移植時に見た目を合わせる
- P5 の `<head>` インラインスクリプト（`lib/motion/headScript.ts`）は、P9 で CSP を設定する際にハッシュを許可する必要がある
- P5 の部品（見出し・フェード・葉）はまだページで使っていない。旧実装の画面収め（`transform: scale()`）とスライダー（Swiper）は P6・P7 で扱う
- スクロールのロック（`overflow: hidden`）は iOS Safari でタッチスクロールを完全には止められない既知の制限がある。P10 の実機確認で見る
- 旧実装の `.js-parallax` はどのページでも使われていなかったため移植しない
- フォントは計画の自前配信（@fontsource）から Google Fonts 読み込みに変更（自前配信では CSS が 572KB に膨らむため）

## ユーザー確認待ち

1. 本番を Firebase Hosting に切り替える時期と sakura 環境の廃止（P10）
2. `scripts/generate-pdfs.js` を残すか（P11）
