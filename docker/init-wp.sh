#!/bin/sh
# WordPress 初期セットアップスクリプト
# Docker 起動時に wpcli サービスから1回だけ実行される。
# 冪等に書かれているため何度走らせても問題ない。

set -e

# サイトURL（ポートを変える場合はここを編集）
SITE_URL="http://localhost:8081"

# --- 起動待ち戦略 ---------------------------------------------------------
# WordPress 公式イメージはコンテナ初回起動時に /var/www/html/wp-config.php を
# 自動生成する。wpcli は wordpress と同じボリュームをマウントしているため、
# このファイルの生成完了を待たないと wp コマンドが「未インストール」扱いになる。
#
# また `wp db check` は外部の mariadb-check バイナリを起動するが、
# MySQL 8 の自己署名 TLS 証明書と衝突して失敗する（"TLS/SSL error" 2026）。
# 接続テストは wpdb (PHP/mysqli) ベースの `wp eval` で行う。

WP_CONFIG=/var/www/html/wp-config.php

echo "[init-wp] wp-config.php の生成を待機..."
i=0
until [ -s "$WP_CONFIG" ]; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    echo "[init-wp] wp-config.php が生成されませんでした" >&2
    exit 1
  fi
  sleep 1
done

echo "[init-wp] DB 接続待ち..."
# wpdb (PHP/mysqli) 経由で SELECT 1 を投げる。
# 外部 mariadb-check/mysql バイナリを使わないので MySQL 8 の TLS 警告も回避できる。
# また WordPress 未インストール状態でも動く（DB 接続できることだけを確認する）。
DB_PROBE='global $wpdb; if ( ! $wpdb->check_connection( false ) ) { exit( 1 ); }'
i=0
until wp eval "$DB_PROBE" --skip-themes --skip-plugins --allow-root >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "[init-wp] DB 接続タイムアウト" >&2
    wp eval "$DB_PROBE" --skip-themes --skip-plugins --allow-root || true
    exit 1
  fi
  sleep 2
done

echo "[init-wp] WordPress インストール確認..."
if ! wp core is-installed --allow-root 2>/dev/null; then
  echo "[init-wp] 初回インストールを実行"
  wp core install \
    --url="$SITE_URL" \
    --title='Will Frontier' \
    --admin_user=admin \
    --admin_password=admin \
    --admin_email=admin@example.com \
    --skip-email \
    --allow-root
else
  echo "[init-wp] すでにインストール済み"
fi

echo "[init-wp] サイトURLを $SITE_URL に同期（ポート変更にも追従）"
wp option update siteurl "$SITE_URL" --allow-root
wp option update home "$SITE_URL" --allow-root

echo "[init-wp] パーマリンクを投稿名形式に設定"
wp option update permalink_structure '/%postname%/' --allow-root

echo "[init-wp] テーマを有効化"
wp theme activate will-frontier --allow-root

echo "[init-wp] 必要な固定ページを作成"
for slug in mission service workflow vehicles casestudy safety recruit company contact; do
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
# wp-cli (PHP-CLI) からは apache_mod_loaded() / $is_apache が解決できず
# got_mod_rewrite() が false を返すため、`wp rewrite flush --hard` だけだと
# .htaccess の WordPress マーカー内が空のままになる。
# insert_with_markers() を直接呼んで mod_rewrite ルールを強制書き込みする。
wp rewrite flush --hard --allow-root
wp eval '
  require_once ABSPATH . "wp-admin/includes/misc.php";
  global $wp_rewrite;
  $rules = explode( "\n", $wp_rewrite->mod_rewrite_rules() );
  insert_with_markers( ABSPATH . ".htaccess", "WordPress", $rules );
' --allow-root

echo "[init-wp] 完了"
