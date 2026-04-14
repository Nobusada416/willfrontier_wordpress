<?php
/**
 * Template Name: サービス
 */
get_header();
?>
<style>
html, body { overflow: hidden !important; height: 100% !important; }
</style>
<main class="relative w-full" style="margin:0;padding:0;flex:1;display:flex;flex-direction:column;overflow:hidden;">

    <section style="position:relative;width:100%;padding:20px 40px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;height:calc(100vh - 72px);">

        <!-- 背景：bg_blue.png -->
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bg_blue.png" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;">

        <!-- 左右の葉 -->
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" style="position:absolute;top:0;bottom:0;left:0;width:280px;height:100%;object-fit:cover;pointer-events:none;opacity:.8;z-index:2;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" style="position:absolute;top:0;bottom:0;right:0;width:280px;height:100%;object-fit:cover;pointer-events:none;opacity:.8;z-index:2;">

        <!-- 中央：サークル -->
        <div style="position:relative;z-index:3;width:100%;max-width:950px;margin:0 auto;height:700px;overflow:visible;">

            <!-- big-circle.svg（大きな緑の円） -->
            <div style="position:absolute;top:55%;left:50%;transform:translate(-50%,-50%);z-index:1;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/big-circle.svg" alt="" style="width:620px;height:620px;">
            </div>

            <!-- bill：circle1の上 -->
            <div style="position:absolute;top:-55px;left:58%;transform:translateX(-50%);z-index:3;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bill.svg" alt="" style="width:220px;height:auto;">
            </div>

            <!-- 上：鉄、非鉄 買い取ります（12時） -->
            <div style="position:absolute;top:60px;left:390px;z-index:4;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/circle1.svg" alt="" style="width:190px;height:190px;">
            </div>

            <!-- 右上：自社中間処理場（2時） -->
            <div style="position:absolute;top:260px;left:620px;z-index:4;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/circle2.svg" alt="" style="width:190px;height:190px;">
            </div>

            <!-- bubble1：circle2の右横 -->
            <div style="position:absolute;top:150px;left:780px;z-index:5;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bubble1.svg" alt="" style="width:480px;height:auto;">
            </div>

            <!-- 右下：現場パトロール（4-5時） -->
            <div style="position:absolute;top:480px;left:520px;z-index:4;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/circle3.svg" alt="" style="width:190px;height:190px;">
            </div>

            <!-- bubble2：circle3の右横 -->
            <div style="position:absolute;top:565px;left:680px;z-index:5;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bubble2.svg" alt="" style="width:240px;height:auto;">
            </div>

            <!-- 左下：どんな産業廃棄物（7-8時） -->
            <div style="position:absolute;top:480px;left:250px;z-index:4;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/circle4.svg" alt="" style="width:190px;height:190px;">
            </div>

            <!-- bubble3：circle4の左横 -->
            <div style="position:absolute;top:625px;left:50px;z-index:5;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bubble3.svg" alt="" style="width:240px;height:auto;">
            </div>

            <!-- 左上：自社の処理施設（10-11時） -->
            <div style="position:absolute;top:260px;left:160px;z-index:4;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/circle5.svg" alt="" style="width:190px;height:190px;">
            </div>

            <!-- bubble4：circle5の左横 -->
            <div style="position:absolute;top:130px;left:-60px;z-index:5;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bubble4.svg" alt="" style="width:240px;height:auto;">
            </div>

        </div>

    </section>

</main>

<?php get_footer(); ?>
