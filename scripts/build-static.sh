#!/bin/bash
# 1パターン分の WordPress を静的 HTML 化する
# 使い方: bash scripts/build-static.sh <pattern-name>
#   例: bash scripts/build-static.sh pattern-a
# 出力: static/<pattern-name>/  配下に index.html / mission/ / wp-content/ などが生成される

set -e

PATTERN=$1
if [ -z "$PATTERN" ]; then
  echo "Usage: bash scripts/build-static.sh <pattern-name>"
  exit 1
fi

PROJECT_ROOT=$(git rev-parse --show-toplevel)
OUTDIR="$PROJECT_ROOT/static/$PATTERN"

# 既存出力を削除
rm -rf "$OUTDIR"
mkdir -p "$OUTDIR"

# WordPress 起動チェック
if ! curl -sf http://localhost:8081/ > /dev/null; then
  echo "Error: WordPress is not running at http://localhost:8081/"
  exit 1
fi

cd "$OUTDIR"

echo "[$PATTERN] Mirroring with wget..."

# wget で各ページを取得（ナビゲーション経由でクロール）
# - --mirror: 再帰、タイムスタンプ、無限深度
# - --convert-links: 内部リンクを相対化
# - --adjust-extension: .html 拡張子付与
# - --page-requisites: CSS/JS/画像/動画を含めて取得
# - --no-host-directories: localhost:8081/ プレフィックスを出力から除外
# - --reject: 管理画面・API を除外
# - --restrict-file-names=windows: ファイル名の特殊文字対応
wget \
  --mirror \
  --convert-links \
  --adjust-extension \
  --page-requisites \
  --no-host-directories \
  --no-parent \
  -e robots=off \
  --reject "wp-admin*,wp-login*,xmlrpc*,*?p=*,*?cat=*,*?tag=*,*feed*,*comments*" \
  --reject-regex "(/wp-json/|/feed/|\?replytocom=)" \
  --user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
  http://localhost:8081/ \
  http://localhost:8081/mission/ \
  http://localhost:8081/service/ \
  http://localhost:8081/workflow/ \
  http://localhost:8081/vehicles/ \
  http://localhost:8081/casestudy/ \
  http://localhost:8081/safety/ \
  http://localhost:8081/recruit/ \
  http://localhost:8081/contact/ \
  2>&1 | tail -10 || true

# wget は 8 系の終了コードを出すことがあるが部分成功でも続行

echo ""
echo "[$PATTERN] Rewriting absolute URLs to relative..."

# localhost:8081 を含むリンクを除去（HTML/CSS/JS 内）
find "$OUTDIR" -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) -print0 | \
  xargs -0 sed -i '' -e 's|http://localhost:8081||g' -e 's|https://localhost:8081||g' || true

# WordPress の ?ver=X.X.X キャッシュバスターを除去
# wget の --convert-links が ? を %3F にエンコードしファイル名と参照が不整合になる問題への対処
# 参考: HTML 内では animation.js%3Fver=1.0.0 だが実ファイルは animation.js?ver=1.0.0
#       → ブラウザがクエリ部を切ってファイル名を要求するため 404 になる
echo "[$PATTERN] Removing ?ver= cache busters from references..."
find "$OUTDIR" -type f \( -name "*.html" -o -name "*.css" -o -name "*.js" \) -print0 | \
  xargs -0 sed -i '' -E \
    -e 's|\?ver=[0-9.]+||g' \
    -e 's|%3Fver=[0-9.]+||g' \
    -e 's|&#038;ver=[0-9.]+||g' || true

echo "[$PATTERN] Renaming files to drop ?ver= suffix..."
find "$OUTDIR" -type f -name "*?ver=*" | while IFS= read -r f; do
  newname="${f%%\?ver=*}"
  [ "$f" != "$newname" ] && mv -f "$f" "$newname"
done
find "$OUTDIR" -type f -name "*%3Fver=*" | while IFS= read -r f; do
  newname="${f%%\%3Fver=*}"
  [ "$f" != "$newname" ] && mv -f "$f" "$newname"
done

# wget の --page-requisites は <video><source> 内の mp4 を取り損ねるため、
# テーマの assets/ ディレクトリを丸ごとコピーする
echo ""
echo "[$PATTERN] Copying theme assets (photos/videos)..."
ASSETS_DEST="$OUTDIR/wp-content/themes/will-frontier/assets"
mkdir -p "$ASSETS_DEST"
cp -R "$PROJECT_ROOT/assets/." "$ASSETS_DEST/"

# 不要な素材プール（git 管理外、サイズ大）を削除
rm -rf "$ASSETS_DEST/photos/originals"
rm -rf "$ASSETS_DEST/photos/originals_compressed"
rm -rf "$ASSETS_DEST/videos/originals_compressed"

echo ""
echo "[$PATTERN] Output directory:"
du -sh "$OUTDIR"
echo ""
echo "[$PATTERN] Top-level entries:"
ls -1 "$OUTDIR" | head -20
