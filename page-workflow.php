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
<style>
html, body { overflow: hidden !important; height: 100% !important; }
</style>

<main class="relative w-full bg-white" style="margin:0;padding:0;flex:1;display:flex;flex-direction:column;overflow:hidden;">

    <section style="position:relative;width:100%;padding:60px 40px;margin:0;flex:1;display:flex;align-items:center;overflow:hidden;box-sizing:border-box;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="detail-leaf" style="position:absolute;bottom:0;left:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:1;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="detail-leaf detail-leaf-right" style="position:absolute;bottom:0;right:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:1;">

        <div style="max-width:1200px;margin:0 auto;position:relative;z-index:2;text-align:center;width:100%;">

            <!-- タイトル -->
            <h2 style="font-size:2.6rem;font-weight:900;color:#4a9db5;letter-spacing:.05em;margin-bottom:20px;">ウィルフロンティア 処理ネットワーク</h2>

            <!-- サブテキスト -->
            <p style="font-size:0.95rem;color:#4a9db5;font-weight:700;line-height:1.9;margin-bottom:60px;text-align:left;display:inline-block;">
                各県に産業廃棄物処理業者とのネットワークを保有しており、あらゆる産業廃棄物を収集・運搬、中間処理を行い、適正処理を行います。<br>
                委託契約書、マニフェスト伝票の作成・発行はもちろん、お見積りは無料ですので、お気軽にお問い合わせください。
            </p>

            <!-- ネットワーク図 -->
            <div style="display:flex;justify-content:center;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/network.svg" alt="ウィルフロンティア 処理ネットワーク" style="width:100%;max-width:1000px;height:auto;display:block;">
            </div>

        </div>
    </section>

</main>

<?php get_footer(); ?>
