<?php
/**
 * Template Name: サービス
 */
get_header();
?>
<style>
#service-scale-wrapper {
    transform-origin: top center;
}
</style>
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
function scaleServiceLayout() {
    var wrapper = document.getElementById('service-scale-wrapper');
    if (!wrapper) return;
    // 一旦スケールをリセットして元のサイズを取得
    wrapper.style.transform = 'scale(1)';
    wrapper.style.marginBottom = '0';
    var section = wrapper.parentElement;
    var availableWidth = section.offsetWidth - 80;
    var availableHeight = section.offsetHeight - 40;
    var scaleX = availableWidth / wrapper.offsetWidth;
    var scaleY = availableHeight / wrapper.offsetHeight;
    var scale = Math.min(scaleX, scaleY);
    wrapper.style.transform = 'scale(' + scale + ')';
    wrapper.style.transformOrigin = 'top center';
    wrapper.style.marginBottom = -(wrapper.offsetHeight * (1 - scale)) + 'px';
}
window.addEventListener('load', scaleServiceLayout);
window.addEventListener('resize', scaleServiceLayout);
</script>
<main class="relative w-full" style="margin:0;padding:0;flex:1;display:flex;flex-direction:column;">

    <section style="position:relative;width:100%;padding:20px 40px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;height:calc(100vh - 72px);">

        <!-- 背景：bg_blue.png -->
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bg_blue.png" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;">

        <!-- 左右の葉 -->
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="detail-leaf" style="position:absolute;bottom:0;left:0;height:100%;width:auto;pointer-events:none;opacity:.3;z-index:2;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="detail-leaf detail-leaf-right" style="position:absolute;bottom:0;right:0;height:100%;width:auto;pointer-events:none;opacity:.3;z-index:2;">

        <!-- 中央：サークル -->
        <div id="service-scale-wrapper" style="position:relative;z-index:3;width:100%;max-width:800px;margin:0 auto;height:580px;overflow:visible;">

            <!-- big-circle.svg（大きな緑の円） -->
            <div style="position:absolute;top:55%;left:50%;transform:translate(-50%,-50%);z-index:1;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/big-circle.svg" alt="" style="width:320px;height:320px;">
            </div>

            <!-- bill：circle1の上 -->
            <div style="position:absolute;top:5px;left:58%;transform:translateX(-50%);z-index:3;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bill.svg" alt="" style="width:180px;height:auto;">
            </div>

            <!-- 上：鉄、非鉄 買い取ります（12時） -->
            <div style="position:absolute;top:90px;left:330px;z-index:4;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/circle1.svg" alt="" style="width:130px;height:130px;">
            </div>

            <!-- 右上：自社中間処理場（2時） -->
            <div style="position:absolute;top:210px;left:490px;z-index:4;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/circle2.svg" alt="" style="width:130px;height:130px;">
            </div>

            <!-- bubble1：circle2の右横 -->
            <div style="position:absolute;top:70px;left:600px;z-index:5;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bubble1.svg" alt="" style="width:300px;height:auto;">
            </div>

            <!-- 右下：現場パトロール（4-5時） -->
            <div style="position:absolute;top:390px;left:425px;z-index:4;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/circle3.svg" alt="" style="width:130px;height:130px;">
            </div>

            <!-- bubble2：circle3の右横 -->
            <div style="position:absolute;top:440px;left:530px;z-index:5;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bubble2.svg" alt="" style="width:195px;height:auto;">
            </div>

            <!-- 左下：どんな産業廃棄物（7-8時） -->
            <div style="position:absolute;top:390px;left:240px;z-index:4;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/circle4.svg" alt="" style="width:130px;height:130px;">
            </div>

            <!-- bubble3：circle4の左横 -->
            <div style="position:absolute;top:480px;left:70px;z-index:5;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bubble3.svg" alt="" style="width:195px;height:auto;">
            </div>

            <!-- 左上：自社の処理施設（10-11時） -->
            <div style="position:absolute;top:210px;left:170px;z-index:4;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/circle5.svg" alt="" style="width:130px;height:130px;">
            </div>

            <!-- bubble4：circle5の左横 -->
            <div style="position:absolute;top:105px;left:-40px;z-index:5;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bubble4.svg" alt="" style="width:235px;height:auto;">
            </div>

        </div>

    </section>

    <!-- 追加：事業内容カード -->
    <section class="relative w-full bg-white" style="padding:clamp(64px,8vw,120px) 0;">
        <div class="max-w-6xl mx-auto px-6 md:px-12">
            <div class="text-center mb-16">
                <p class="text-sm font-bold tracking-[0.3em] text-[#4a9db5] mb-3 js-fade-up">OUR BUSINESS</p>
                <h2 class="text-4xl md:text-5xl font-black text-[#2d5c8a] tracking-wider js-heading-up yellow-underline">事業内容</h2>
                <p class="text-sm md:text-base text-gray-600 mt-4 js-fade-up">産業廃棄物の収集から再資源化まで、5つの軸で総合対応</p>
            </div>

            <?php
            $services = array(
                array( 'photo' => 'wf-079', 'name' => '収集・運搬', 'desc' => '関東一円の自社車両網で、廃棄物を計画的・効率的に運搬します。' ),
                array( 'photo' => 'wf-086', 'name' => '選別作業', 'desc' => '材質ごとに細かく仕分け、再資源化率を最大化します。' ),
                array( 'photo' => 'wf-087', 'name' => '中間処理', 'desc' => '自社処理場で破砕・圧縮・分別を行い、適正処理へつなぎます。' ),
                array( 'photo' => 'wf-095', 'name' => 'リサイクル', 'desc' => '鉄・非鉄・コンクリート等を再資源として循環させる仕組み。' ),
                array( 'photo' => 'wf-073', 'name' => '鉄・非鉄買取', 'desc' => '発生現場での買取査定で、処分コスト削減もご提案可能。' ),
            );
            ?>
            <div class="js-fade-up" style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
                <style>
                @media (max-width: 900px) { .service-grid { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (max-width: 560px) { .service-grid { grid-template-columns: 1fr !important; } }
                </style>
                <div class="service-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;grid-column:1 / -1;">
                    <?php foreach ( $services as $s ) : ?>
                    <article style="background:#f6f8fa;border-radius:8px;overflow:hidden;transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div style="aspect-ratio:16/10;overflow:hidden;">
                            <?php echo wf_picture( $s['photo'], $s['name'], array( 'class' => 'w-full h-full object-cover' ) ); ?>
                        </div>
                        <div style="padding:24px;">
                            <h3 class="text-xl md:text-2xl font-black text-[#2d5c8a] tracking-wider mb-3"><?php echo esc_html( $s['name'] ); ?></h3>
                            <p class="text-sm md:text-base text-gray-700 leading-relaxed"><?php echo esc_html( $s['desc'] ); ?></p>
                        </div>
                    </article>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="relative w-full bg-white text-center" style="padding:clamp(48px,6vw,96px) 0;background:#f6f8fa;">
        <div class="max-w-3xl mx-auto px-6">
            <p class="text-sm font-bold tracking-[0.3em] text-[#4a9db5] mb-3 js-fade-up">CONTACT</p>
            <h3 class="text-2xl md:text-4xl font-black text-[#2d5c8a] tracking-wider mb-8 js-heading-up">サービスのご相談はこちら</h3>
            <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="js-fade-up" style="display:inline-flex;align-items:center;gap:12px;background:#d4874a;color:#fff;font-weight:900;font-size:1.2rem;letter-spacing:.1em;padding:18px 56px;border-radius:9999px;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">お問い合わせ <span>▼</span></a>
        </div>
    </section>

</main>

<?php get_footer(); ?>
