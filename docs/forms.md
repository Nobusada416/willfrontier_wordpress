# フォーム

サイトには 3 つのフォームがある。旧テーマは各テンプレートの PHP で `wp_mail` を直接呼んでいたが、
移行後は Cloud Functions で受け付けて Firestore に保存し、Trigger Email 拡張でメールを送る。

| 種別（`formType`） | ページ                            | 旧テンプレート     |
| ------------------ | --------------------------------- | ------------------ |
| `contact`          | お問い合わせ（`/contact/`）       | `page-contact.php` |
| `safety`           | 安全管理（`/safety/`）の下部      | `page-safety.php`  |
| `recruit`          | 採用（`/recruit/`）の応募フォーム | `page-recruit.php` |

## 入力チェック（`@wf/shared`）

入力チェックは `shared/src/forms/schemas.ts` の zod スキーマ 1 か所で定義し、
画面（react-hook-form）と送信処理（Cloud Functions）の両方で同じものを使う。

- 必須項目は旧フォームの必須チェックに合わせる
  - contact: 担当者名・電話番号・内容（会社名は任意）
  - safety: 担当者名・電話番号（フリガナ・会社名・メールアドレス・問い合わせ内容は任意）
  - recruit: お名前・フリガナ・ご住所・電話番号・メールアドレス（確認用も）・希望職種・最終学歴・備考
- 前後の空白を除いてから判定する（空白だけの入力は未入力）
- 1 行の項目に入った改行・タブ・制御文字（C0・C1）と Unicode の行区切り・段落区切りは空白にする（旧実装の `sanitize_text_field` と同じく、メールの件名や「項目名：値」の行の偽装を防ぐ）。複数行の項目（内容・問い合わせ内容・職歴・備考）は改行だけを残す
- 電話番号・メールアドレスは全角を半角にそろえる（`normalize.ts`）。電話番号はハイフンに似た文字（長音・全角マイナスなど）も `-` にし、数字が 10〜15 桁・全体で 25 文字以内であること
- 任意のメールアドレスは、入力された場合だけ形式を確かめる
- 採用応募は確認用メールアドレスとの一致（全角・半角と大文字・小文字の違いは無視）と、個人情報の取り扱いへの同意（旧フォームには無かった）を必須にする
- 各項目に文字数の上限を設ける（名前 50・会社名 100・内容 2000 など）

### 送信値

送信処理は `inquirySchema`（`formType` で 3 フォームを見分ける discriminated union）で検証する。
スキーマに無い項目は取り除く。

### ボット対策（honeypot）

各フォームに人には見えない入力欄 `wf_hp` を置く（`website` などの名前はブラウザの自動入力が値を入れ、人の送信を捨ててしまうおそれがあるため避けた）。値が入っていればボットとみなす（`isSpam()`）。
検証エラーにするとボットに対策を学習されるため、スキーマでは受け付け、送信処理で保存せずに成功を返す。送信処理は検証より先に判定し、ほかの項目が不正でも入力エラーの詳細を返さない。

### メール本文の項目

`FORM_FIELDS` にフォームごとのメール本文の項目名と順番を持つ（画面の項目名と同じ）。
確認用メールアドレス・同意・隠し項目はメールに載せない。

## 送信処理（Cloud Functions）

画面は callable 関数 `submitInquiry`（`functions/src/submitInquiry.ts`、`asia-northeast1`）を呼ぶ。
関数名・戻り値・エラーの形は `@wf/shared`（`shared/src/forms/submit.ts`）に置き、画面と送信処理で共有する。

```ts
import { getFunctions, httpsCallable } from 'firebase/functions'
import { FirebaseError } from 'firebase/app'
import {
  isInquiryErrorDetails,
  SUBMIT_INQUIRY_FUNCTION,
  type InquiryPayload,
  type SubmitInquiryResponse,
} from '@wf/shared'

const submit = httpsCallable<InquiryPayload, SubmitInquiryResponse>(
  getFunctions(app, 'asia-northeast1'),
  SUBMIT_INQUIRY_FUNCTION,
)

try {
  await submit({ formType: 'contact', ...values }) // → { ok: true }
} catch (error) {
  // callable のエラーコードは 'functions/invalid-argument' のように接頭辞付きで届く
  if (error instanceof FirebaseError && error.code === 'functions/invalid-argument') {
    const details = (error as FirebaseError & { details?: unknown }).details
    if (isInquiryErrorDetails(details)) {
      for (const { path, message } of details.issues) setError(path, { message })
    }
  }
}
```

| 結果                             | 応答                                                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 受け付けた                       | `{ ok: true }`                                                                                             |
| ボット（隠し項目 `wf_hp` あり）  | `{ ok: true }`（受け付けたときと同じ。保存もメール送信もしない）                                           |
| 入力エラー                       | `HttpsError('invalid-argument')`。`details` は `{ issues: { path: string; message: string }[] }`           |
| App Check のトークンがない・不正 | `HttpsError('unauthenticated')`（firebase-functions が返す）                                               |
| 想定外のエラー                   | `HttpsError('internal')`。原因（Firestore の障害・宛先の設定漏れなど）はログにだけ記録し、画面には返さない |

- `issues[].path` は項目名（`name`・`emailConfirm` など）で、react-hook-form の `setError` にそのまま渡せる。
  項目に紐づかないエラー（送信値がオブジェクトでないなど）は空文字。`formType` が不正な場合は `formType`
- 画面で同じスキーマの検証を通してから送るため、入力エラーは通常は起きない（画面を通さない送信への備え）
- ログには ID・フォーム種別・エラーの項目名だけを残し、入力値（個人情報）は記録しない

### 処理の分担

onCall のラッパーは薄くし、Firebase に依存しない純粋な関数に分けてテストする（firebase-functions-test は使わない）。

| ファイル           | 役割                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `handleInquiry.ts` | ボット判定（`isSpam`。検証エラーの詳細をボットに返さないよう先に行う）→ 検証（`inquirySchema`）→ 保存するドキュメントの組み立て → 保存。現在時刻・ID・宛先・保存処理は引数で受け取る |
| `buildMail.ts`     | 件名・本文・返信先の組み立て                                                                                                                                                         |
| `submitInquiry.ts` | 結果を応答・`HttpsError` に変換し、Firestore の batch で書き込む（`commitWrites`）                                                                                                   |
| `params.ts`        | 宛先のパラメータ（`defineString`）と App Check を強制するかの判定                                                                                                                    |
| `globalOptions.ts` | 共通設定（リージョン・`maxInstances`）                                                                                                                                               |

`onCall` は定義した時点の共通設定（`setGlobalOptions`）を読む。ESM では `import` が先に評価されるため、
`index.ts` の本文で `setGlobalOptions` を呼ぶと関数の定義より後になり、リージョンが既定（`us-central1`）になってしまう。
そのため `globalOptions.ts` を関数を定義するモジュールの先頭で `import` し、`index.test.ts` でリージョンを確かめている。

### App Check（reCAPTCHA v3）

`submitInquiry` は `enforceAppCheck: true` で、App Check のトークンがない呼び出しを拒否する。
ただし **Functions Emulator 上では強制しない**（`FUNCTIONS_EMULATOR=true` のとき。`params.ts` の `shouldEnforceAppCheck`）。

- Emulator はトークンの署名を検証せず読むだけのため、強制しても保護にならない
- `demo-` プロジェクトでは App Check のトークン（debug token を含む）を取得できず、強制すると画面から一切送信できない
- 判定は Emulator が設定する環境変数だけで行い、本番で誤って無効にできる設定（パラメータなど）は設けない

App Check の動作確認（reCAPTCHA v3 のサイトキー・debug token の登録）は、本番プロジェクトを用意する P10 で行う。
トークンの再利用対策（`consumeAppCheckToken` と limited-use トークン）は使っていない。必要になれば P10 で検討する。

## 保存するデータと TTL

受け付けた内容は、同じ ID の 2 つのドキュメントを **1 つの batch** で書き込む（どちらか一方だけが保存されることはない）。
日時は `Date` で渡し、Admin SDK が Timestamp として保存する。

| パス             | 内容                                                                                                                                                       | 保持期間 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `inquiries/{id}` | `formType`・`values`（検証後の値。確認用メールアドレスと隠し項目は除く。採用応募の同意 `privacyConsent: true` は記録として残す）・`receivedAt`・`expireAt` | 180 日   |
| `mail/{id}`      | Trigger Email 拡張の形式（`to`・`replyTo`・`message: { subject, text }`）・`expireAt`                                                                      | 30 日    |

- 削除は Firestore の TTL ポリシーで行う（`firestore.indexes.json` の `fieldOverrides` で `inquiries` と `mail` の `expireAt` に `ttl: true`）。
  TTL の削除は期限から最大 24 時間ほど遅れることがある。`expireAt` は検索に使わないため単一フィールドのインデックスを作らない（`indexes: []`）
- `mail` の本文には問い合わせと同じ個人情報が入り、送信結果（拡張が書き込む `delivery`）の確認にしか使わないため、`inquiries` より短くする
- Firestore のセキュリティルールはすべて拒否のまま（Admin SDK はルールの対象外）。内容の確認は Firebase コンソールか Admin SDK で行う
- **確認事項**: 保持期間（`inquiries` 180 日・`mail` 30 日）は提案値。個人情報の取り扱い方針（プライバシーポリシー）と合わせて確定する。
  変更する場合は `functions/src/handleInquiry.ts` の `INQUIRY_RETENTION_DAYS` / `MAIL_RETENTION_DAYS` を変える（既存のドキュメントの `expireAt` は変わらない）

## メール

メールは Trigger Email 拡張（`firebase/firestore-send-email`）が `mail` コレクションを監視して SMTP で送る。

- 宛先はフォーム種別ごとのパラメータ `CONTACT_MAIL_TO` / `SAFETY_MAIL_TO` / `RECRUIT_MAIL_TO`（`defineString`）。コードには書かない。
  既定値を持たないため、値がないとデプロイ時に入力を求められる。複数の宛先はカンマ区切り。実行時に空だった場合は保存せず `internal` を返す
- 件名は旧テンプレートと同じ
  - contact: `【ウィルフロンティア】お問い合わせ：{担当者名} 様`
  - safety: `【ウィルフロンティア】お問い合わせ`
  - recruit: `【ウィルフロンティア】採用応募`
- 件名に入れる入力値（担当者名）は、改行などの制御文字（`\p{Cc}`・行区切り・段落区切り）を空白 1 つに置き換える（メールヘッダー・インジェクション対策）
- 本文は plain text（`message.text`）。旧テンプレートと同じく「項目名：値」を `FORM_FIELDS` の順に 1 行ずつ。
  複数行の値は「項目名：」の次の行から載せる。改行コードは LF にそろえ、改行・タブ以外の制御文字は取り除く。未入力の任意項目は「項目名：」だけ
- 返信先（`replyTo`）は、メールアドレスが入力されている場合だけ付ける（safety は任意項目のため入力時のみ、recruit は常に、contact は項目がないため付けない）

### 拡張の設定（`extensions/firestore-send-email.env`）

非秘密の設定（データベース・リージョン・`MAIL_COLLECTION=mail`・差出人の仮の値・TTL を使わない設定）だけを置く。

- SMTP の接続文字列（`SMTP_CONNECTION_URI`）とパスワード（`SMTP_PASSWORD`、Secret Manager）はファイルに書かず、導入時に入力する
- 拡張の TTL（`delivery.expireAt`）は使わない（`TTL_EXPIRE_TYPE=never`）。`submitInquiry` が最上位に書く `expireAt` で削除する
- `firebase.json` の `"extensions"` にはまだ登録していない。登録すると `firebase deploy` で拡張がインストールされ、
  `firebase emulators:start` でも Extensions Emulator が拡張のソースを取得して起動しようとするため、導入（P10）と同時に登録する

P10 で行うこと:

1. `firebase.json` に `"extensions": { "firestore-send-email": "firebase/firestore-send-email@<バージョン>" }` を追加する（バージョンは固定する）
2. `DEFAULT_FROM`・`DATABASE_REGION`（本番の Firestore のロケーション）を確定する
3. `firebase deploy --only extensions` で SMTP の接続文字列・パスワードを入力する
4. 宛先のパラメータ（`CONTACT_MAIL_TO` など）を本番用に設定する（`functions/.env.<プロジェクト ID>` をコミットするか、デプロイ時の入力にするかを決める）

## ローカル開発（Emulator）

### 宛先のパラメータ

Emulator は `functions/.env.local`（git 管理外）を読む。次の内容で作る（実在のアドレスは使わない）。
ファイルがないと、Emulator の起動時に値の入力を求められる（`emulators:exec` など対話できない実行では関数の読み込みに失敗する）。

```dotenv
CONTACT_MAIL_TO=contact@example.com
SAFETY_MAIL_TO=safety@example.com
RECRUIT_MAIL_TO=recruit@example.com
```

### 起動と確認

```bash
npm run emulators   # functions をビルドしてから Functions・Firestore・Hosting の Emulator を起動する
```

- 画面は `connectFunctionsEmulator(functions, '127.0.0.1', 5001)` で Emulator の関数を呼ぶ（Functions Emulator では App Check を強制しない）
- 保存されたドキュメント（`inquiries`・`mail`）は Emulator UI（http://localhost:4000/firestore）で確認する
- Emulator では関数のコードを変えても自動で反映されない（`lib/index.js` を監視しているため）。`npm run build -w @wf/functions` で作り直す
- 手で呼ぶ場合（callable は `{"data": ...}` の形で POST する）:

  ```bash
  curl -X POST -H 'Content-Type: application/json' \
    http://127.0.0.1:5001/demo-willfrontier/asia-northeast1/submitInquiry \
    -d '{"data":{"formType":"contact","company":"","name":"山田 太郎","tel":"03-1234-5678","message":"テスト"}}'
  ```

### メール送信の確認（任意・Mailpit）

拡張を登録していないため、Emulator ではメールは送られない（`mail` にドキュメントが作られるところまで）。
メールの見た目まで確認したい場合は、[Mailpit](https://mailpit.axllent.org/)（ローカルの SMTP サーバーと受信箱）を使う。

1. `docker run -d --name mailpit -p 8025:8025 -p 1025:1025 axllent/mailpit`（受信箱は http://localhost:8025）
2. 一時的に `firebase.json` に拡張を登録し、`extensions/firestore-send-email.env.local`（git 管理外）に
   `SMTP_CONNECTION_URI=smtp://127.0.0.1:1025` を書く（Extensions Emulator が拡張のソースを取得するためネットワーク接続が必要）
3. `npm run emulators` で起動し、フォームを送信すると Mailpit にメールが届く
## 画面（web）

- `web/app/features/forms/useInquiryForm.ts`: 3 フォーム共通の hook。react-hook-form + `zodResolver`（`@wf/shared` のスキーマ）で入力をチェックし、送信・送信後の状態（完了ダイアログ・失敗の案内）を管理する
  - 送信中はボタンを押せなくして二重送信を防ぐ
  - 送信処理の入力チェックで弾かれた場合（`invalid-argument`）は、その項目にエラーを出して最初の項目へフォーカスを移す
  - 通信エラーなどで送れなかった場合は入力を残し、電話での連絡先を含む案内（`SubmitError`、`role="alert"`）を出す
  - フォームに初めてフォーカスが入ったときに Firebase の読み込みを始める（`prepareSubmitInquiry`）
- `web/app/features/forms/`: `ContactForm`（お問い合わせページ）・`SafetyForm`（安全ページ下部）・`RecruitForm`（採用ページ）
  - 安全・採用のフォームは、見出しを枠線に重ねた旧デザインを `fieldset` と `legend`（`FormFrame`）で作り、見出しをフォームの名前にする
  - 採用応募の確認用メールアドレスは、旧実装ではラベルの無い 2 つ目の入力欄だったため「メールアドレス（確認用）」のラベルを付けた。職歴・備考は複数行の入力欄にした
  - 採用応募に個人情報の取り扱いへの同意（`CheckboxField`）を加えた。利用目的の文面（「採用選考とそのご連絡のためにのみ利用します」）は仮で、確認が必要
- `web/app/components/form/`: `TextField`（ラベル・必須バッジ・補足・エラー文を入力欄に結び付ける。枠つきの `boxed` と［ ］で挟む `bracket`）、`CheckboxField`、`FormFrame`、`PillSubmitButton`、`Honeypot`、`SubmitDialog`（送信完了。ネイティブの `<dialog>` をモーダルで開く）
- 旧実装の `?sent=1` 付き URL への移動と、「閉じる」での `history.back()` は廃止した。送信後はページを移動せずにダイアログを出し、入力欄を空にする
- 旧実装はエラーをページ上部にまとめて出すだけで、ラベルと入力欄も結び付いていなかった。エラーは項目の下に出し、入力欄の説明として読み上げさせる（`aria-invalid`・`aria-describedby`）。必須の項目には「必須」を表示する
- スマホで入力欄にフォーカスしたときに iOS が画面を拡大しないよう、入力欄の文字はスマホで 16px にする

### Firebase の読み込み（`web/app/lib/firebase.ts`・`submitInquiry.ts`）

Firebase の SDK は大きいため、ページ表示時には読み込まず、フォームの操作を始めたときに dynamic import する（ビルドでは別チャンクになる）。
App Check（reCAPTCHA v3）を初期化してから、`asia-northeast1` の `submitInquiry` を `httpsCallable` で呼ぶ。

| 環境変数（`web/.env.local` など）  | 内容                                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`            | Firebase の Web アプリ設定                                                                |
| `VITE_FIREBASE_PROJECT_ID`         | 同上                                                                                      |
| `VITE_FIREBASE_APP_ID`             | 同上                                                                                      |
| `VITE_RECAPTCHA_SITE_KEY`          | App Check（reCAPTCHA v3）のサイトキー                                                     |
| `VITE_USE_FIREBASE_EMULATORS=true` | Emulator に接続する。上の 4 つが無ければ demo プロジェクト（`demo-willfrontier`）で動かす |

本番向けのビルドで設定が欠けている場合は、送信時に欠けている変数名を挙げて失敗する（画面には送信失敗の案内が出る）。
