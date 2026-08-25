---
name: merge-pr
description: 未コミット変更があれば自動コミットし、push・PR作成・マージコミットでマージ・ローカルのデフォルトブランチへ同期まで一連で実行する
disable-model-invocation: true
---

# PRマージワークフロー（軽量版）

現在のfeatureブランチを GitHub のデフォルトブランチに取り込むまでの一連の手順を実行する。
未コミット変更があれば自動でコミットしてから push → PR 作成 → マージまで一気通貫で行う。
バージョンアップ・ビルド・デプロイは含まない（それらが必要な場合は `/release` を使う）。

$ARGUMENTS を引数として受け取る。引数で次のフラグを指定可能：
- `--squash`: スカッシュマージを使う（デフォルトは `--merge` = マージコミット方式）
- `--keep-branch`: マージ後にリモート/ローカルのブランチを削除しない（デフォルトは削除）
- `--no-auto-commit`: 未コミット変更があっても自動コミットせず停止する（デフォルトは自動コミット）
- `--dry-run`: 実際の操作を行わず、フロー全体を事前確認

各ステップは不可逆操作を含むため、**最初に全体プランを提示してユーザー確認を取り、その後は連続実行**する。
途中でエラーが発生した場合は即停止し、完了済みステップを明示する。

---

## 事前確認

1. **現在のブランチ名を取得**
   ```bash
   git branch --show-current
   ```
   - main / master の場合は「featureブランチから実行してください」と表示して**停止**

2. **デフォルトブランチを動的に特定**
   ```bash
   git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@'
   ```
   - 失敗時のフォールバック: `git branch -r | grep -E 'origin/(main|master)$' | head -1 | sed 's@origin/@@' | tr -d ' '`
   - どちらも失敗した場合はユーザー確認

3. **worktree 環境の検出**
   ```bash
   git worktree list
   ```
   - 出力が複数行（複数 worktree）かつ別 worktree がベースブランチを保持している場合、**worktree モード** として記録する
   - 現在のディレクトリが worktree（メインリポジトリ以外）の場合、`git checkout <ベースブランチ>` が失敗するため、後続ステップで分岐する

4. **未コミット変更の有無**
   ```bash
   git status --porcelain
   ```
   - 出力が**空**ならスキップしてステップ5へ
   - 出力が**ある**場合:
     - `--no-auto-commit` 指定時 → 「未コミットの変更があります。先にコミット/stashしてください」と表示して**停止**
     - 未指定時（デフォルト） → **自動コミットフロー**に進む（後述ステップ0）
       - 対象ファイル一覧を取得
       - センシティブ系（`.env`, `credentials*`, `*.key`, `*.pem`, `id_rsa*`）が含まれる場合は警告して**停止**
       - プロジェクトの `CLAUDE.md` 規約を読み取り、コミットメッセージ案を生成
         - 規約が存在しない場合のフォールバック: 英語、Conventional Commits 形式
         - 一般的な規約例: 日本語、`feat:` / `fix:` / `docs:` / `refactor:` / `test:` / `chore:` プレフィックス
         - 本文があれば箇条書きで主要な変更点を列挙

5. **コミット履歴の取得（PR本文生成用）**

   自動コミット予定がある場合は、コミット後の差分が PR 候補となる。
   ```bash
   git fetch origin <ベースブランチ>
   git log origin/<ベースブランチ>..HEAD --oneline
   ```
   - 自動コミットを行う場合は、その新コミットも含めた状態で PR タイトル・本文を生成
   - 出力が空（自動コミットも無し）なら「ベースブランチに対する差分がありません」と表示して**停止**

6. **PRタイトル・本文を自動生成**
   - タイトル: コミットメッセージの先頭行を集約。1コミットならそのまま、複数なら主要な変更を要約（70文字以内）
   - 本文: 以下のテンプレート

     ```markdown
     ## Summary
     - <主な変更を1〜3行>

     ## 変更点
     <git log の整形リスト>

     ## Test plan
     - [ ] <主な手動確認項目>

     🤖 Generated with [Claude Code](https://claude.com/claude-code)
     ```

7. **全体プランをユーザーに提示し、確認を取る**
   - 現在のブランチ / ベースブランチ
   - 自動コミット予定の有無 / コミットメッセージ案 / 対象ファイル一覧（自動コミット時のみ）
   - PRタイトル・本文
   - マージ方式（merge / squash）
   - ブランチ削除有無
   - worktree モードの有無（あれば「ローカルデフォルトブランチへの同期/ローカルブランチ削除はメイン worktree 側で実施」と注記）

ユーザー確認後は連続実行する（個別ステップごとの再確認は不要）。

---

## ステップ0: 自動コミット

事前確認 4 で**未コミット変更があり** & `--no-auto-commit` 未指定の場合のみ実行：

```bash
git add <変更ファイル一覧>     # -A は使わず明示指定（センシティブ混入防止）
git commit -m "<生成メッセージ>"
```

`--dry-run` の場合は実コミットせずメッセージ案を表示するのみ。

- pre-commit hook 等で失敗した場合は**即停止**し、修正後の再実行を案内
- コミット成功時は短縮 SHA とメッセージ先頭行を記録（完了サマリーで使用）

---

## ステップ1: ベースブランチをマージ

`--dry-run` でなければ実行：

```bash
git fetch origin <ベースブランチ>
git merge origin/<ベースブランチ> --no-edit
```

- `Already up to date.` ならスキップしてステップ2へ
- マージコンフリクトが発生した場合は**即停止**してユーザーに報告。`git merge --abort` を促す
- マージコミットが作成された場合はそれを保持

---

## ステップ2: リモートへpush

`--dry-run` でなければ実行：

```bash
git push -u origin <現在のブランチ>
```

- すでにtrackingしている場合は `git push` のみで良い
- push失敗時はエラーメッセージを表示して**停止**

---

## ステップ3: PR作成

`--dry-run` でなければ実行：

```bash
gh pr create --base <ベースブランチ> --title "<タイトル>" --body "$(cat <<'EOF'
<本文>
EOF
)"
```

- 既にPRが存在する場合（`gh pr view` で確認）は再利用し、URLを表示してステップ4へ
- 作成されたPR URL を表示

---

## ステップ4: PRマージ

`--dry-run` でなければ実行：

**worktree モード**の場合は `--delete-branch` を付けない（gh が内部で `git checkout <base>` を試みて失敗するため）。リモート削除はステップ4-2 で別途行う。

通常モード・デフォルト（merge commit + ブランチ削除）：
```bash
gh pr merge <PR番号> --merge --delete-branch
```

worktree モード・デフォルト（merge commit、ブランチ削除はステップ4-2で）:
```bash
gh pr merge <PR番号> --merge
```

`--squash` 指定時は `--merge` を `--squash` に置換。`--keep-branch` 指定時は `--delete-branch` を付けない。

マージ完了確認：
```bash
gh pr view <PR番号> --json state -q '.state'
```
- `MERGED` でなければ**停止**してユーザーに報告

### ステップ4-2: リモートブランチ削除（worktree モードのみ）

`--keep-branch` 指定がなく worktree モードの場合のみ実行：
```bash
git push origin --delete <現在のブランチ>
```
- 既に削除済みの場合（`gh pr merge` 自体が削除した場合）は無視

---

## ステップ5: ローカルデフォルトブランチへ同期

`--dry-run` でなければ実行：

**通常モード**:
```bash
git checkout <ベースブランチ>
git fetch origin <ベースブランチ>
git reset --hard origin/<ベースブランチ>
```

**worktree モード**: 現 worktree から `git checkout <ベースブランチ>` も `git fetch origin <base>:<base>` も「別 worktree で使用中」エラーになるため、このステップは**スキップ**し、完了サマリーで以下を案内する：
```
メイン worktree（<メイン worktree のパス>）で次を実行してください:
  cd <メイン worktree のパス>
  git pull origin <ベースブランチ>
```

メイン worktree のパスは `git worktree list | head -1 | awk '{print $1}'` で取得。

- `git pull` ではなく `fetch + reset --hard` を使うのは、merge/squash マージで履歴が再構築されるケースに確実に追随するため
- ローカルに未コミット変更がある状態で来ることはない（事前確認で弾いている / 自動コミット済み）

---

## ステップ6: ローカルfeatureブランチ削除

`--keep-branch` 指定がない & `--dry-run` でない場合のみ実行。

**通常モード**: ステップ5 でベースブランチ側に切り替え済みなので削除可能：
```bash
git branch -d <元のブランチ名> 2>/dev/null || true
```

**worktree モード**: 現 worktree が当該ブランチを保持しているため削除不可。**スキップ**し、完了サマリーで以下を案内：
```
worktree を削除する場合:
  git worktree remove <現 worktree のパス>
```

- `--delete-branch` でリモートを削除済みのため、未マージ警告が出ることはない想定
- エラーになっても停止せず、最後にユーザーへ「ローカルブランチ残存」と注記する

---

## 完了サマリー

```
=== マージ完了 ===
ブランチ: <元のfeatureブランチ名> → <ベースブランチ>
PR: <PR URL>（#<PR番号>, MERGED）
マージ方式: merge / squash
自動コミット: <短縮SHA> <メッセージ先頭行> (<N>ファイル)   ← 実施した場合のみ
ローカル: <ベースブランチ> @ <短縮SHA>                      ← 通常モードのみ
ブランチ削除: リモート削除済 / ローカル削除済 / 残存
```

worktree モードで未対応ステップがある場合は「要対応」セクションに追記：
```
要対応（メイン worktree で実施）:
  cd <メイン worktree のパス>
  git pull origin <ベースブランチ>
```

`--dry-run` の場合は「ドライラン完了（実際の操作は行っていません）」と明示する。

---

## 注意事項

- `--merge`（マージコミット）がデフォルトなのは、featureブランチのコミット履歴をベースブランチに残す方針のため
- 履歴を1コミットに圧縮したい場合は `--squash` を指定
- 自動コミットメッセージはプロジェクト `CLAUDE.md` の規約に従う（日本語・Conventional Commits 形式が一般的）
- センシティブ拡張子（`.env`, `credentials*`, `*.key`, `*.pem`, `id_rsa*`）が含まれる場合は警告して停止する
- ステージング時は `git add -A` ではなくファイル明示指定（不要ファイル混入防止）
- デフォルトブランチへ直接コミットされたものを取り込むケースはこの skill ではサポートしない
- バージョンアップ・ビルド・デプロイが必要な場合は `/release` を使う
- worktree 環境では別 worktree が保持中のブランチを操作できないため、一部ステップを自動スキップしユーザーへ案内する
