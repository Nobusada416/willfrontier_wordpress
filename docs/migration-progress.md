# タスク: WordPress テーマ → React + TypeScript + Vite + Firebase 移行

計画の全体像は [architecture.md](./architecture.md) を参照。
統合ブランチ `migration/react-firebase` に、フェーズごとのブランチ `migration/pN-*` を PR で取り込み、P11 の後に `main` へ取り込んだ。

## ステップ

- [x] P0: 基盤（workspaces / web 雛形 / TS strict / ESLint・Prettier / Vitest / Tailwind v4 トークン / CI）
- [x] P1: Firebase 基盤（firebase.json / 全拒否ルール / Emulator / functions・shared 雛形）
- [x] P2: レイアウト（Header・MobileNav・Footer・SkipLink・404・SEO ヘルパー）
- [x] P3: メディアコンポーネント（Picture / Video / CrossfadeHero / MosaicHero）
- [x] P4: アセット移行（web/public/media へ移動・リンク切れ修正・未使用削除）
- [x] P5: モーション（Lenis / GSAP / イントロ / 見出し・フェード・葉っぱ）
- [x] P6: トップページ 10 セクション
- [x] P7: 下層ページ（mission / service / workflow / vehicles / casestudy）。mission（PR #26）・service（PR #27）・workflow（PR #28）・vehicles（PR #29）・casestudy（PR #30）
- [x] P8: フォーム（shared スキーマ / submitInquiry / contact・safety・recruit）。スキーマ（PR #31）・安全ページ（PR #32）・採用ページ（PR #33）・送信処理（PR #34）・フォーム画面とお問い合わせページ（PR #35）
- [x] P9: SEO と品質（sitemap / robots / OGP / JSON-LD / Lighthouse / 見た目比較）。SEO（PR #36）・CSP Report-Only（PR #37）・E2E と Lighthouse CI（PR #38）・色のコントラストの修正（PR #39）
- [ ] P10: デプロイ（preview channel / GitHub Actions / Trigger Email / 本番切替）。本番切替は 2026-11-06。メール送信の拡張のデプロイが残る
- [x] P11: WordPress 関連ファイル削除と `main` への取り込み（2026-11-11）

## 現在の状態

P0〜P9・P11 は完了し、`main` に取り込んだ。本番は 2026-11-06 に Firebase Hosting へ切り替えた。P10 はメール送信の拡張（Trigger Email）のデプロイなどが残る。
残りの作業は [remaining-work.md](./remaining-work.md) にまとめた

## 問題・ブロッカー

- react-router v8 は Node 22.22 以上が必要なため、v7 系（7.18）を採用
- typescript-eslint が TypeScript 6.1 未満までの対応のため、TypeScript 6.0 系を採用
- eslint-plugin-jsx-a11y が ESLint 9 までの対応のため、ESLint 9 系を採用
- jsdom 30 は Node 22.22 以上が必要なため、jsdom 29 系を採用
- P0 で、prerender に末尾スラッシュ付きパスを渡すと空の HTML になる不具合を見つけて修正（postbuild で再発検知）
- `npm audit`: `npm audit fix`（`--force` なし・package.json は変更なし）で zod 4.6.7・body-parser・qs・re2js・vite・vitest・undici などを lockfile の更新で修正した。残りはどれも `--force`（メジャーダウングレード等の破壊的変更）でしか直らず、上流の更新待ち
  - @grpc/grpc-js 1.9.16（high）: web の firebase@12 が `~1.9.0` に固定。上流未修正で、ブラウザバンドルでは使われない。npm audit は firebase を 9.14.0 に下げる案を出すが適用しない
  - uuid 9.0.1（moderate）: firebase-admin（任意依存の @google-cloud/storage → gaxios）と firebase-tools 経由。buf 引数を渡す使い方のみ影響し、本件は該当しない
  - zod 3.25.76・extract-zip・basic-ftp（high）、uuid 8.3.2（moderate）: web の開発依存 @lhci/cli（lighthouse → puppeteer-core → chromium-bidi など）経由。Lighthouse CI の実行時のみ使い、本番には入らない
  - @opentelemetry/core・glob・minimatch（moderate）: firebase-tools・ESLint・@lhci/cli など開発ツール経由。本番には入らない
- `content/site.ts` の `SITE.url`（canonical・OGP に使う）は、P10 で本番ドメイン `https://willfrontier.jp`（www なし）に確定した
- 各ページの説明文（meta description）は旧サイトに無かったため新規に作成した。2026-11-11 に title とあわせて検索向けに見直した（地域名・事業内容・70〜120 字）
- P4 で使用中の画像・動画を `web/public/media/` へ移動し、旧テーマ（PHP）の参照先も書き換えた。WordPress 側を sakura へデプロイしていた main には、P11 で取り込んだ
- 旧テーマの動画 poster（`shorts/s08`〜`s14` の jpg）が存在せずリンク切れだったため、ffmpeg で生成した
- 旧トップのスマホ表示で参照していた葉の画像（`plant-*-left.svg`）が削除済みでリンク切れだったため、同名の png に差し替えた
- P4 で、どこからも参照されていない素材 240 ファイル（約 75MB。画像 55・写真 134・動画と poster 51）を削除した。必要になれば git 履歴から戻せる
- `data/`（627MB の生素材）は git 履歴から消さない（ユーザー判断、2026-09-28）
- 存在しない動画 `hero/intro`・`service/demolition` は `functions.php` のコメント内の例でのみ参照されており、実際のページでは使われていなかった（P11 で PHP ごと削除）
- 旧実装は写真のクラスを `<picture>` と `<img>` の両方に付けており `opacity-40` が二重にかかっていた。P6・P7 の移植時に見た目を合わせる
- P9 で CSP を Report-Only で設定した（`docs/deployment.md`）。インラインスクリプト（`<head>` のアニメーション用と React Router の hydration 用）のため `'unsafe-inline'` を許可している。強制に切り替える場合はハッシュの収集が必要。reCAPTCHA まわりの違反の有無は P10 の preview channel で確認する
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
- 文字のコントラスト不足: 下層ページの CTA ボタン（白文字 × `wf-orange` #d4874a、約 2.9:1）と見出し上の英字ラベル（`wf-blue` #4a9db5 × 白背景、約 3.1:1）が WCAG AA に届かない。P9 でユーザーの判断により色を直した（下記）
- 旧処理の流れページはスマホで写真が表示されず、本文も細い列に押し込まれていた。P7 では写真と本文を縦に並べ、文字の小さい処理ネットワーク図は幅を保って横にスクロールさせる
- 安全ページは旧デザインのまま、本文の大部分（取り組みの説明・流れの補足・よくあるご質問）も `wf-blue`（白背景で約 3.1:1）で、WCAG AA に届かない。P9 の色の相談に含める
- P8 で旧フォームの `?sent=1` への移動と `history.back()` を廃止し、送信後はページを移動せずに完了のダイアログを出す。エラーは項目の下に出す。安全・採用フォームの枠は、画面収めの廃止で葉の装飾が入力欄の後ろに入るため白くした
- ESLint の除外指定 `**/lib/**` が `web/app/lib` まで除外していたため、`functions/lib/**` に絞った（P7）
- 車両・施工事例ページのヒーローは、旧テンプレートの暗い幕 `bg-black/55` が旧 CSS に含まれず、明るい写真の上の白い文字が読めなかった。P7 ではテンプレートの意図どおり幕を敷いた（共通部品 `PhotoHero`）。車両ページの動画の帯は、幕の代わりに動画を暗くして一時停止ボタンを隠さないようにした

- P9 で、検索エンジンへの登録を既定で禁止（全ページ noindex・robots.txt で `Disallow: /`）にし、`VITE_ALLOW_INDEXING=true` のビルドだけ許可するようにした。本番切り替え（P10）で `SITE.url` の変更とあわせて設定する（[deployment.md](./deployment.md#本番切り替え時の-seo-設定)）
- P9 の OGP 画像は写真 `wf-097`（荷台を傾けた自社車両）を 1200×630 に切り出した仮の選定。favicon はロゴの「F」の部分から作った
- P9 の E2E（axe・WCAG 2.1 AA、全 9 ページ＋404、PC 1280px・スマホ 375px）で見つかった違反は文字のコントラスト不足だけだった（ほかのルールの違反は 0 件）。
  いったん次の色の組み合わせに限って E2E で許容したうえで、ユーザーの判断（すべて直す）により色を直し、許容リスト（`web/e2e/support/knownContrastIssues.ts`）は空にした。
  直した色: `wf-orange` #d4874a → #a95f27（白文字 4.82:1）、`wf-blue` #4a9db5 → #2b7489（白系の背景で 4.98:1 以上）、`wf-text-mid` #4a8a9e → #3a7385（5.02:1 以上）、フッターの著作権表示 opacity-70 → opacity-85（5.59:1。著作権表示は旧 `footer.php` に無く P2 で新規に追加したもので、opacity-70 は P2 で付けた値）。
  トークンの組み合わせは `web/scripts/designTokens.test.ts` で 4.5:1 以上を確かめる。直す前の一覧（比率は axe の計算値。AA の基準は通常の文字 4.5:1・大きな文字 3:1）

  | 前景 × 背景                                                 | 比率       | 主な箇所                                                                                                                                                                                                  |
  | ----------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 白 × `wf-orange` #d4874a                                    | 2.85       | 下層ページ末尾の CTA「お問い合わせ ▼」（service / workflow / vehicles / casestudy）                                                                                                                       |
  | `wf-blue` #4a9db5 × 白 #ffffff                              | 3.09       | 見出し上の英字ラベル（OUR BUSINESS・LINEUP・PROJECTS・A DAY AT WORK・CONTACT など）、安全ページの取り組みの見出しと本文・よくあるご質問・「無料」などの強調、処理の流れの説明文、お問い合わせの流れの補足 |
  | `wf-blue` #4a9db5 × `wf-surface` #f6f8fa / `wf-bg` #f5fafb  | 2.90〜2.94 | 灰色背景のセクションの英字ラベル（WITH THE COMMUNITY・VEHICLE GALLERY・EQUIPMENT・WORKPLACE など）、車両ページの積載量、トップの WORKFLOW の番号・会社概要の項目名・CASE STUDY の日付、404 の「404」      |
  | 白 × `wf-blue` #4a9db5                                      | 3.09       | ヘッダー・フッターの CONTACT ボタン、お問い合わせフォームの送信ボタン、トップの SERVICE の吹き出し・「もっと見る」・会社概要の拠点名、404 の「トップページへ戻る」                                        |
  | `wf-text-mid` #4a8a9e × 白系（#ffffff / #f6f8fa / #f5fafb） | 3.63〜3.87 | 見出しの説明文（service・mission・workflow・トップの GALLERY）、採用フォームの補足、処理の流れの「図は横にスクロールできます」                                                                            |
  | 半透明の白（`opacity-70`）× `wf-navy` #2d5c8a（#c0cedc）    | 4.35       | フッターの著作権表示（全ページ）                                                                                                                                                                          |

  白 × `wf-orange` と `wf-blue` の文字は P7 から把握していたもの。白 × `wf-blue`、`wf-text-mid`、フッターの著作権表示は P9 で新たに見つかった。
  axe が自動で判定できず「要確認」とした項目: トップ・採用の動画の字幕（`video-caption`。音声の無いミュートの装飾動画のため対象外と判断）、
  トップの文中リンクの見分け（`link-in-text-block`）、背景が写真・グラデーションの文字のコントラスト

- P9 の Lighthouse（モバイル。ローカルの Mac で 3 回ずつ計測し、回によって揺れたページは幅で示す）。Accessibility は色を直す前で全ページ 96（減点は上記のコントラストのみ）、Best Practices は全ページ 100、
  SEO は全ページ 69（noindex による `is-crawlable` のみ。本番切り替えで解消）

  | ページ  | 対応前 | 対応後 | 対応後の FCP / LCP   |
  | ------- | ------ | ------ | -------------------- |
  | トップ  | 57     | 76     | 2.3 秒 / 5.2 秒      |
  | service | 59     | 87〜96 | 2.3 秒 / 2.3〜3.6 秒 |
  | safety  | 57     | 87〜91 | 2.6 秒 / 2.9〜3.6 秒 |
  | recruit | 57     | 91     | 2.6 秒 / 2.9 秒      |
  | contact | 59     | 85〜87 | 2.6 秒 / 3.6 秒      |

  対応したもの: Google Fonts の CSS の読み込みが描画を止めていた（FCP 7 秒前後の主因）、スマホで非表示の葉の画像（png 各 220KB×4）を読み込んでいた、
  画面外の動画の poster（トップ 7 枚・約 600KB）を最初に読み込んでいた、安全ページの 24px のアイコンに 976px・800KB の png を使っていた、
  写真の切り替えの 2・3 枚目を即時読み込みしていた。
  トップが目標（85）に届かなかった原因: ファーストビューのモザイク（9 枚）とすぐ下の MISSION の写真が、表示幅 140〜410px に対して幅 768px の small（各 80〜120KB）を読み込んでいた。
  ほかに全ページ共通で JS 約 180KB（React・React Router・GSAP）と Google Fonts の CSS（約 117KB）がある。
  Performance はシミュレーションの揺れもあるため Lighthouse CI では warn にしている（[development.md](./development.md#lighthouse-ci)）

- トップの写真の縮小（2026-11-05、`perf/top-photos`）。モザイクと MISSION の背景の写真のうち small の短辺が 400px を超える 7 枚
  （`wf-112-hero`・`wf-079-hero`・`wf-095-hero`・`wf-086-hero`・`wf-092-hero`・`wf-079`・`wf-092`）について、
  短辺 400px の xsmall（各 23〜47KB、計 240KB。`scripts/photo-xsmall.py`）を書き出し、`srcset` に加えた。
  モザイクの `sizes`（34vw）はそのままで、Lighthouse のモバイル（幅 412px・DPR 1.75）では xsmall が選ばれる。
  MISSION の背景は濃さ 16% で細部が見えないため、スマホでは `sizes` を 45vw にして xsmall か幅 360px の small を選ばせた（PC は従来どおり 100vw）。
  ファーストビューの写真は React が `<link rel="preload">` を出し、1 枚目に `fetchpriority="high"` が付いているため、preload の追加は不要だった。
  読み込む量はトップ全体で 2,062KB → 1,890KB（ファーストビューの 9 枚は約 450KB → 約 250KB、MISSION の 3 枚は約 300KB → 約 100KB）

  計測は Claude Code のクラウド環境（Linux・4 コア・Playwright の Chromium 1243）で、上の Mac の計測より CPU が遅く、回ごとの揺れも大きい
  （TBT が 300〜1,400ms、外部の Google Fonts の応答で FCP が 8 秒になる回がある）。同じ環境で前後を比べた値:

  | トップ              | Performance（各回）                             | FCP / LCP（中央の回） |
  | ------------------- | ----------------------------------------------- | --------------------- |
  | 縮小前              | 64・39・45                                      | 2.5 秒 / 5.4 秒       |
  | 縮小後              | 70・65・72、57・68・63（2 回目は lhci autorun） | 2.5 秒 / 4.3 秒       |
  | 参考: 残り 8 枚なし | 77・77・79                                      | 2.5 秒 / 3.5 秒       |

  「残り 8 枚なし」はビルドした HTML からモザイクの 2〜9 枚目を外して計った参考値（写真を軽くして得られる上限の目安）。
  画面外の写真（VEHICLE・GALLERY など）を外しても LCP は 4.3 → 4.1 秒しか縮まなかった。
  写真だけでは 85 に届かず、残りの原因は FCP（2.5 秒。全ページ共通の JS 約 180KB と Google Fonts の CSS 約 117KB）と、
  JS の実行（TBT。React の hydrate と GSAP）。ユーザーの判断（2026-11-05）で、フォントや JS の軽量化はこれ以上行わない。Lighthouse CI の Performance は warn のまま

- 移行の分岐後に main（WordPress）へ入ったクライアントの修正要望を React 版にも取り込んだ。PR #41・#43 は PR #42、#45・#46 は PR #44、#47・#48 は `migration/port-main-fixes`。
  退職者が写っている wf-100 と、掲載をやめた wf-087 は削除し、wf-117・wf-118・wf-084 に差し替えた（`web/scripts/mediaReferences.test.ts` で再登場を防ぐ）。
  s08 の動画は冒頭 6 秒をカットした版に、s08〜s14 の poster は P4 で ffmpeg で作ったものから main の版に替えた。旧テーマ（PHP）も main と同じ内容にそろえた
- P9 で動画の poster を画面に近づいてから付けるようにしたため、JS が動かない環境では動画の場所が黒いままになる（以前は poster が出ていた）

## ユーザー確認待ち

1. 本番を Firebase Hosting に切り替える時期と sakura 環境の廃止（P10）
2. `scripts/generate-pdfs.js` を残すか（P11）→ 削除した（docker の WordPress が前提で、旧テーマとともに不要になったため）
3. 旧ミッションページ本文の誤字と思われる箇所「当社の方々に住みやすく」（地域の方々に？）「毎日２行っている」（毎日行っている？）を原文のまま移植した → 2026-11-04 にパンフレットの文面どおり「当社は、地域の方々に住みやすく、ゴミの無い街づくりを約束いたします」「毎日２回行っている」に修正（旧テーマも同じ）
4. 車両ページの副題「現場を支える12種類の頼れる相棒」に対し、掲載している主要車両は 5 種類（旧サイトのまま移植）
5. 安全ページの取り組みの 1 件目と 3 件目の見出しがどちらも【安全朝礼】（3 件目の写真は打ち合わせの様子）。原文のまま移植した
6. 採用ページの 1 日の流れの時刻「AM 00:00」は旧サイトの時点で仮の値
7. 採用フォームの個人情報の利用目的の文面（仮）と、送信内容の保持期間（inquiries 180 日・mail 30 日の提案値）。プライバシーポリシーのページは旧サイトにも無い
