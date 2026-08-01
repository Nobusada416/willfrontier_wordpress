<?php
/**
 * Template Name: ケーススタディ
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

<main class="relative w-full bg-white" style="margin:0;padding:0;flex:1;display:flex;flex-direction:column;overflow:hidden;">

    <!-- HERO: 6枚モザイクフェード -->
    <section class="relative w-full overflow-hidden" style="height:calc(100vh - 72px);min-height:560px;">
        <div class="absolute inset-0 z-0" style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:0;">
            <?php
            $hero_photos = array( 'wf-073', 'wf-076', 'wf-079', 'wf-086', 'wf-087', 'wf-092' );
            foreach ( $hero_photos as $i => $slug ) :
            ?>
                <div class="hero-tile" style="overflow:hidden;animation:caseHeroFade 6s infinite;animation-delay:<?php echo $i; ?>s;">
                    <?php echo wf_picture( $slug, '', array( 'class' => 'w-full h-full object-cover', 'loading' => 'eager' ) ); ?>
                </div>
            <?php endforeach; ?>
        </div>
        <style>
        @keyframes caseHeroFade {
            0%, 70%, 100% { opacity: 1; transform: scale(1); }
            85% { opacity: 0.35; transform: scale(1.04); }
        }
        </style>

        <!-- 暗色オーバーレイ -->
        <div class="absolute inset-0 bg-black/55 pointer-events-none" style="z-index:5;"></div>

        <!-- タイトル -->
        <div class="relative z-30 w-full h-full flex flex-col items-center justify-center px-6 text-center">
            <h1 class="text-7xl md:text-8xl font-black text-white tracking-widest mb-6 js-heading-up" style="text-shadow:0 4px 16px rgba(0,0,0,0.5);">CASE STUDY</h1>
            <p class="text-lg md:text-2xl text-white font-bold tracking-wide js-fade-up" style="text-shadow:0 2px 8px rgba(0,0,0,0.5);">実績紹介 ─ 現場が語る、私たちの仕事</p>
        </div>

        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="detail-leaf" style="position:absolute;top:0;left:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:40;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="detail-leaf detail-leaf-right" style="position:absolute;bottom:0;right:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:40;">
    </section>

    <!-- 案件カード ×4 -->
    <section class="relative w-full bg-white" style="padding:clamp(64px,8vw,120px) 0;">
        <div class="max-w-6xl mx-auto px-6 md:px-12">
            <div class="text-center mb-16">
                <p class="text-sm font-bold tracking-[0.3em] text-[#4a9db5] mb-3 js-fade-up">PROJECTS</p>
                <h2 class="text-4xl md:text-5xl font-black text-[#2d5c8a] tracking-wider js-heading-up">主要施工事例</h2>
            </div>

            <?php
            $cases = array(
                array(
                    'no'    => '01',
                    'title' => 'マンション解体工事',
                    'meta'  => '建築廃材 / 鉄骨 / コンクリート',
                    'desc'  => '築40年の中層マンションを近隣配慮しながら解体。発生する廃材を当社で分別・リサイクル処理まで一貫対応。',
                    'photos'=> array( 'wf-070', 'wf-066', 'wf-001', 'wf-003' ),
                ),
                array(
                    'no'    => '02',
                    'title' => '工場リノベーション廃材処理',
                    'meta'  => '産業廃棄物 / 金属類 / 機械設備',
                    'desc'  => '稼働中の工場を一部解体し、設備更新に伴う大量の廃材を選別。再資源化率 92% を達成。',
                    'photos'=> array( 'wf-106', 'wf-107', 'wf-108', 'wf-109' ),
                ),
                array(
                    'no'    => '03',
                    'title' => '大型工事現場での連続搬出',
                    'meta'  => '公共工事 / 大量運搬 / 安全管理',
                    'desc'  => '都市部の再開発現場で連日大量に発生する廃材を、複数台体制で連続搬出。工程遅延ゼロで完遂。',
                    'photos'=> array( 'wf-050', 'wf-048', 'wf-110', 'wf-111' ),
                ),
                array(
                    'no'    => '04',
                    'title' => '広域運搬・回収実績',
                    'meta'  => '関東一円 / 定期回収 / 中継拠点活用',
                    'desc'  => '複数拠点を持つお客様の廃材を、自社車両網で集約・効率搬送。月間稼働 600 件超。',
                    'photos'=> array( 'wf-009', 'wf-049', 'wf-048', 'wf-037' ),
                ),
            );

            foreach ( $cases as $idx => $c ) :
                $reverse = ( $idx % 2 === 1 );
            ?>
            <article class="js-fade-up" style="display:grid;grid-template-columns:1fr;gap:32px;align-items:center;margin-bottom:clamp(56px,7vw,96px);">
                <div style="display:grid;grid-template-columns:repeat(12,1fr);grid-auto-rows:120px;gap:8px;">
                    <div style="grid-column:1 / span 7;grid-row:1 / span 2;overflow:hidden;border-radius:6px;">
                        <?php echo wf_picture( $c['photos'][0], $c['title'] . '-メイン', array( 'class' => 'w-full h-full object-cover' ) ); ?>
                    </div>
                    <div style="grid-column:8 / span 5;grid-row:1;overflow:hidden;border-radius:6px;">
                        <?php echo wf_picture( $c['photos'][1], $c['title'] . '-2', array( 'class' => 'w-full h-full object-cover' ) ); ?>
                    </div>
                    <div style="grid-column:8 / span 5;grid-row:2;overflow:hidden;border-radius:6px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <div style="overflow:hidden;border-radius:6px;">
                            <?php echo wf_picture( $c['photos'][2], $c['title'] . '-3', array( 'class' => 'w-full h-full object-cover' ) ); ?>
                        </div>
                        <div style="overflow:hidden;border-radius:6px;">
                            <?php echo wf_picture( $c['photos'][3], $c['title'] . '-4', array( 'class' => 'w-full h-full object-cover' ) ); ?>
                        </div>
                    </div>
                </div>
                <div class="<?php echo $reverse ? 'md:order-first' : ''; ?>">
                    <p class="font-black text-[#d4874a] tracking-widest mb-3" style="font-size:clamp(2rem,3.5vw,3.5rem);line-height:1;">CASE <?php echo esc_html( $c['no'] ); ?></p>
                    <h3 class="text-2xl md:text-3xl font-black text-[#2d5c8a] tracking-wider mb-3"><?php echo esc_html( $c['title'] ); ?></h3>
                    <p class="text-xs md:text-sm font-bold tracking-wider text-gray-500 mb-5"><?php echo esc_html( $c['meta'] ); ?></p>
                    <p class="text-base md:text-lg text-gray-700 leading-relaxed"><?php echo esc_html( $c['desc'] ); ?></p>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- CTA -->
    <section class="relative w-full bg-white text-center" style="padding:clamp(48px,6vw,96px) 0;">
        <div class="max-w-3xl mx-auto px-6">
            <p class="text-sm font-bold tracking-[0.3em] text-[#4a9db5] mb-3 js-fade-up">CONTACT</p>
            <h3 class="text-2xl md:text-4xl font-black text-[#2d5c8a] tracking-wider mb-8 js-heading-up">あなたの現場、ご相談ください。</h3>
            <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="js-fade-up" style="display:inline-flex;align-items:center;gap:12px;background:#d4874a;color:#fff;font-weight:900;font-size:1.2rem;letter-spacing:.1em;padding:18px 56px;border-radius:9999px;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">お問い合わせ <span>▼</span></a>
        </div>
    </section>

</main>

<?php get_footer(); ?>
