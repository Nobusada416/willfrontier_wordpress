<?php
/**
 * Template Name: 車両一覧
 */
get_header();
?>
<script>
window.addEventListener('load', function() {
    if (typeof gsap === 'undefined') return;
    document.querySelectorAll('.detail-leaf').forEach(function(el) {
        var isRight = el.classList.contains('detail-leaf-right');
        gsap.fromTo(el,
            { x: isRight ? 120 : -120 },
            { x: 0, duration: 1.2, ease: 'power3.out', delay: 0.3 }
        );
    });
});
</script>

<main class="relative w-full bg-white overflow-hidden">

    <!-- HERO: 3層クロスフェード -->
    <section class="relative w-full overflow-hidden" style="height:calc(100vh - 72px);min-height:520px;">
        <div class="absolute inset-0 z-0">
            <div style="position:absolute;inset:0;animation:vehHeroFade1 12s infinite;">
                <?php echo wf_picture( 'wf-097', '', array( 'class' => 'w-full h-full object-cover', 'loading' => 'eager' ) ); ?>
            </div>
            <div style="position:absolute;inset:0;animation:vehHeroFade2 12s infinite;">
                <?php echo wf_picture( 'wf-007', '', array( 'class' => 'w-full h-full object-cover', 'loading' => 'eager' ) ); ?>
            </div>
            <div style="position:absolute;inset:0;animation:vehHeroFade3 12s infinite;">
                <?php echo wf_picture( 'wf-042', '', array( 'class' => 'w-full h-full object-cover', 'loading' => 'eager' ) ); ?>
            </div>
        </div>
        <style>
        @keyframes vehHeroFade1 { 0%,33%,100% { opacity:1; } 50%,83% { opacity:0; } }
        @keyframes vehHeroFade2 { 0%,17%,67%,100% { opacity:0; } 33%,50% { opacity:1; } }
        @keyframes vehHeroFade3 { 0%,50%,100% { opacity:0; } 67%,83% { opacity:1; } }
        </style>

        <div class="absolute inset-0 bg-black/55 pointer-events-none" style="z-index:5;"></div>

        <div class="relative z-30 w-full h-full flex flex-col items-center justify-center px-6 text-center">
            <h1 class="text-7xl md:text-8xl font-black text-white tracking-widest mb-6 js-heading-up" style="text-shadow:0 4px 16px rgba(0,0,0,0.5);">VEHICLES</h1>
            <p class="text-lg md:text-2xl text-white font-bold tracking-wide js-fade-up" style="text-shadow:0 2px 8px rgba(0,0,0,0.5);">車両ラインナップ ─ 現場を支える12種類の頼れる相棒</p>
        </div>

        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="detail-leaf" style="position:absolute;top:0;left:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:40;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="detail-leaf detail-leaf-right" style="position:absolute;bottom:0;right:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:40;">
    </section>

    <!-- 車両カード 6種 -->
    <section class="relative w-full bg-white" style="padding:clamp(64px,8vw,120px) 0;">
        <div class="max-w-6xl mx-auto px-6 md:px-12">
            <div class="text-center mb-16">
                <p class="text-sm font-bold tracking-[0.3em] text-[#4a9db5] mb-3 js-fade-up">LINEUP</p>
                <h2 class="text-4xl md:text-5xl font-black text-[#2d5c8a] tracking-wider js-heading-up">主要車両</h2>
            </div>

            <?php
            $vehicles = array(
                array( 'photo' => 'wf-007', 'name' => 'アームロール', 'spec' => '4t / 8t', 'desc' => 'コンテナ着脱で現場間移動を効率化。狭小現場にも対応。' ),
                array( 'photo' => 'wf-097', 'name' => '大型ダンプ', 'spec' => '2t〜10t', 'desc' => '建材・廃材の大量運搬の主力。荷台後部からの一気積み下ろし。' ),
                array( 'photo' => 'wf-042', 'name' => 'コンテナ運搬車', 'spec' => '10〜20㎥対応', 'desc' => '大容量コンテナでの長距離輸送。複数現場の集約搬送に。' ),
                array( 'photo' => 'wf-040', 'name' => 'ローダー / フォークリフト', 'spec' => '構内作業用', 'desc' => '中間処理場での選別・積込作業。狭所での旋回性能を活かす。' ),
                array( 'photo' => 'wf-008', 'name' => '中型運搬車', 'spec' => '4t', 'desc' => '都市部の細い道や中小規模現場をカバーする中型主力車。' ),
                array( 'photo' => 'wf-009', 'name' => '平ボディトラック', 'spec' => '汎用 / 多用途', 'desc' => '機材搬送・大型部材の運搬に。荷台フラットで汎用性高め。' ),
            );

            foreach ( $vehicles as $v ) :
            ?>
            <article class="js-fade-up" style="display:grid;grid-template-columns:1fr;gap:0;margin-bottom:32px;border-radius:8px;overflow:hidden;background:#f6f8fa;">
                <div style="display:grid;grid-template-columns:repeat(12,1fr);align-items:stretch;">
                    <div style="grid-column:1 / span 7;overflow:hidden;aspect-ratio:16/9;">
                        <?php echo wf_picture( $v['photo'], $v['name'], array( 'class' => 'w-full h-full object-cover' ) ); ?>
                    </div>
                    <div style="grid-column:8 / span 5;padding:clamp(24px,3vw,40px);display:flex;flex-direction:column;justify-content:center;">
                        <p class="text-xs font-bold tracking-[0.3em] text-[#4a9db5] mb-2"><?php echo esc_html( $v['spec'] ); ?></p>
                        <h3 class="text-2xl md:text-3xl font-black text-[#2d5c8a] tracking-wider mb-3"><?php echo esc_html( $v['name'] ); ?></h3>
                        <p class="text-sm md:text-base text-gray-700 leading-relaxed"><?php echo esc_html( $v['desc'] ); ?></p>
                    </div>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- 動作映像 -->
    <section class="relative w-full bg-black overflow-hidden" style="height:clamp(320px,52vh,580px);">
        <div class="absolute inset-0 z-0">
            <?php echo wf_video( 'shorts/s08', array(
                'autoplay' => true, 'loop' => true, 'muted' => true,
                'controls' => false, 'poster' => '',
                'class' => 'w-full h-full object-cover',
            ) ); ?>
        </div>
        <div class="absolute inset-0 bg-black/55 pointer-events-none" style="z-index:5;"></div>
        <div class="relative z-30 w-full h-full flex flex-col items-center justify-center px-6 text-center">
            <p class="text-sm md:text-base font-bold tracking-[0.3em] text-[#7fc8de] mb-4 js-fade-up">IN MOTION</p>
            <h2 class="text-3xl md:text-5xl font-black text-white tracking-wider mb-4 js-heading-up yellow-underline" style="text-shadow:0 2px 12px rgba(0,0,0,0.6);">現場を動かす、その姿。</h2>
        </div>
    </section>

    <!-- マソンリーギャラリー -->
    <section class="relative w-full" style="background:#f6f8fa;padding:clamp(64px,8vw,120px) 0;">
        <div class="max-w-6xl mx-auto px-6 md:px-12">
            <div class="text-center mb-12">
                <p class="text-sm font-bold tracking-[0.3em] text-[#4a9db5] mb-3 js-fade-up">VEHICLE GALLERY</p>
                <h2 class="text-3xl md:text-4xl font-black text-[#2d5c8a] tracking-wider js-heading-up">車両ギャラリー</h2>
            </div>

            <style>
            @media (max-width: 1024px) { .veh-gallery { column-count: 3 !important; } }
            @media (max-width: 768px)  { .veh-gallery { column-count: 2 !important; } }
            @media (max-width: 480px)  { .veh-gallery { column-count: 1 !important; } }
            </style>
            <div class="veh-gallery js-fade-up" style="column-count:4;column-gap:8px;">
                <?php
                $gallery = array( 'wf-097', 'wf-007', 'wf-042', 'wf-008', 'wf-009', 'wf-040' );
                foreach ( $gallery as $g ) :
                ?>
                    <div style="break-inside:avoid;margin-bottom:8px;border-radius:6px;overflow:hidden;">
                        <?php echo wf_picture( $g, '', array( 'class' => 'w-full h-auto block' ) ); ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="relative w-full bg-white text-center" style="padding:clamp(48px,6vw,96px) 0;">
        <div class="max-w-3xl mx-auto px-6">
            <p class="text-sm font-bold tracking-[0.3em] text-[#4a9db5] mb-3 js-fade-up">CONTACT</p>
            <h3 class="text-2xl md:text-4xl font-black text-[#2d5c8a] tracking-wider mb-8 js-heading-up">車両配車のご相談はこちら</h3>
            <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="js-fade-up" style="display:inline-flex;align-items:center;gap:12px;background:#d4874a;color:#fff;font-weight:900;font-size:1.2rem;letter-spacing:.1em;padding:18px 56px;border-radius:9999px;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">お問い合わせ <span>▼</span></a>
        </div>
    </section>

</main>

<?php get_footer(); ?>
