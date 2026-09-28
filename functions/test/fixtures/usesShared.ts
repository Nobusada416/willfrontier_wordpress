// バンドル検証用: @wf/shared（と、その依存の zod）を使うエントリ
import { FORM_TYPES } from '@wf/shared'
import { onCall } from 'firebase-functions/v2/https'

export const fixture = onCall(() => FORM_TYPES)
