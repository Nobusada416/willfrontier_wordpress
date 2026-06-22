<?php
/**
 * Template Name: ワークフロー
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

<main class="relative w-full bg-white" style="margin:0;padding:0;flex:1;display:flex;flex-direction:column;">

    <!-- 既存：処理ネットワーク図 -->
    <section style="position:relative;width:100%;padding:clamp(48px,6vw,80px) 24px;overflow:hidden;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="detail-leaf" style="position:absolute;bottom:0;left:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:1;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="detail-leaf detail-leaf-right" style="position:absolute;bottom:0;right:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:1;">

        <div style="max-width:1200px;margin:0 auto;position:relative;z-index:2;text-align:center;width:100%;">
            <h2 class="js-heading-up yellow-underline" style="font-size:2.6rem;font-weight:900;color:#4a9db5;letter-spacing:.05em;margin-bottom:20px;">ウィルフロンティア 処理ネットワーク</h2>
            <p class="js-fade-up" style="font-size:0.95rem;color:#4a9db5;font-weight:700;line-height:1.9;margin-bottom:60px;text-align:left;display:inline-block;">
                各県に産業廃棄物処理業者とのネットワークを保有しており、あらゆる産業廃棄物を収集・運搬、中間処理を行い、適正処理を行います。<br>
                委託契約書、マニフェスト伝票の作成・発行はもちろん、お見積りは無料ですので、お気軽にお問い合わせください。
            </p>
            <div style="display:flex;justify-content:center;" class="js-fade-up">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/network.svg" alt="ウィルフロンティア 処理ネットワーク" style="width:100%;max-width:1000px;height:auto;display:block;">
            </div>
        </div>
    </section>

    <!-- 追加：5ステップ実写 -->
    <section class="relative w-full" style="background:#f6f8fa;padding:clamp(64px,8vw,120px) 0;">
        <div class="max-w-6xl mx-auto px-6 md:px-12">
            <div class="text-center mb-16">
                <p class="text-sm font-bold tracking-[0.3em] text-[#4a9db5] mb-3 js-fade-up">WORKFLOW</p>
                <h2 class="text-4xl md:text-5xl font-black text-[#2d5c8a] tracking-wider js-heading-up">処理の5ステップ</h2>
                <p class="text-sm md:text-base text-gray-600 mt-4 js-fade-up">受入から最終リサイクルまで、現場で実際に起こっていること</p>
            </div>

            <?php
            $steps = array(
                array( 'no' => '01', 'photo' => 'wf-024', 'title' => '受入・搬入', 'desc' => 'お客様の現場から運び込まれた廃材を、検量・記録のうえ受け入れます。' ),
                array( 'no' => '02', 'photo' => 'wf-028', 'title' => '選別', 'desc' => '鉄・非鉄・コンクリート・木材など、材質ごとに細かく仕分けます。' ),
                array( 'no' => '03', 'photo' => 'wf-020', 'title' => '中間処理', 'desc' => '当社の処理場で破砕・圧縮・分解を行い、リサイクル可能な状態に整えます。' ),
                array( 'no' => '04', 'photo' => 'wf-025', 'title' => '搬出', 'desc' => '処理済み資材をリサイクル業者・最終処分業者へ計画的に搬出します。' ),
                array( 'no' => '05', 'photo' => 'wf-030', 'title' => 'リサイクル / 最終処分', 'desc' => '資源として再循環、または法令に従って適正に最終処分されます。' ),
            );

            foreach ( $steps as $i => $s ) :
                $reverse = ( $i % 2 === 1 );
            ?>
            <article class="js-fade-up" style="display:grid;grid-template-columns:repeat(12,1fr);gap:clamp(24px,3vw,48px);align-items:center;margin-bottom:clamp(48px,6vw,80px);">
                <div style="grid-column:1 / span 7;overflow:hidden;border-radius:6px;aspect-ratio:16/9;<?php echo $reverse ? 'order:2;' : ''; ?>">
                    <?php echo wf_picture( $s['photo'], $s['title'], array( 'class' => 'w-full h-full object-cover' ) ); ?>
                </div>
                <div style="grid-column:8 / span 5;<?php echo $reverse ? 'order:1;' : ''; ?>">
                    <p class="font-black text-[#d4874a] tracking-widest mb-3" style="font-size:clamp(2rem,3.5vw,3.5rem);line-height:1;">STEP <?php echo esc_html( $s['no'] ); ?></p>
                    <h3 class="text-2xl md:text-3xl font-black text-[#2d5c8a] tracking-wider mb-4"><?php echo esc_html( $s['title'] ); ?></h3>
                    <p class="text-base md:text-lg text-gray-700 leading-relaxed"><?php echo esc_html( $s['desc'] ); ?></p>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- CTA -->
    <section class="relative w-full bg-white text-center" style="padding:clamp(48px,6vw,96px) 0;">
        <div class="max-w-3xl mx-auto px-6">
            <p class="text-sm font-bold tracking-[0.3em] text-[#4a9db5] mb-3 js-fade-up">CONTACT</p>
            <h3 class="text-2xl md:text-4xl font-black text-[#2d5c8a] tracking-wider mb-8 js-heading-up">処理フローのご相談はこちら</h3>
            <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="js-fade-up" style="display:inline-flex;align-items:center;gap:12px;background:#d4874a;color:#fff;font-weight:900;font-size:1.2rem;letter-spacing:.1em;padding:18px 56px;border-radius:9999px;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">お問い合わせ <span>▼</span></a>
        </div>
    </section>

</main>

<?php get_footer(); ?>
