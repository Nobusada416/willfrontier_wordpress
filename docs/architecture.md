# アーキテクチャ

ウィルフロンティア コーポレートサイトは、WordPress クラシックテーマから
**React + TypeScript + Vite + Firebase** 構成へ移行中である（進捗は [migration-progress.md](./migration-progress.md)）。

## 技術スタック

| 領域                 | 採用技術                                                                  | 備考                                                                         |
| -------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| UI                   | React 19 + TypeScript 6（strict）                                         |                                                                              |
| ルーティング・ビルド | React Router 7（framework mode）+ Vite 8                                  | `ssr: false` + `prerender` で全ページをビルド時に静的 HTML 化                |
| CSS                  | Tailwind CSS v4（`@tailwindcss/vite`）                                    | デザイントークンは `web/app/app.css` の `@theme`。複雑な部分のみ CSS Modules |
| フォント             | Google Fonts（Zen Maru Gothic / Quicksand）                               | 自前配信は `@font-face` だけで数百 KB になるため不採用                       |
| ホスティング         | Firebase Hosting                                                          | 設定は `firebase.json`                                                       |
| フォーム             | Cloud Functions v2 → Firestore → Trigger Email 拡張                       | 詳細は [forms.md](./forms.md)                                                |
| アニメーション       | GSAP 3（ScrollTrigger・`@gsap/react`）+ Lenis（慣性スクロール）           | 旧テーマの CDN 読み込みから npm 管理へ                                       |
| テスト               | Vitest + React Testing Library（jsdom）                                   | E2E は Playwright（P9 以降）                                                 |
| 静的解析             | ESLint 9（typescript-eslint strict / react-hooks / jsx-a11y）+ Prettier 3 |                                                                              |

## ディレクトリ構成

npm workspaces 構成。移行期間中は WordPress テーマ（ルート直下の `*.php` など）と並存する。

```
package.json            # workspaces: web / shared / functions
eslint.config.mjs  .prettierrc.json  tsconfig.base.json  .nvmrc
tsconfig.json           # ルート直下のテスト（tests/）用
.github/workflows/ci.yml
firebase.json  .firebaserc              # Hosting / Functions / Firestore / Emulator の設定
firestore.rules         # クライアントからの読み書きはすべて拒否
firestore.indexes.json  # inquiries・mail の expireAt に TTL を設定
extensions/firestore-send-email.env  # Trigger Email 拡張の非秘密の設定（導入は P10。forms.md の「メール」）
tests/rules/            # Firestore セキュリティルールのテスト（Emulator 上で実行）
shared/                 # @wf/shared: web と functions で共有するフォーム定義（zod）
  src/index.ts
  src/forms/formTypes.ts  # フォーム種別（contact / safety / recruit）
  src/forms/normalize.ts  # 全角→半角の正規化（電話番号・メールアドレス）
  src/forms/schemas.ts    # 3 フォームの入力チェック・送信値（inquirySchema）・メール本文の項目（FORM_FIELDS）。詳細は forms.md
  src/forms/submit.ts     # 送信処理との取り決め（関数名・戻り値・入力エラーの details の形）
functions/              # @wf/functions: Cloud Functions v2（Node 22 / ESM）
  esbuild.config.mjs    # @wf/shared と zod を lib/index.js にバンドル
  src/index.ts          # デプロイする関数の一覧（submitInquiry）
  src/globalOptions.ts  # 共通設定（asia-northeast1 / maxInstances 5）。関数の定義より先に import する
  src/submitInquiry.ts  # フォーム送信の callable 関数（App Check 強制）。結果を応答・HttpsError に変換し、batch で書き込む
  src/handleInquiry.ts  # 検証 → ボット判定 → inquiries・mail のドキュメント組み立て（Firebase に依存しない）
  src/buildMail.ts      # メールの件名・本文・返信先
  src/params.ts         # 宛先のパラメータ（CONTACT_MAIL_TO など）と App Check を強制するかの判定
  test/bundle.test.ts   # @wf/shared と zod がバンドルに取り込まれることの検証
web/
  react-router.config.ts  # ssr: false / prerender
  vite.config.ts          # Tailwind v4 + React Router
  vitest.config.ts
  app/
    root.tsx              # HTML の骨格（SkipLink・Header・main・Footer）・favicon とフォントの読み込み・アニメーション初期化（SmoothScroll と <head> のスクリプト）・エラー表示
    routes.ts             # content/pages.ts からルートを生成（一致しない URL は routes/not-found.tsx）
    app.css               # Tailwind v4 とデザイントークン
    content/
      pages.ts            # 全ページ定義（ルート・プリレンダー対象の唯一の情報源）
      navigation.ts       # ヘッダー・フッターのリンク定義
      site.ts             # サイト名・正式社名・キャッチコピー・URL
      home.ts             # トップだけで使う内容（ヒーローの写真・SERVICE の 5 項目・WORKFLOW・車両スライド・採用）
      gallery.ts          # GALLERY の写真・動画とタグ、絞り込み（filterGallery）
      cases.ts            # トップの施工事例の一覧（旧サイトの時点で仮の値）と、施工事例ページのヒーロー写真・主要施工事例
      company.ts          # 会社概要と拠点（横浜本社・WF-A.BASE）
      mission.ts          # ミッションページだけで使う内容（式の各語と色・丸写真の切り替え・「地域と共に」の写真一覧）
      service.ts          # サービスページだけで使う内容（図の 5 つの特長と画像の文字の書き起こし・事業内容のカード）
      workflow.ts         # 処理の流れページだけで使う内容（処理ネットワーク図の説明文・処理の 5 ステップ）
      vehicles.ts         # 車両ページだけで使う内容（ヒーローの写真・主要車両・背景動画・車両ギャラリー）
      safety.ts           # 安全ページだけで使う内容（安全の取り組み・背景動画・装備ギャラリー・お問い合わせ後の流れ・よくあるご質問）
      recruit.ts          # 採用ページだけで使う内容（募集職種とアイコン・1 日の流れ・従業員の声・応募の流れ・動画・職場環境の写真）
      contact.ts          # お問い合わせページだけで使う内容（ヒーローの写真・お問い合わせ後の流れ・よくあるご質問）
    features/forms/       # フォーム（ContactForm / SafetyForm / RecruitForm）と共通の hook useInquiryForm・送信失敗の案内 SubmitError（docs/forms.md）
    features/home/        # トップの各セクション（Hero / Mission / Service / Workflow / Vehicles / Gallery / CaseStudy / Safety / Recruit / Company）
                          # と共通の枠 HomeSection（見出し・葉・背景）、VehicleSlider（カルーセル）
    components/ui/        # MoreLink（セクション末尾の「もっと見る ▼」ボタン）
    components/layout/    # Header（PC ナビ・ハンバーガー）/ MobileNav / Footer / SkipLink / Logo
    components/motion/    # SmoothScroll（Lenis）/ IntroOverlay / HeadingReveal / FadeUp / Leaf
    components/media/     # Picture（写真）/ Video（自動再生動画）/ CrossfadeHero・MosaicHero（背景写真の切り替え）
    components/page/      # 下層ページ（P7）共通部品：SectionHeader（英字小見出し＋見出し＋説明文）/
                          # ContactCta（末尾のお問い合わせ誘導）/ PhotoMasonry（写真の一覧）/
                          # PhotoHero（写真を敷いたファーストビュー。車両・施工事例・お問い合わせ）
    components/form/      # TextField（ラベル・必須・エラーを結び付けた入力欄）/ CheckboxField / FormFrame（見出しを枠線に重ねた枠）/
                          # PillSubmitButton / Honeypot / SubmitDialog（送信完了）
    lib/firebase.ts       # フォーム送信時に Firebase（App Check・Functions）を遅延読み込みする
    lib/submitInquiry.ts  # 送信処理 submitInquiry の呼び出しと結果（ok / invalid / error）への変換
    lib/seo.ts            # buildMeta() / buildNotFoundMeta(): title・description・canonical・OGP、404 の noindex を組み立てる
    lib/media.ts          # 写真・動画の配信パスと寸法、クロスフェードの遅延計算
    lib/mediaManifest.json  # 写真・poster の実寸（npm run media:manifest -w web で生成）
    lib/motion/           # gsap（プラグイン登録・useMotion）/ headScript（<head> のインラインスクリプト）/ intro / scrollLock
    lib/useReducedMotion.ts  # OS の「視差効果を減らす」設定を返すフック
    test/                 # テスト用スタブ（matchMedia / IntersectionObserver）。GSAP が読み込み時に matchMedia を呼ぶため、既定の実装は web/vitest.setup.ts に置く
    routes/*.tsx          # 各ページ（not-found.tsx は 404 ページ）
  public/favicon.svg  favicon.ico  apple-touch-icon.png  # ロゴの「F」から作ったアイコン（ico は 16・32・48px、touch は白背景 180px）
  public/media/           # ハッシュなしで配信する画像・動画（/media/**）。旧テーマも P11 まではここを参照する
    photos/{small,large}/ # 写真（wf-NNN.webp。small・large とも寸法は写真ごとに異なる。実寸は lib/mediaManifest.json）
    videos/shorts/        # 動画（sNN.mp4）と poster（sNN.jpg、1 秒地点の静止画）
    images/               # ロゴ・イラスト・装飾画像
  scripts/create-404.mjs        # プリレンダーした /404 を 404.html へ移す（postbuild）
  scripts/verify-prerender.mjs  # ビルド後に各ページの title と h1、404.html の noindex を検証（postbuild）
  scripts/mediaReferences.ts    # ソースが参照するメディアを求める。テストで web/public に実在することを検証する
  scripts/mediaManifest.ts      # web/public/media の写真・poster の寸法を読み取る。テストで mediaManifest.json と一致することを検証する
  scripts/generate-media-manifest.ts  # mediaManifest.json を作り直す（npm run media:manifest -w web）
```

## 設計方針

- **ページ定義は 1 か所に集約する**: `web/app/content/pages.ts` の `PAGES` から
  `routes.ts` と `react-router.config.ts` の `prerender` を生成する。
  ナビゲーションのリンク先がすべてプリレンダー対象に含まれることをテストで保証している。
- **URL は現行サイトと同じ末尾スラッシュ形式**（`/mission/`）を維持する。
  - リンクやページ定義のパスは `/mission/` とし、Hosting の `trailingSlash: true` で `/mission` は `/mission/` へ 301 する。
  - ただし React Router の `prerender` には末尾スラッシュなし（`/mission`）で渡す。
    スラッシュ付きで渡すと中身の空の HTML が出力されるため（`prerenderPaths()` で変換済み）。
- **ヘッダー・フッター・`<main>` は `root.tsx` の `Layout` が持つ**: 各ページは `<main>` の中身だけを描画する。
  エラー表示や 404 ページにも同じヘッダー・フッターが付く。
- **meta はページ定義から生成する**: 各ルートは `export const meta = () => buildMeta(page)` とし、
  title・description・canonical・OGP を `content/pages.ts` と `content/site.ts` から組み立てる。
- **404 ページもプリレンダーする**: `*` ルートを `/404` としてプリレンダーし、ビルド後に `404.html` へ移す。
  Firebase Hosting は存在しない URL に `404.html` を 404 ステータスで返す。
- **写真・動画は部品を通して表示する**: 旧テーマの `wf_picture` / `wf_video` と同じく、スラッグ（`wf-079`、`shorts/s08`）だけを渡す。
  - `Picture`: `/media/photos/{small,large}/<slug>.webp` を `srcset` に並べた `<img>`。
    `srcset` の幅（w）と `width`・`height` 属性には実寸（`lib/mediaManifest.json`）を使う。
    旧実装は一律 768w / 1600w としていたが、実際の small は幅 117〜768px とばらばらで、粗い画像が選ばれることがあった。
    `width`・`height` で読み込み前から高さを確保するため、遅延読み込みの写真が後から読み込まれてもページの位置がずれない
    （`/#company` などへの移動後に位置がずれる不具合の対策。`Video` も poster の実寸を付ける）。
    旧実装の `<picture>` はフォールバックも webp で意味がなかったため使わない。既定は遅延読み込みで、
    ファーストビューの主画像だけ `priority`（即時読み込み＋`fetchpriority="high"`）を付ける。
  - `Video`: ミュート・ループの自動再生動画。画面に近づくまで `src` を付けず（旧実装は全動画を表示時に読み込んでいた）、
    画面外では一時停止する。自動で動く映像は止められる必要がある（WCAG 2.2.2）ため一時停止ボタンを付ける。
    「視差効果を減らす」設定では自動再生しない。
  - `CrossfadeHero`（3 枚の切り替え）/ `MosaicHero`（タイルの明滅）: 親要素いっぱいに広がる背景写真。
    装飾なので `aria-hidden` にし、アニメーションは `motion-safe:` で付ける（keyframes は [design-tokens.md](./design-tokens.md#アニメーション)）。
  - 旧実装はクラスを `<picture>` と `<img>` の両方に付けていたため、`opacity-40` などが二重にかかっていた。
    新実装は `<img>` だけに付けるので、ページ移植時に見た目を合わせる（トップの MISSION は `opacity-16`）。
- **トップページ（P6）は旧サイトで実際に表示されていた見た目に合わせる**
  - 旧 `style.css` の末尾にトップ用の上書き（`!important`）があり、見出しの色とフォント（`wf-text`・Quicksand）、
    セクションの背景（`wf-bg`）と上下の余白（100px、スマホ 64px）はテンプレートのクラスではなくこちらが効いていた。
  - テンプレートに書かれていても旧 CSS に含まれていなかったクラス（MISSION の暗い幕 `bg-black/40`、
    セクションの最小高さ `min-h-[calc(100vh-72px)]` など）は表示されていなかったため再現しない。
  - 旧実装の画面収め（COMPANY の `transform: scale()`、スマホで全セクションを高さ 1000px に固定）は廃止し、高さは中身に合わせる。
    旧サイトのスマホ表示はこの固定でセクション同士が重なって崩れていた。
  - 葉の装飾はスマホでは表示しない（文字に重なるため。旧実装も画像を隠していた）。
  - 車両スライダーは CDN の Swiper をやめ、自前の `VehicleSlider`（WAI-ARIA のカルーセル。前後ボタン・ページ送り・スワイプ・端で反対側へ戻る）にした。
    3 枚の単純な切り替えに依存を増やさないため。
  - GALLERY の絞り込みは `aria-pressed` で選択状態を伝え、表示件数を `role="status"` で読み上げる。
  - ヒーローの文字は、イントロの幕が消えてから（`useIntroDone`）順に表示する。h1 はヒーローのキャッチコピー、各セクションの見出しは h2。
  - 同じ文言の「もっと見る」が並ぶため、読み上げ用に行き先（例:「もっと見る（SERVICE）」）を補う。
- **アニメーションはプリレンダーと両立させる**（旧 `assets/js/animation.js` と各ページの埋め込みスクリプトを移植）
  - `window` などに触る処理は `useGSAP` / `useEffect` の中だけに置く。アニメーションは `useMotion`（`gsap.matchMedia`）で
    「動きを減らす」設定でないときだけ登録する。見出しのマスクは JS で DOM を書き換えず JSX で描画する（hydrate の不整合を防ぐ）。
  - 初期表示のちらつき防止: `<head>` のインラインスクリプトが `<html>` に `js` クラスを付け、`.js [data-reveal]` を隠す。
    React の準備ができなければ 3 秒後に `js` を外して内容を表示する（JS の読み込み失敗で内容が隠れたままにならないように）。
  - イントロ（トップのロゴ演出）は 1 セッションにつき 1 回（`sessionStorage`）。再生しない場合は `<head>` のスクリプトが
    `intro-skip` クラスを付けて幕を最初から隠す。JS が動かなくても幕は CSS だけで 3.5 秒後に消える。演出中はスクロールを止める。
  - 慣性スクロール（Lenis）は `gsap.ticker` で駆動して ScrollTrigger と同期する。「動きを減らす」設定では使わない。
    ページ遷移時のスクロール位置は React Router の `ScrollRestoration` に任せ、遷移後に `ScrollTrigger.refresh()` する。
- **Firestore はクライアントから直接触らない**: フォームの送信内容は個人情報を含むため、
  セキュリティルールで読み書きをすべて拒否し、Cloud Functions（Admin SDK）だけが書き込む。
- **shared は functions にバンドルする**: Firebase のデプロイは `functions/` だけをアップロードして
  `npm install` するため、ワークスペースの `@wf/shared` を解決できない。
  `functions/tsconfig.json` の `paths` で `../shared/src` を参照し、esbuild で 1 ファイルにまとめる。
- **コンテンツは TypeScript の定数で管理する**: 旧テーマは WordPress の投稿機能を使っておらず、
  すべてテンプレートにハードコードされていたため CMS は導入しない。
