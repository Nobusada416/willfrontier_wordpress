<?php
/**
 * Template Name: サービス
 */
get_header();
?>
<style>
html, body { overflow: hidden !important; height: 100% !important; }
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
<main class="relative w-full" style="margin:0;padding:0;flex:1;display:flex;flex-direction:column;overflow:hidden;">

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

</main>

<?php get_footer(); ?>
