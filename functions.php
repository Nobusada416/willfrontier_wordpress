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

/**
 * 写真用 <picture> ラッパー
 *
 * assets/photos/large/ と assets/photos/small/ の WebP を srcset で出し分け、
 * フォールバックは assets/photos/originals/ の JPG（git管理外なのでローカル検証時のみ有効）。
 *
 * @param string $slug   写真のスラッグ（例: 'wf-001'）
 * @param string $alt    alt 属性
 * @param array  $opts   class, sizes, loading 等
 */
function wf_picture( $slug, $alt = '', $opts = array() ) {
    $defaults = array(
        'class'   => '',
        'sizes'   => '(max-width: 768px) 100vw, 100vw',
        'loading' => 'lazy',
    );
    $opts = array_merge( $defaults, $opts );
    $base = get_template_directory_uri() . '/assets/photos';

    $webp_small = esc_url( $base . '/small/' . $slug . '.webp' );
    $webp_large = esc_url( $base . '/large/' . $slug . '.webp' );
    $jpg_full   = esc_url( $base . '/originals/' . $slug . '.jpg' );

    $class   = esc_attr( $opts['class'] );
    $sizes   = esc_attr( $opts['sizes'] );
    $loading = esc_attr( $opts['loading'] );
    $alt_e   = esc_attr( $alt );

    return <<<HTML
<picture class="{$class}">
  <source type="image/webp"
          srcset="{$webp_small} 768w, {$webp_large} 1600w"
          sizes="{$sizes}">
  <img src="{$webp_large}" alt="{$alt_e}" loading="{$loading}" decoding="async" class="{$class}">
</picture>
HTML;
}

/**
 * 動画埋め込みラッパー
 *
 * 現在は assets/videos/<dir>/<slug>.mp4 を <video> で直接配信。
 * 将来 Vimeo 等へ移行する場合はこの関数だけ書き換えれば全テンプレートに反映される。
 *
 * @param string $slug  動画スラッグ（例: 'hero/intro', 'service/demolition'）
 * @param array  $opts  controls, autoplay, loop, muted, poster, class
 */
function wf_video( $slug, $opts = array() ) {
    $defaults = array(
        'controls' => true,
        'autoplay' => false,
        'loop'     => false,
        'muted'    => false,
        'playsinline' => true,
        'preload'  => 'metadata',
        'poster'   => '',  // 例: 'hero/intro' → posters/hero-intro.jpg を想定
        'class'    => '',
    );
    $opts = array_merge( $defaults, $opts );
    $base = get_template_directory_uri() . '/assets/videos';

    $src    = esc_url( $base . '/' . $slug . '.mp4' );
    $poster = $opts['poster'] ? esc_url( $base . '/posters/' . $opts['poster'] . '.jpg' ) : '';

    $attrs = array(
        'class="' . esc_attr( $opts['class'] ) . '"',
        'preload="' . esc_attr( $opts['preload'] ) . '"',
    );
    if ( $opts['controls'] )    $attrs[] = 'controls';
    if ( $opts['autoplay'] )    $attrs[] = 'autoplay';
    if ( $opts['loop'] )        $attrs[] = 'loop';
    if ( $opts['muted'] )       $attrs[] = 'muted';
    if ( $opts['playsinline'] ) $attrs[] = 'playsinline';
    if ( $poster )              $attrs[] = 'poster="' . $poster . '"';

    $attr_str = implode( ' ', $attrs );

    return "<video {$attr_str}><source src=\"{$src}\" type=\"video/mp4\"></video>";
}