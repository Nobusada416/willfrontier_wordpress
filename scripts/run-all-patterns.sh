#!/bin/bash
# 3パターン分の PDF を一括生成する
# 使い方: bash scripts/run-all-patterns.sh

set -e

ORIG_BRANCH=$(git rev-parse --abbrev-ref HEAD)
PROJECT_ROOT=$(git rev-parse --show-toplevel)
cd "$PROJECT_ROOT"

# 作業ツリーが clean か確認
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working tree is not clean. Commit or stash changes first."
  git status --short
  exit 1
fi

# WordPress 起動チェック
if ! curl -sf http://localhost:8081/ > /dev/null; then
  echo "Error: WordPress is not running at http://localhost:8081/"
  echo "Run 'docker compose up -d' first."
  exit 1
fi

# 依存インストール（初回のみ）
if [ ! -d scripts/node_modules ]; then
  echo "=== Installing npm dependencies ==="
  (cd scripts && npm install)
fi

# 3 パターン分実行
for p in pattern-a pattern-b pattern-c; do
  echo ""
  echo "=== Switching to design/$p ==="
  git switch design/$p
  sleep 3  # WordPress リロード待ち

  if ! curl -sf http://localhost:8081/ > /dev/null; then
    echo "Error: WordPress not responding after switching to design/$p"
    git switch "$ORIG_BRANCH"
    exit 1
  fi

  node scripts/generate-pdfs.js $p
done

# 元のブランチに戻る
git switch "$ORIG_BRANCH"

echo ""
echo "=== Done ==="
ls -lh will-frontier-pattern-*.pdf
