<?php
/**
 * テーマの基本的な設定と機能の有効化
 */
function will_frontier_setup() {
    // 1. <head>内に<title>タグを自動出力
    add_theme_support( 'title-tag' );

    // 2. 投稿や固定ページで「アイキャッチ画像」を有効化
    add_theme_support( 'post-thumbnails' );

    // 3. 管理画面で設定できるカスタムメニューを登録
    register_nav_menus( array(
        'global' => 'グローバルナビゲーション',
        'footer' => 'フッターナビゲーション',
    ) );
}
add_action( 'after_setup_theme', 'will_frontier_setup' );

/**
 * CSSとJavaScriptの適切な読み込み
 */
function will_frontier_scripts() {
    // テーマ直下の style.css を読み込む
    wp_enqueue_style( 'will-frontier-style', get_stylesheet_uri(), array(), '1.0.0' );

    // 実際のデザイン用CSS（例: assets/css/main.css に配置した場合）
    // wp_enqueue_style( 'main-style', get_template_directory_uri() . '/assets/css/main.css', array(), '1.0.0' );

    // 独自機能用のJavaScript（例: assets/js/main.js に配置した場合）
    // wp_enqueue_script( 'main-script', get_template_directory_uri() . '/assets/js/main.js', array(), '1.0.0', true );
}
add_action( 'wp_enqueue_scripts', 'will_frontier_scripts' );