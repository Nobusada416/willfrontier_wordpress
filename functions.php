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
    wp_enqueue_style( 'will-frontier-style', get_stylesheet_uri(), array(), '1.0.0' );

    // Lenis（慣性スクロール）
    wp_enqueue_script(
        'lenis',
        'https://unpkg.com/lenis@1.1.14/dist/lenis.min.js',
        array(),
        null,
        true
    );
    // GSAP コア
    wp_enqueue_script(
        'gsap',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
        array(),
        null,
        true
    );
    // ScrollTrigger プラグイン
    wp_enqueue_script(
        'gsap-scrolltrigger',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
        array( 'gsap' ),
        null,
        true
    );
    // テーマ独自アニメーション（全ライブラリ読み込み後）
    wp_enqueue_script(
        'will-frontier-animation',
        get_template_directory_uri() . '/assets/js/animation.js',
        array( 'lenis', 'gsap-scrolltrigger' ),
        '1.0.0',
        true
    );
}
add_action( 'wp_enqueue_scripts', 'will_frontier_scripts' );