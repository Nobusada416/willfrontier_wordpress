<?php
/**
 * Template Name: ミッション
 */
get_header();
?>

<main class="relative w-full bg-white" style="margin:0;padding:0;flex:1;display:flex;flex-direction:column;">

    <section style="position:relative;width:100%;padding:20px 40px;box-sizing:border-box;flex:1;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/bg_blue.png" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;">
        <!-- 装飾円 -->
        <div style="position:absolute;top:-400px;left:-20px;width:800px;height:800px;border-radius:50%;background:#ffffff;z-index:1;pointer-events:none;"></div>
        <div style="position:absolute;top:330px;left:-100px;width:900px;height:400px;border-radius:50%;background:#ffffff;z-index:1;pointer-events:none;"></div>
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" style="position:absolute;top:0;bottom:0;left:0;width:280px;height:100%;object-fit:cover;pointer-events:none;opacity:.7;z-index:2;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" style="position:absolute;top:0;bottom:0;right:0;width:280px;height:100%;object-fit:cover;pointer-events:none;opacity:.7;z-index:2;">

        <!-- 当社は、＋環境＝画像 -->
        <div style="max-width:1200px;margin:0 auto;position:relative;z-index:3;overflow:visible;">
            <p style="font-size:1.1rem;font-weight:700;color:#374151;margin-bottom:8px;">当社は、</p>
            <div style="margin:0 0 28px;overflow:visible;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/calculation.svg" alt="環境＝地球＋Forest＋水＋Animal＋街＋人" style="width:100%;max-width:100%;height:auto;display:block;margin-left:0;">
            </div>
        </div>

        <!-- 2カラム -->
        <div style="max-width:1200px;margin:0 auto;position:relative;z-index:3;display:flex;gap:60px;align-items:flex-start;">

            <!-- 左カラム -->
            <div style="flex:1;min-width:0;">

                <!-- 説明文 -->
                <div style="font-size:0.78rem;color:#374151;font-weight:600;line-height:1.7;margin-bottom:14px;">
                    横浜というアクセスの良い立地に"積替え・保管"施設を開設。<br>
                    "収集・運搬から積替え・保管、そして最終処分場への搬入"まで、<br>
                    これまでのノウハウとネットワークを活かし、適正処理を担っています。<br>
                    時にはコストの最適化はもちろん、<br>
                    二次公害を引き起こさない細心の作業手順を実践し、<br>
                    収集・運搬、積替え・保管、そして中間処理施設や最終処分場までの<br>
                    安全・確実な処理をトータルにコーディネイトしています。
                </div>

                <!-- + PLUS スマイル宣言 -->
                <div style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;margin-bottom:14px;">
                    <img src="<?php echo get_template_directory_uri(); ?>/assets/images/+.svg" alt="plus" style="width:50px;height:auto;margin-left:110px;">
                    <img src="<?php echo get_template_directory_uri(); ?>/assets/images/smile.svg" alt="スマイル宣言" style="height:80px;width:auto;display:block;margin-left:20px;">
                </div>

                <!-- 地域と共に -->
                <div style="margin-bottom:12px;margin-top:-30px;">
                    <div style="display:inline-block;background:#ffe600;border-radius:9999px;padding:5px 20px;font-size:13px;font-weight:900;color:#1a1a1a;margin-bottom:6px;">地域と共に</div>
                    <p style="font-size:0.78rem;color:#1a1a1a;font-weight:700;line-height:1.7;">
                        当社は、産業廃棄物処理のプロであると同時に、地域の方々のサポーターでも<br>
                        あります。<br>
                        「<span style="color:#e57c3a;font-weight:900;font-size:1.15rem;">環境</span><span style="color:#2d5c8a;font-weight:900;font-size:1.15rem;">＝</span><span style="color:#4a9db5;font-weight:900;font-size:1.15rem;">地球</span><span style="color:#2d5c8a;font-weight:900;font-size:1.15rem;">＋</span><span style="color:#6dbf67;font-weight:900;font-size:1.15rem;">Forest</span><span style="color:#2d5c8a;font-weight:900;font-size:1.15rem;">＋</span><span style="color:#4a9db5;font-weight:900;font-size:1.15rem;">水</span><span style="color:#2d5c8a;font-weight:900;font-size:1.15rem;">＋</span><span style="color:#e57c3a;font-weight:900;font-size:1.15rem;">Animal</span><span style="color:#2d5c8a;font-weight:900;font-size:1.15rem;">＋</span><span style="color:#2d5c8a;font-weight:900;font-size:1.15rem;">街</span><span style="color:#2d5c8a;font-weight:900;font-size:1.15rem;">＋</span><span style="color:#e57c3a;font-weight:900;font-size:1.15rem;">人</span>」という重要な<br>
                        テーマを掲げ、廃棄物処理だけにとどまらず自然環境や街の人々を最大限に<br>
                        尊重しながら環境クリエイターという名に恥じぬ様、地域のために力を<br>
                        尽くしてまいります。
                    </p>
                </div>

                <!-- 地域の美化運動 -->
                <div>
                    <div style="display:inline-block;background:#ffe600;border-radius:9999px;padding:5px 20px;font-size:13px;font-weight:900;color:#1a1a1a;margin-bottom:6px;">地域の美化運動</div>
                    <p style="font-size:0.78rem;color:#374151;font-weight:600;line-height:1.7;">
                        当社の方々に住みやすく、ゴミの無い街づくりをお約束いたします。<br>
                        企業としてではなく、従業員全員が社会人の基本として、<br>
                        毎日２行っている地域清掃をはじめ、元気な挨拶、<br>
                        丁寧な言葉遣いで笑顔あふれる地域をめざし<br>
                        「スマイル宣言」を伝えてまいります。
                    </p>
                </div>

            </div>

            <!-- 右カラム：円形画像エリア -->
            <div style="flex-shrink:0;width:550px;display:flex;align-items:center;justify-content:flex-end;padding-top:40px;">
                <div style="width:550px;height:550px;border-radius:50%;border:6px solid #6dbf67;background:#f3f4f6;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                    <img src="<?php echo get_template_directory_uri(); ?>/assets/images/illust_.png" alt="ミッション" style="width:100%;height:100%;object-fit:cover;display:block;">
                </div>
            </div>

        </div>
    </section>

</main>

<?php get_footer(); ?>
