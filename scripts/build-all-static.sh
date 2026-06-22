#!/bin/bash
# 3パターン分の静的サイトを一括生成
# 使い方: bash scripts/build-all-static.sh

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
  exit 1
fi

for p in pattern-a pattern-b pattern-c; do
  echo ""
  echo "=== Building static site for design/$p ==="
  git switch design/$p
  sleep 3  # WordPress リロード待ち
  curl -sf http://localhost:8081/ > /dev/null || { echo "WP not ready"; exit 1; }
  bash scripts/build-static.sh $p
done

# 元のブランチに戻る
git switch "$ORIG_BRANCH"

echo ""
echo "=== Done ==="
du -sh static/pattern-*
