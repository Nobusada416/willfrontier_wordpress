# アーキテクチャ

ウィルフロンティア コーポレートサイトは、WordPress クラシックテーマから
**React + TypeScript + Vite + Firebase** 構成へ移行中である（進捗は [migration-progress.md](./migration-progress.md)）。

## 技術スタック

| 領域                 | 採用技術                                                                        | 備考                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| UI                   | React 19 + TypeScript 6（strict）                                               |                                                                                                                 |
| ルーティング・ビルド | React Router 7（framework mode）+ Vite 8                                        | `ssr: false` + `prerender` で全ページをビルド時に静的 HTML 化                                                   |
| CSS                  | Tailwind CSS v4（`@tailwindcss/vite`）                                          | デザイントークンは `web/app/app.css` の `@theme`。複雑な部分のみ CSS Modules                                    |
| フォント             | Google Fonts（Zen Maru Gothic / Quicksand）                                     | 自前配信は `@font-face` だけで数百 KB になるため不採用。描画を止めないようスクリプトで読み込む                  |
| ホスティング         | Firebase Hosting                                                                | 設定は `firebase.json`                                                                                          |
| フォーム             | Cloud Functions v2 → Firestore → Trigger Email 拡張                             | 詳細は [forms.md](./forms.md)                                                                                   |
| アニメーション       | GSAP 3（ScrollTrigger・`@gsap/react`）+ Lenis（慣性スクロール）                 | 旧テーマの CDN 読み込みから npm 管理へ                                                                          |
| テスト               | Vitest + React Testing Library（jsdom）/ Playwright + axe（E2E）/ Lighthouse CI | E2E と Lighthouse はビルド済みの静的サイトに対して実行（[development.md](./development.md#e2eplaywright--axe)） |
| 静的解析             | ESLint 9（typescript-eslint strict / react-hooks / jsx-a11y）+ Prettier 3       |                                                                                                                 |

## ディレクトリ構成

npm workspaces 構成。移行期間中は WordPress テーマ（ルート直下の `*.php` など）と並存する。

```
package.json            # workspaces: web / shared / functions
eslint.config.mjs  .prettierrc.json  tsconfig.base.json  .nvmrc
tsconfig.json           # ルート直下のテスト（tests/）と運用スクリプト（tools/）用
.github/workflows/ci.yml
firebase.json  .firebaserc              # Hosting / Functions / Firestore / Storage / Emulator の設定
firestore.rules         # 公開の施工事例の読み取りと管理者（admin クレーム）の編集だけを許可。ほかはすべて拒否
storage.rules           # 施工事例の写真（case-studies/）の読み取りと管理者のアップロードだけを許可
firestore.indexes.json  # caseStudies の status + date の複合インデックス、inquiries・mail の expireAt に TTL
extensions/firestore-send-email.env  # Trigger Email 拡張の非秘密の設定（導入は P10。forms.md の「メール」）
tests/rules/            # Firestore・Storage のセキュリティルールのテスト（Emulator 上で実行）
tests/integration/      # Emulator での結合テスト（フォームの送信・管理者の付与・施工事例の管理画面の Firebase の操作・移行）
tools/                  # 運用スクリプト（node --experimental-strip-types で実行。shared は import の無い constants.ts だけを拡張子付きで読む）
  grant-admin.ts        # 管理画面の管理者（カスタムクレーム admin）を付ける・外す（npm run admin:grant）
  seed-case-studies.ts  # 旧サイトの施工事例 3 件を Firestore・Storage に下書きで入れる（npm run seed:case-studies）
shared/                 # @wf/shared: web と functions で共有する定義（zod）
  src/index.ts
  src/text.ts             # 文字列の入力チェックの部品（必須・任意・改行の扱い）。zod の jitless の設定もここ
  src/caseStudies/constants.ts  # 施工事例のコレクション名・Storage のパスの規則・画像サイズ・上限
  src/caseStudies/schema.ts     # 施工事例の編集フォーム（caseStudyFormSchema）と保存される内容（caseStudyContentSchema）
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
  vitest.config.ts        # ユニットテスト（app/・scripts/ の *.test.ts(x)。e2e/ は含めない）
  playwright.config.ts    # E2E（Chromium。webServer で scripts/serve-static.ts を起動）
  playwright.admin.config.ts  # 管理画面の E2E（Emulator につなぐ開発サーバーで配信。ルートの npm run e2e:admin）
  lighthouserc.json       # Lighthouse CI（モバイル・主要 5 ページ・目標値）
  e2e/                    # E2E（*.spec.ts）。axe（a11y）・キーボード操作・フォーム・画面遷移・コンソールエラー
    support/axe.ts        # axe の実行と、許容するコントラスト不足の振り分け
    support/knownContrastIssues.ts  # やむを得ず許容するコントラスト不足の色の組み合わせ（P9 で色を直したため現在は空）
    support/page.ts       # hydrate を待つ移動・外部への通信の遮断
    admin/                # 施工事例の管理画面の E2E（Emulator の Auth・Firestore・Storage につなぐ。npm run e2e:admin）
  app/
    root.tsx              # HTML の骨格（SkipLink・Header・main・Footer。管理画面（/admin/）では出さない）・favicon とフォントの読み込み（<head> のスクリプト）・アニメーション初期化（SmoothScroll と <head> のスクリプト）・エラー表示
    routes.ts             # content/pages.ts からルートを生成（一致しない URL は routes/not-found.tsx）
    app.css               # Tailwind v4 とデザイントークン
    content/
      pages.ts            # 全ページ定義（ルート・プリレンダー対象の唯一の情報源）。管理画面の 3 画面（ADMIN_PAGES）も
                          # ここで定義するが、サイトのページ一覧（PAGES。sitemap・ナビ）とは分ける
      navigation.ts       # ヘッダー・フッターのリンク定義
      site.ts             # サイト名・正式社名・キャッチコピー・URL・OGP 画像（寸法と代替テキスト）・構造化データのロゴ
      home.ts             # トップだけで使う内容（ヒーローの写真・SERVICE の 5 項目・WORKFLOW・車両スライド・採用）
      gallery.ts          # GALLERY の写真・動画とタグ、絞り込み（filterGallery）
      cases.ts            # トップの施工事例の一覧（旧サイトの時点で仮の値）と、施工事例ページのヒーロー写真・主要施工事例
      company.ts          # 会社概要と拠点（横浜本社・WF-A.BASE）・設立日（構造化データ用）
      mission.ts          # ミッションページだけで使う内容（式の各語と色・丸写真の切り替え・「地域と共に」の写真一覧）
      service.ts          # サービスページだけで使う内容（図の 5 つの特長と画像の文字の書き起こし・事業内容のカード）
      workflow.ts         # 処理の流れページだけで使う内容（処理ネットワーク図の説明文・処理の 5 ステップ）
      vehicles.ts         # 車両ページだけで使う内容（ヒーローの写真・主要車両・背景動画・車両ギャラリー）
      safety.ts           # 安全ページだけで使う内容（安全の取り組み・背景動画・装備ギャラリー・お問い合わせ後の流れ・よくあるご質問）
      recruit.ts          # 採用ページだけで使う内容（募集職種とアイコン・1 日の流れ・従業員の声・応募の流れ・動画・職場環境の写真）
      contact.ts          # お問い合わせページだけで使う内容（ヒーローの写真・お問い合わせ後の流れ・よくあるご質問）
    features/admin/       # 施工事例の管理画面（docs/case-studies.md）。AdminShell（ログインの判定・ヘッダー）/ LoginScreen /
                          # CaseStudyListScreen（一覧・公開の切り替え）/ CaseStudyEditor（編集・写真・削除・未保存の確認）/
                          # photos.ts（ブラウザで webp・JPEG に縮小）/ api.ts（画面が使う操作の型）/ firebaseAdminApi.ts（その Firebase での実装）/
                          # loadAdminApi.ts（Auth・Firestore・Storage の SDK の準備。管理画面のレイアウトから import() する）
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
    lib/firebase.ts       # Firebase の設定の読み取り・アプリの作成（フォームと管理画面で共通）・Emulator の接続先と、
                          # フォーム送信時の App Check・Functions の遅延読み込み
    lib/firebaseEnv.ts    # Firebase に必要な環境変数（VITE_FIREBASE_*・VITE_RECAPTCHA_SITE_KEY）の判定と Storage のバケット。デプロイ前の確認と共通
    lib/submitInquiry.ts  # 送信処理 submitInquiry の呼び出しと結果（ok / invalid / error）への変換
    lib/fonts.ts          # Google Fonts の URL と、stylesheet を描画を止めずに追加する <head> のインラインスクリプト
    lib/seo.ts            # buildMeta() / buildNotFoundMeta() / buildAdminMeta(): title・description・canonical・OGP・robots（noindex）・トップの JSON-LD、
                          # 404 と管理画面の noindex を組み立てる
    lib/indexing.ts       # 環境変数 VITE_ALLOW_INDEXING から検索エンジンへの登録の可否を判定（既定は禁止）
    lib/structuredData.ts # トップに出力する Organization（schema.org）の JSON-LD。住所を都道府県・市区町村・番地に分ける
    env.d.ts              # import.meta.env の型（VITE_ALLOW_INDEXING・VITE_FIREBASE_* など。例は web/.env.example）
    lib/media.ts          # 写真・動画の配信パスと寸法、クロスフェードの遅延計算
    lib/mediaManifest.json  # 写真・poster の実寸（npm run media:manifest -w web で生成）
    lib/motion/           # gsap（プラグイン登録・useMotion）/ headScript（<head> のインラインスクリプト）/ intro / scrollLock
    lib/useReducedMotion.ts  # OS の「視差効果を減らす」設定を返すフック
    test/                 # テスト用スタブ（matchMedia / IntersectionObserver）。GSAP が読み込み時に matchMedia を呼ぶため、既定の実装は web/vitest.setup.ts に置く
    routes/*.tsx          # 各ページ（not-found.tsx は 404 ページ）
    routes/admin/         # 管理画面（layout.tsx が共通の枠。index＝ログイン兼一覧・new＝新規作成・edit＝編集（?id=））
  public/favicon.svg  favicon.ico  apple-touch-icon.png  # ロゴの「F」から作ったアイコン（ico は 16・32・48px、touch は白背景 180px）
  public/og-image.jpg     # SNS シェア用の画像（1200×630。写真 wf-097 から切り出し）
  public/logo.png         # 構造化データのロゴ（512px 正方形・白背景。media/images/logocolor.svg から書き出し）
  public/media/           # ハッシュなしで配信する画像・動画（/media/**）。旧テーマも P11 まではここを参照する
    photos/{small,large}/ # 写真（wf-NNN.webp。small・large とも寸法は写真ごとに異なる。実寸は lib/mediaManifest.json）
                          # wf-NNN-hero.webp はトップヒーロー用に明るく加工した版（ルートの scripts/hero-highkey.py で生成）
    videos/shorts/        # 動画（sNN.mp4）と poster（sNN.jpg、1 秒地点の静止画）
    images/               # ロゴ・イラスト・装飾画像
  scripts/create-404.mjs        # プリレンダーした /404 を 404.html へ移す（postbuild）
  scripts/generate-seo-files.ts # sitemap.xml（404・管理画面を除く全ページ）と robots.txt（Disallow: /admin/）を build/client に書き出す（postbuild）
  scripts/seoFiles.ts           # sitemap.xml・robots.txt の中身を組み立てる純粋関数（URL の組み立て・XML エスケープ）
  scripts/verify-prerender.mjs  # ビルド後に各ページの title・h1・canonical・og:image、404.html の noindex、
                                # sitemap.xml と canonical の一致、robots.txt と noindex の方針の一致、管理画面の noindex と除外、
                                # 公開ページが管理画面の Firebase の SDK（Auth・Firestore・Storage）を読み込まないことを検証（postbuild）
  scripts/verify-deploy-env.ts  # デプロイ用のビルド（npm run build:deploy）の前に、Firebase の設定がそろっているかを確かめる
  scripts/serve-static.ts       # ビルド済みのサイトを配信する（E2E・Lighthouse 用。ポート 4313）
  scripts/staticRouting.ts      # 配信の振り分け（firebase.json の cleanUrls・trailingSlash・redirects・Cache-Control と同じ。404 は 404.html）
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
  - OGP 画像は全ページ共通の `og-image.jpg`（1200×630）で、`twitter:card` は `summary_large_image`。
  - トップページには会社情報の構造化データ（`Organization`。所在地は本社、両拠点を `location`）を出力する。
    React Router の meta の `"script:ld+json"` 記法を使い、JSON 中の `<` などのエスケープは React Router に任せる。
- **検索エンジンへの登録は既定で禁止し、ビルド時の環境変数で許可する**: 本番切り替え（P10）までは現行の
  WordPress サイトが本番のため、このビルドが検索結果に載らないようにする。
  `VITE_ALLOW_INDEXING=true` のときだけ許可し、それ以外（未設定を含む）は全ページに `<meta name="robots" content="noindex">` を付ける。
  robots.txt も同じ変数で切り替える（禁止時は `Disallow: /`、許可時は `Allow: /` と `Sitemap:` 行）。切り替え手順は [deployment.md](./deployment.md#本番切り替え時の-seo-設定) を参照。
- **sitemap.xml と robots.txt は postbuild で生成する**: `content/pages.ts` の全ページ（404 を除く）から、
  canonical と同じ URL（`SITE.url` + 末尾スラッシュ付きのパス）を並べる。インデックスの可否はアプリと同じく
  `VITE_ALLOW_INDEXING`（Vite の `loadEnv` で環境変数と `.env` 系ファイルを読む）で決める。
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
  - `Video`: ミュート・ループの自動再生動画。画面に近づくまで `src` と `poster` を付けず（旧実装は全動画を表示時に読み込んでいた。
    poster は `preload="none"` でも表示時に読み込まれ、トップでは画面外の poster だけで約 600KB あった）、
    画面外では一時停止する。自動で動く映像は止められる必要がある（WCAG 2.2.2）ため一時停止ボタンを付ける。
    「視差効果を減らす」設定では自動再生しない。
  - `CrossfadeHero`（3 枚の切り替え）/ `MosaicHero`（タイルの明滅）: 親要素いっぱいに広がる背景写真。
    装飾なので `aria-hidden` にし、アニメーションは `motion-safe:` で付ける（keyframes は [design-tokens.md](./design-tokens.md#アニメーション)）。
    `CrossfadeHero` の `priority` は 1 枚目だけを即時読み込みにし、4 秒後から表示される 2 枚目以降は遅延読み込みにして帯域を譲る。
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
    画像は webp（各 40KB 前後。旧テーマ用の同名 png は各 220KB で P11 で削除）を遅延読み込みにし、非表示のスマホでは読み込ませない。
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
- **Web フォントは描画を止めずに読み込む**: Google Fonts の CSS（日本語フォントの分割で 100KB 超）を
  `<link rel="stylesheet">` で直接読み込むと、別オリジンの CSS を取得し終えるまで最初の描画が止まる
  （P9 の Lighthouse でモバイルの FCP が 7 秒前後）。`<head>` のインラインスクリプト（`lib/fonts.ts`）から追加して
  描画を止めないようにし、先にシステムフォントで表示して読み込み後に切り替える。JS が動かない環境は `<noscript>` で読み込む。
  CSP を設定する際は、アニメーションの `<head>` スクリプトと同じくハッシュを許可する。
- **Firestore は施工事例だけをクライアントから触る**: フォームの送信内容（`inquiries`・`mail`）は個人情報を含むため、
  セキュリティルールで読み書きをすべて拒否し、Cloud Functions（Admin SDK）だけが書き込む。
  施工事例（`caseStudies`）だけは例外で、公開サイトが未ログインで読み、管理画面（`/admin/`）が直接書き込む（次項）。
- **shared は functions にバンドルする**: Firebase のデプロイは `functions/` だけをアップロードして
  `npm install` するため、ワークスペースの `@wf/shared` を解決できない。
  `functions/tsconfig.json` の `paths` で `../shared/src` を参照し、esbuild で 1 ファイルにまとめる。
- **コンテンツは TypeScript の定数で管理する。施工事例だけは管理画面で編集する**: 旧テーマは WordPress の投稿機能を使っておらず、
  すべてテンプレートにハードコードされていたため、汎用の CMS は導入しない。
  ただし施工事例は社内の非エンジニアが追加・公開したいため、Firebase の機能だけで小さな管理画面を作る（再デプロイなしで反映する）。
  - データ: Firestore の `caseStudies/{事例の ID}`（項目と上限は `shared/src/caseStudies/`）。写真は Storage の
    `case-studies/{事例の ID}/{写真の ID}-{small|large}.{webp|jpg}`（幅 768px・1600px。管理画面がブラウザで webp に変換し、
    webp を書き出せないブラウザ（Safari）では JPEG。`photos[].path` は拡張子付きの基準パスで、形式が分かる）
  - 公開: `status == 'published'` の事例だけを誰でも読める。一覧は `where('status', '==', 'published')` 付きのクエリだけが通る
    （ルールは絞り込みではないため）。公開サイトは Firestore の REST で読み、Firebase の SDK は読み込ませない
  - 編集: Firebase Auth でログインし、カスタムクレーム `admin: true` を持つユーザーだけが読み書きできる。
    新規登録の機能は置かず、アカウントと権限は開発側が `npm run admin:grant`（`tools/grant-admin.ts`）で付ける
  - 書き込みはルールで項目・型・長さ・`status`・写真の枚数（1〜4）・`updatedBy == request.auth.uid`・
    `updatedAt == request.time` を検証する（zod のスキーマと同じ上限。`tests/rules/` で確かめる）
  - App Check は Firestore・Storage には強制しない（REST の公開読み取りを軽く保つため。守りはルールで行う）
