#!/bin/sh
# WordPress 初期セットアップスクリプト
# Docker 起動時に wpcli サービスから1回だけ実行される。
# 冪等に書かれているため何度走らせても問題ない。

set -e

echo "[init-wp] DB 接続待ち..."
# WordPress 公式 cli イメージは wp-config.php を /var/www/html から読む。
# まれに最初の wp コマンドが DB 接続待ちで失敗するためリトライを入れる。
i=0
until wp db check --allow-root >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "[init-wp] DB 接続タイムアウト" >&2
    exit 1
  fi
  sleep 2
done

echo "[init-wp] WordPress インストール確認..."
if ! wp core is-installed --allow-root 2>/dev/null; then
  echo "[init-wp] 初回インストールを実行"
  wp core install \
    --url=http://localhost:8080 \
    --title='Will Frontier' \
    --admin_user=admin \
    --admin_password=admin \
    --admin_email=admin@example.com \
    --skip-email \
    --allow-root
else
  echo "[init-wp] すでにインストール済み"
fi

echo "[init-wp] パーマリンクを投稿名形式に設定"
wp option update permalink_structure '/%postname%/' --allow-root

echo "[init-wp] テーマを有効化"
wp theme activate will-frontier --allow-root

echo "[init-wp] 必要な固定ページを作成"
for slug in mission service workflow vehicles casestudy safety recruit company; do
  if wp post list --post_type=page --name=$slug --field=ID --allow-root | grep -q .; then
    echo "  - $slug: 既存"
  else
    title=$(echo "$slug" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')
    wp post create \
      --post_type=page \
      --post_title="$title" \
      --post_name="$slug" \
      --post_status=publish \
      --allow-root >/dev/null
    echo "  - $slug: 作成"
  fi
done

echo "[init-wp] リライトルールを再生成（.htaccess 出力）"
wp rewrite flush --hard --allow-root

echo "[init-wp] 完了"
