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
- [x] P6: トップページ 10 セクション
- [ ] P7: 下層ページ（mission / service / workflow / vehicles / casestudy）。mission（PR #26）・service（PR #27）・workflow（ブランチ `migration/p7-workflow`）完了
- [ ] P8: フォーム（shared スキーマ / submitInquiry / contact・safety・recruit）
- [ ] P9: SEO と品質（sitemap / robots / OGP / JSON-LD / Lighthouse / 見た目比較）
- [ ] P10: デプロイ（preview channel / GitHub Actions / Trigger Email / 本番切替）
- [ ] P11: WordPress 関連ファイル削除

## 現在の状態

P0〜P6 は統合ブランチ `migration/react-firebase` にマージ済み。P7（下層ページ）着手、mission（PR #26）・service（PR #27）・workflow（ブランチ `migration/p7-workflow`）完了

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
- P6 でトップの画面収め（`transform: scale()`・スマホの高さ 1000px 固定）を廃止し、車両スライダーは Swiper をやめて自前実装にした。下層ページの画面収めは P7 で扱う（service の図は JS の scale() をやめ、画面の高さから幅を決める CSS に置き換えた。スマホでは特長と吹き出しを 1 行ずつ並べる）
- P6 で、旧 CSS の上書き（`!important`）で実際に表示されていた見た目（見出しの色とフォント・背景色・余白・イントロの幕の青）に合わせた。テンプレートにあっても旧 CSS に含まれず表示されていなかったクラス（MISSION の暗い幕など）は再現していない
- P6 で、srcset の幅（旧実装は一律 768w / 1600w）が実寸と合っておらず粗い画像が選ばれていた不具合と、写真の高さが読み込み後に決まるため `/#company` などへの移動後に位置がずれる不具合を、実寸の一覧（`web/app/lib/mediaManifest.json`）で修正した
- トップの背景イラスト（車両・横浜全景）は原寸の jpg（最大 3666px・1.3MB）だったため、幅 1600px の webp（70KB 前後）を追加して使う。旧テーマが参照する jpg は P11 で削除する
- トップの CASE STUDY の日付・社名は旧サイトの時点で仮の値（`2026.00.00`・`○○○○○○`）のまま。旧実装のリンク先 `#` は事例一覧 `/casestudy/` に変更した
- トップの VEHICLE LINEUP は旧サイトの時点で車両ではなく現場写真（安全朝礼・選別作業・チームワーク）が入っている。内容はそのまま移植した
- スクロールのロック（`overflow: hidden`）は iOS Safari でタッチスクロールを完全には止められない既知の制限がある。P10 の実機確認で見る
- 旧実装の `.js-parallax` はどのページでも使われていなかったため移植しない
- フォントは計画の自前配信（@fontsource）から Google Fonts 読み込みに変更（自前配信では CSS が 572KB に膨らむため）
- 旧ミッションページはスマホでも PC の 2 段組のまま横にはみ出していたため、P7 の移植では 1 段組にした
- 旧テンプレートの英字小見出しの字間 `tracking-[0.3em]`、オレンジ文字 `text-[#d4874a]`、写真ヒーローの暗い幕 `bg-black/55`、`md:order-first` は旧 CSS に含まれず表示されていなかった（P7 の各ページで実際の見た目に合わせる）
- 文字のコントラスト不足: 下層ページの CTA ボタン（白文字 × `wf-orange` #d4874a、約 2.9:1）と見出し上の英字ラベル（`wf-blue` #4a9db5 × 白背景、約 3.1:1）が WCAG AA に届かない。色は旧デザインのままにしており、P9 の Lighthouse・axe 確認で色の調整を相談する
- 旧処理の流れページはスマホで写真が表示されず、本文も細い列に押し込まれていた。P7 では写真と本文を縦に並べ、文字の小さい処理ネットワーク図は幅を保って横にスクロールさせる
- ESLint の除外指定 `**/lib/**` が `web/app/lib` まで除外していたため、`functions/lib/**` に絞った（P7）

## ユーザー確認待ち

1. 本番を Firebase Hosting に切り替える時期と sakura 環境の廃止（P10）
2. `scripts/generate-pdfs.js` を残すか（P11）
3. 旧ミッションページ本文の誤字と思われる箇所「当社の方々に住みやすく」（地域の方々に？）「毎日２行っている」（毎日行っている？）を原文のまま移植した
