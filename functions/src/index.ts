import { setGlobalOptions } from 'firebase-functions/v2'

// 全関数の共通設定。フォーム送信は国内ユーザー向けのため東京リージョンに置き、
// 不正な大量送信によるコスト増を防ぐためインスタンス数に上限を設ける
setGlobalOptions({ region: 'asia-northeast1', maxInstances: 5 })

// 各関数は P8（フォーム）で追加する
