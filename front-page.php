<?php get_header(); ?>

<!-- イントロオーバーレイ -->
<div id="intro-overlay" style="position:fixed;inset:0;z-index:99999;background:rgba(245,158,11,0.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;pointer-events:none;">
    <img id="intro-logo" src="<?php echo get_template_directory_uri(); ?>/assets/images/logocolor.svg" alt="Will Frontier" style="width:320px;max-width:70vw;opacity:0;">
</div>

<main class="relative w-full overflow-x-hidden bg-white">

    <section id="hero" class="relative w-full h-screen min-h-[700px] flex items-center justify-center bg-white overflow-hidden">
        <!-- パターンC: 6枚モザイク自動フェード -->
        <div class="absolute inset-0 z-0" style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:0;">
            <div class="hero-tile" style="overflow:hidden;animation:heroFade 6s infinite;animation-delay:0s;">
                <?php echo wf_picture( 'wf-001', '', array( 'class' => 'w-full h-full object-cover', 'loading' => 'eager' ) ); ?>
            </div>
            <div class="hero-tile" style="overflow:hidden;animation:heroFade 6s infinite;animation-delay:1s;">
                <?php echo wf_picture( 'wf-011', '', array( 'class' => 'w-full h-full object-cover', 'loading' => 'eager' ) ); ?>
            </div>
            <div class="hero-tile" style="overflow:hidden;animation:heroFade 6s infinite;animation-delay:2s;">
                <?php echo wf_picture( 'wf-007', '', array( 'class' => 'w-full h-full object-cover', 'loading' => 'eager' ) ); ?>
            </div>
            <div class="hero-tile" style="overflow:hidden;animation:heroFade 6s infinite;animation-delay:3s;">
                <?php echo wf_picture( 'wf-027', '', array( 'class' => 'w-full h-full object-cover', 'loading' => 'eager' ) ); ?>
            </div>
            <div class="hero-tile" style="overflow:hidden;animation:heroFade 6s infinite;animation-delay:4s;">
                <?php echo wf_picture( 'wf-064', '', array( 'class' => 'w-full h-full object-cover', 'loading' => 'eager' ) ); ?>
            </div>
            <div class="hero-tile" style="overflow:hidden;animation:heroFade 6s infinite;animation-delay:5s;">
                <?php echo wf_picture( 'wf-068', '', array( 'class' => 'w-full h-full object-cover', 'loading' => 'eager' ) ); ?>
            </div>
        </div>
        <style>
        @keyframes heroFade {
            0%, 70%, 100% { opacity: 1; transform: scale(1); }
            85% { opacity: 0.4; transform: scale(1.05); }
        }
        /* 写真の彩度を落として文字色を読みやすく */
        #hero .hero-tile img { filter: saturate(0.7); }
        </style>
        <!-- 軽い暗 overlay（写真モザイクのコントラストを少し整える） -->
        <div class="absolute inset-0 z-[1] pointer-events-none" style="background: rgba(0,0,0,0.15);"></div>

        <div id="hero-content" class="relative z-10 px-6 flex justify-center w-full" style="opacity:0;">
            <!-- frosted glass パネル：可読性を確実に確保 -->
            <div style="background: rgba(255,255,255,0.82); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: clamp(36px, 5vw, 64px) clamp(28px, 6vw, 80px); border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.18); max-width: min(900px, 92vw); text-align: center; display:flex; flex-direction:column; align-items:center;">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logocolor.svg" alt="willF" class="w-44 md:w-56 lg:w-72 mb-7">
                <h2 class="text-3xl md:text-5xl lg:text-6xl font-black tracking-widest mb-4 leading-tight"
                    style="color:#1a3a5c;">
                    都市インフラを支える、<br>産業廃棄物テック。
                </h2>
                <p class="text-sm md:text-base lg:text-lg font-semibold tracking-widest mb-8"
                   style="color:#2d5c8a;">
                    Sustainable Urban Infrastructure &amp; Technology
                </p>
                <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="inline-flex items-center gap-3 bg-[#4a9db5] hover:bg-[#3a85a0] text-white font-black text-lg md:text-xl tracking-widest px-10 py-4 transition-colors duration-300 shadow-lg rounded-full">
                    <span class="text-4xl font-thin leading-none">&gt;</span> CONTACT
                </a>
            </div>
        </div>
    </section>

    <section id="mission" class="relative w-full h-[calc(100vh-72px)] bg-white flex flex-col justify-center">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="absolute top-0 left-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="absolute bottom-0 right-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">
        <!-- パターンC: ミッション背景に写真自動切替 -->
        <div class="absolute inset-0 z-0">
            <div style="position:absolute;inset:0;animation:missionFade1 12s infinite;">
                <?php echo wf_picture( 'wf-006', '', array( 'class' => 'w-full h-full object-cover opacity-40' ) ); ?>
            </div>
            <div style="position:absolute;inset:0;animation:missionFade2 12s infinite;">
                <?php echo wf_picture( 'wf-022', '', array( 'class' => 'w-full h-full object-cover opacity-40' ) ); ?>
            </div>
            <div style="position:absolute;inset:0;animation:missionFade3 12s infinite;">
                <?php echo wf_picture( 'wf-049', '', array( 'class' => 'w-full h-full object-cover opacity-40' ) ); ?>
            </div>
        </div>
        <style>
        @keyframes missionFade1 { 0%,33%,100% { opacity:1; } 50%,83% { opacity:0; } }
        @keyframes missionFade2 { 0%,17%,67%,100% { opacity:0; } 33%,50% { opacity:1; } }
        @keyframes missionFade3 { 0%,50%,100% { opacity:0; } 67%,83% { opacity:1; } }
        </style>

        <!-- 文字可読性確保のための暗色オーバーレイ -->
        <div class="absolute inset-0 bg-black/40 pointer-events-none" style="z-index:5;"></div>

        <div class="relative z-30 w-full text-center" style="padding: 0 8vw;">

            <h3 class="text-6xl md:text-7xl font-black text-white tracking-wider mb-12 js-heading-up" style="text-shadow:0 2px 12px rgba(0,0,0,0.5);">MISSION</h3>

            <!-- 環境の方程式 -->
            <div class="js-fade-up mb-4 inline-block relative">
                <p class="font-black text-[#7fc8de] tracking-wide leading-tight" style="font-size:clamp(1rem, 2.8vw, 2.6rem); text-shadow:0 2px 8px rgba(0,0,0,0.45);">
                    環境 = 地球 + Forest + 水 + Animal + 街 + 人
                </p>
                <p class="text-[#7fc8de] font-bold tracking-wide text-right" style="font-size:clamp(0.8rem, 1.6vw, 1.5rem); text-shadow:0 2px 6px rgba(0,0,0,0.45);">を重要なテーマとして捉えています。</p>
            </div>

            <!-- PLUS スマイル宣言 -->
            <div class="js-fade-up mt-4 mb-8 flex flex-col items-center">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/+.svg" alt="plus" style="width:100px;height:100px;display:block;margin-left:2vw;">
                <p class="tracking-wide leading-tight mt-3" style="color:#f59e0b; font-size:clamp(1.2rem, 2.5vw, 2rem); white-space:nowrap; font-weight:900; margin-right:1vw; text-shadow:0 2px 10px rgba(0,0,0,0.6), 0 0 4px rgba(0,0,0,0.4);">スマイル宣言</p>
            </div>

            <!-- もっと見るボタン -->
            <div class="js-fade-up">
                <a href="<?php echo esc_url( home_url( '/mission/' ) ); ?>" style="background:#d4874a;border-radius:9999px;padding:14px 48px;display:inline-flex;align-items:center;gap:10px;color:#fff;font-weight:900;font-size:1.5rem;letter-spacing:.1em;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
                    もっと見る <span>▼</span>
                </a>
            </div>

        </div>
    </section>

    <section id="service" class="relative w-full h-[calc(100vh-72px)] bg-white flex flex-col justify-center">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="absolute bottom-0 left-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" class="absolute top-0 right-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">


        <div class="relative z-30 w-full text-center" style="padding:0 8vw;">
            <h3 class="text-6xl md:text-7xl font-black text-gray-700 tracking-wider mb-8 js-heading-up">SERVICE</h3>

            <!-- 5サークルレイアウト -->
            <?php
            // 共通スタイル
            $outer = 'width:clamp(130px,14.5vw,215px);height:clamp(130px,14.5vw,215px);border-radius:50%;background:#4a9db5;display:flex;align-items:center;justify-content:center;padding:clamp(10px,1.1vw,16px);cursor:pointer;transition:transform 0.2s;flex-shrink:0;';
            $inner = 'width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,0.85);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:clamp(12px,1.4vw,22px);line-height:1.3;text-align:center;padding:clamp(12px,1.4vw,20px);';
            $outer_lg = 'width:clamp(130px,14.5vw,215px);height:clamp(130px,14.5vw,215px);border-radius:50%;background:#4a9db5;display:flex;align-items:center;justify-content:center;padding:clamp(10px,1.1vw,16px);cursor:pointer;transition:transform 0.2s;flex-shrink:0;';
            $inner_lg = 'width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,0.85);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:clamp(12px,1.4vw,22px);line-height:1.3;text-align:center;padding:clamp(12px,1.4vw,20px);';
            ?>
            <div class="relative js-fade-up" style="max-width:900px;margin:0 auto;margin-top:-2vw;">

                <!-- 上段 2つ -->
                <div style="display:flex;justify-content:space-between;margin-bottom:-50px;">
                    <div class="svc-circle" style="<?php echo $outer; ?>" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="<?php echo $inner; ?>font-size:21px;white-space:nowrap;">自社の<br>処理施設を<br>（積替え・保管）<br>所有</div>
                    </div>
                    <div class="svc-circle" style="<?php echo $outer; ?>" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="<?php echo $inner; ?>display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;">
                                <span>自社<br>中間処理場</span>
                                <span style="display:inline-block;background:none;border:1.5px solid rgba(255,255,255,0.7);padding:6px 20px;font-size:16px;white-space:nowrap;">WF-A.BASE</span>
                            </div>
                    </div>
                </div>

                <!-- 中段 センター -->
                <div style="display:flex;justify-content:center;margin-bottom:-50px;">
                    <div class="svc-circle" style="<?php echo $outer_lg; ?>" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="<?php echo $inner_lg; ?>font-size:18px;flex-direction:column;gap:4px;"><span style="white-space:nowrap;">鉄・非鉄</span><span style="white-space:nowrap;">買い取ります。</span></div>
                    </div>
                </div>

                <!-- 下段 2つ -->
                <div style="display:flex;justify-content:space-between;">
                    <div class="svc-circle" style="<?php echo $outer; ?>" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="<?php echo $inner; ?>white-space:nowrap;">どんな<br>産業廃棄物にも<br>対応</div>
                    </div>
                    <div class="svc-circle" style="<?php echo $outer; ?>" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="<?php echo $inner; ?>">現場<br>パトロール<br>小口回収でも<br>お気軽に</div>
                    </div>
                </div>
            </div>

            <!-- もっと見るボタン -->
            <div class="mt-4 js-fade-up">
                <a href="<?php echo esc_url( home_url( '/service/' ) ); ?>" style="background:#d4874a;border-radius:9999px;padding:16px 72px;display:inline-flex;align-items:center;gap:10px;color:#fff;font-weight:900;font-size:1.2rem;letter-spacing:.1em;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
                    もっと見る <span>▼</span>
                </a>
            </div>
        </div>
    </section>

    <section id="workflow" class="relative w-full h-[calc(100vh-72px)] bg-white flex flex-col justify-center">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="absolute top-0 left-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="absolute bottom-0 right-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">


        <div class="relative z-30 w-full text-center" style="padding:0 8vw;">
            <h3 class="text-6xl md:text-7xl font-black text-gray-700 tracking-wider mb-12 js-heading-up">WORKFLOW</h3>

            <div style="max-width:700px;margin:0 auto;">
                <div class="border-t border-[#4a9db5]">

                    <?php
                    $steps = [
                        ['num'=>'01','en'=>'HEARING',   'ja'=>'現状の課題ヒアリング'],
                        ['num'=>'02','en'=>'PLANNING',  'ja'=>'最適なプランニング'],
                        ['num'=>'03','en'=>'PROPOSAL',  'ja'=>'お見積り・ご提案'],
                        ['num'=>'04','en'=>'CONTRACT',  'ja'=>'契約締結'],
                        ['num'=>'05','en'=>'OPERATION', 'ja'=>'運用開始・定期フォロー'],
                    ];
                    foreach ($steps as $s) : ?>
                    <div class="flex items-center border-b border-[#4a9db5] js-fade-up" style="gap:clamp(0.8rem,1.5vw,2rem);padding:clamp(0.5rem,1.5vh,1.75rem) 0;">
                        <span class="font-black text-[#4a9db5] flex-shrink-0" style="font-size:clamp(1.2rem,2.2vw,2.2rem);width:clamp(2.5rem,3.5vw,3.5rem);text-align:left;"><?php echo $s['num']; ?></span>
                        <h4 class="font-black text-gray-700 tracking-wider flex-shrink-0" style="font-size:clamp(1rem,2vw,2rem);text-align:left;min-width:clamp(100px,13vw,200px);"><?php echo $s['en']; ?></h4>
                        <p class="text-gray-500 font-bold tracking-wider text-right flex-1" style="font-size:clamp(0.7rem,0.9vw,0.9rem);"><?php echo $s['ja']; ?></p>
                    </div>
                    <?php endforeach; ?>

                </div>
            </div>

            <div class="text-center mt-12 js-fade-up">
                <a href="<?php echo esc_url( home_url( '/workflow/' ) ); ?>" style="background:#d4874a;border-radius:9999px;padding:16px 72px;display:inline-flex;align-items:center;gap:10px;color:#fff;font-weight:900;font-size:1.2rem;letter-spacing:.1em;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">もっと見る <span>▼</span></a>
            </div>
        </div>
    </section>

    <section id="vehicles" class="relative w-full h-[calc(100vh-72px)] bg-white flex flex-col items-center justify-center">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="absolute bottom-0 left-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" class="absolute top-0 right-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">
        <div class="absolute inset-0 z-0">
            <img src="<?php echo get_template_directory_uri(); ?>/assets/images/車両-イラスト風.jpg" alt="背景" class="w-full h-full object-cover opacity-10">
        </div>


        <div class="relative z-30 w-full text-center" style="padding:0 8vw;">
            <h3 class="text-6xl md:text-7xl font-black text-gray-700 tracking-wider mb-10 js-heading-up">VEHICLE LINEUP</h3>

            <!-- スライダー（矢印は画像の真横に絶対配置） -->
            <div class="js-fade-up" style="position:relative;max-width:860px;margin:0 auto;">

                <div class="swiper vehicleSwiper w-full" style="padding-bottom:48px;">
                    <div class="swiper-wrapper">
                        <div class="swiper-slide w-full flex flex-col items-center">
                            <div style="background:#fff;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);width:100%;">
                                <?php echo wf_picture( 'wf-007', 'アームロール車', array( 'class' => 'w-full h-full object-cover' ) ); ?>
                            </div>
                            <p class="font-black text-gray-800 tracking-wider mt-5" style="font-size:1.2rem;">
                                ARM ROLL <span style="font-size:0.9rem;color:#6b7280;font-weight:700;margin-left:8px;">4t アームロール車</span>
                            </p>
                        </div>
                        <div class="swiper-slide w-full flex flex-col items-center">
                            <div style="background:#fff;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);width:100%;">
                                <?php echo wf_picture( 'wf-039', 'ダンプトラック', array( 'class' => 'w-full h-full object-cover' ) ); ?>
                            </div>
                            <p class="font-black text-gray-800 tracking-wider mt-5" style="font-size:1.2rem;">
                                DUMP TRUCK <span style="font-size:0.9rem;color:#6b7280;font-weight:700;margin-left:8px;">ダンプトラック</span>
                            </p>
                        </div>
                        <div class="swiper-slide w-full flex flex-col items-center">
                            <div style="background:#fff;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);width:100%;">
                                <?php echo wf_picture( 'wf-042', 'コンテナ運搬車', array( 'class' => 'w-full h-full object-cover' ) ); ?>
                            </div>
                            <p class="font-black text-gray-800 tracking-wider mt-5" style="font-size:1.2rem;">
                                PACKER CAR <span style="font-size:0.9rem;color:#6b7280;font-weight:700;margin-left:8px;">パッカー車</span>
                            </p>
                        </div>
                    </div>
                    <div class="swiper-pagination"></div>
                </div>

                <!-- 矢印：画像の真横に絶対配置 -->
                <button class="vehicle-prev" style="position:absolute;top:clamp(90px,calc(50vh - 170px),210px);left:-56px;transform:translateY(-50%);background:none;border:none;cursor:pointer;z-index:10;">
                    <svg viewBox="0 0 24 24" style="width:44px;height:44px;" fill="#2d5c8a"><path d="M16.5 3c-.5 0-1 .2-1.4.6l-9 8c-.8.7-.8 2 0 2.8l9 8c.8.7 2.1.4 2.6-.4.2-.3.3-.7.3-1V5c0-1.1-.9-2-2-2z"/></svg>
                </button>
                <button class="vehicle-next" style="position:absolute;top:clamp(90px,calc(50vh - 170px),210px);right:-56px;transform:translateY(-50%);background:none;border:none;cursor:pointer;z-index:10;">
                    <svg viewBox="0 0 24 24" style="width:44px;height:44px;transform:scaleX(-1);" fill="#2d5c8a"><path d="M16.5 3c-.5 0-1 .2-1.4.6l-9 8c-.8.7-.8 2 0 2.8l9 8c.8.7 2.1.4 2.6-.4.2-.3.3-.7.3-1V5c0-1.1-.9-2-2-2z"/></svg>
                </button>
            </div>

            <div class="text-center mt-8 js-fade-up">
                <a href="<?php echo esc_url( home_url( '/vehicles/' ) ); ?>" style="background:#d4874a;border-radius:9999px;padding:16px 72px;display:inline-flex;align-items:center;gap:10px;color:#fff;font-weight:900;font-size:1.2rem;letter-spacing:.1em;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">もっと見る <span>▼</span></a>
            </div>
        </div>
    </section>

    <!-- パターンC: GALLERY セクション（★目玉） -->
    <section id="gallery" class="relative w-full min-h-screen bg-gray-50 py-16 px-4 md:px-8">
        <div class="relative z-10 w-full max-w-7xl mx-auto">
            <div class="text-center mb-8">
                <h3 class="text-6xl md:text-7xl font-black text-[#2d5c8a] tracking-wider js-heading-up">GALLERY</h3>
                <p class="text-gray-600 mt-2 tracking-wider text-sm md:text-base">現場のリアル — 写真と動画で見る WILL FRONTIER</p>
            </div>

            <!-- フィルタタブ -->
            <div class="js-fade-up flex justify-center gap-3 mb-6 flex-wrap">
                <button class="gallery-filter active" data-tag="all" style="padding:8px 20px;border-radius:9999px;background:#2d5c8a;color:#fff;border:none;font-weight:700;cursor:pointer;letter-spacing:.05em;">ALL</button>
                <button class="gallery-filter" data-tag="demolition" style="padding:8px 20px;border-radius:9999px;background:#fff;color:#2d5c8a;border:1px solid #2d5c8a;font-weight:700;cursor:pointer;letter-spacing:.05em;">解体・重機</button>
                <button class="gallery-filter" data-tag="transport" style="padding:8px 20px;border-radius:9999px;background:#fff;color:#2d5c8a;border:1px solid #2d5c8a;font-weight:700;cursor:pointer;letter-spacing:.05em;">車両・運搬</button>
                <button class="gallery-filter" data-tag="people" style="padding:8px 20px;border-radius:9999px;background:#fff;color:#2d5c8a;border:1px solid #2d5c8a;font-weight:700;cursor:pointer;letter-spacing:.05em;">人・現場</button>
                <button class="gallery-filter" data-tag="video" style="padding:8px 20px;border-radius:9999px;background:#fff;color:#2d5c8a;border:1px solid #2d5c8a;font-weight:700;cursor:pointer;letter-spacing:.05em;">動画</button>
            </div>

            <!-- マソンリー（CSS columns）-->
            <div class="js-fade-up gallery-grid" style="column-count:4;column-gap:8px;">
                <?php
                // タグ付きアイテムリスト（写真と動画）
                $items = [
                    ['type'=>'photo', 'slug'=>'wf-001', 'tag'=>'demolition'],
                    ['type'=>'photo', 'slug'=>'wf-011', 'tag'=>'demolition'],
                    ['type'=>'video', 'slug'=>'shorts/s01', 'tag'=>'video'],
                    ['type'=>'photo', 'slug'=>'wf-007', 'tag'=>'transport'],
                    ['type'=>'photo', 'slug'=>'wf-027', 'tag'=>'demolition'],
                    ['type'=>'photo', 'slug'=>'wf-037', 'tag'=>'people'],
                    ['type'=>'video', 'slug'=>'shorts/s02', 'tag'=>'video'],
                    ['type'=>'photo', 'slug'=>'wf-039', 'tag'=>'transport'],
                    ['type'=>'photo', 'slug'=>'wf-019', 'tag'=>'demolition'],
                    ['type'=>'photo', 'slug'=>'wf-064', 'tag'=>'people'],
                    ['type'=>'video', 'slug'=>'shorts/s03', 'tag'=>'video'],
                    ['type'=>'photo', 'slug'=>'wf-042', 'tag'=>'transport'],
                    ['type'=>'photo', 'slug'=>'wf-024', 'tag'=>'demolition'],
                    ['type'=>'photo', 'slug'=>'wf-070', 'tag'=>'people'],
                    ['type'=>'video', 'slug'=>'shorts/s04', 'tag'=>'video'],
                    ['type'=>'photo', 'slug'=>'wf-049', 'tag'=>'transport'],
                    ['type'=>'photo', 'slug'=>'wf-031', 'tag'=>'demolition'],
                    ['type'=>'photo', 'slug'=>'wf-043', 'tag'=>'people'],
                    ['type'=>'video', 'slug'=>'shorts/s05', 'tag'=>'video'],
                    ['type'=>'photo', 'slug'=>'wf-061', 'tag'=>'transport'],
                    ['type'=>'photo', 'slug'=>'wf-068', 'tag'=>'demolition'],
                    ['type'=>'photo', 'slug'=>'wf-005', 'tag'=>'people'],
                    ['type'=>'video', 'slug'=>'shorts/s06', 'tag'=>'video'],
                    ['type'=>'photo', 'slug'=>'wf-057', 'tag'=>'transport'],
                    ['type'=>'photo', 'slug'=>'wf-018', 'tag'=>'demolition'],
                    ['type'=>'photo', 'slug'=>'wf-036', 'tag'=>'people'],
                    ['type'=>'video', 'slug'=>'shorts/s07', 'tag'=>'video'],
                    ['type'=>'photo', 'slug'=>'wf-053', 'tag'=>'transport'],
                ];
                foreach ($items as $it) :
                    if ($it['type'] === 'photo') : ?>
                <div class="gallery-item" data-tag="<?php echo esc_attr($it['tag']); ?>" style="break-inside:avoid;margin-bottom:8px;overflow:hidden;border-radius:4px;cursor:pointer;">
                    <?php echo wf_picture( $it['slug'], '', array( 'class' => 'w-full h-auto block' ) ); ?>
                </div>
                    <?php else : ?>
                <div class="gallery-item" data-tag="video" style="break-inside:avoid;margin-bottom:8px;overflow:hidden;border-radius:4px;background:#000;">
                    <?php echo wf_video( $it['slug'], array(
                        'autoplay'=>true, 'loop'=>true, 'muted'=>true, 'controls'=>false,
                        'poster'=>$it['slug'], 'class'=>'w-full h-auto block',
                    ) ); ?>
                </div>
                    <?php endif;
                endforeach; ?>
            </div>
        </div>

        <style>
        @media (max-width: 1024px) { .gallery-grid { column-count: 3 !important; } }
        @media (max-width: 768px)  { .gallery-grid { column-count: 2 !important; } }
        @media (max-width: 480px)  { .gallery-grid { column-count: 1 !important; } }
        .gallery-filter.active { background:#2d5c8a !important; color:#fff !important; border-color:#2d5c8a !important; }
        </style>
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            var filters = document.querySelectorAll('.gallery-filter');
            var items = document.querySelectorAll('.gallery-item');
            filters.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    filters.forEach(function(b){ b.classList.remove('active'); });
                    btn.classList.add('active');
                    var tag = btn.getAttribute('data-tag');
                    items.forEach(function(item) {
                        if (tag === 'all' || item.getAttribute('data-tag') === tag) {
                            item.style.display = '';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            });
        });
        </script>
    </section>

    <!-- CASE STUDY セクション -->
    <section id="case-study" class="relative w-full h-[calc(100vh-72px)] bg-white flex flex-col items-center justify-center">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="absolute top-0 left-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="absolute bottom-0 right-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">


        <div class="relative z-20 w-full max-w-2xl mx-auto px-8">
            <div class="text-center mb-12">
                <h3 class="text-6xl md:text-7xl font-black text-[#2d5c8a] tracking-wider js-heading-up">CASE STUDY</h3>
            </div>

            <?php
            $cases = [
                ['date' => '2026.00.00', 'company' => '○○○○○○', 'tag' => '運用開始'],
                ['date' => '2026.00.00', 'company' => '○○○○○○', 'tag' => '構築'],
                ['date' => '2026.00.00', 'company' => '○○○○○○', 'tag' => '実証実験'],
                ['date' => '2026.00.00', 'company' => '○○○○○○', 'tag' => '研修'],
            ];
            ?>
            <div class="js-fade-up" style="border-top:1.5px solid #c8d9e6;">
                <?php foreach ($cases as $case) : ?>
                <a href="#" style="display:flex;align-items:center;padding:20px 0;border-bottom:1.5px solid #c8d9e6;text-decoration:none;color:inherit;transition:background 0.2s;" onmouseover="this.style.background='#f0f7fa'" onmouseout="this.style.background='transparent'">
                    <span style="font-size:18px;font-weight:700;color:#4a9db5;width:140px;flex-shrink:0;letter-spacing:.05em;"><?php echo esc_html($case['date']); ?></span>
                    <span style="font-size:18px;font-weight:700;color:#374151;flex:1;letter-spacing:.05em;"><?php echo esc_html($case['company']); ?>　<?php echo esc_html($case['tag']); ?></span>
                    <span style="color:#4a9db5;font-size:22px;font-weight:700;">→</span>
                </a>
                <?php endforeach; ?>
            </div>

            <div class="text-center mt-10 js-fade-up">
                <a href="<?php echo esc_url( home_url( '/casestudy/' ) ); ?>" style="background:#d4874a;border-radius:9999px;padding:16px 72px;display:inline-flex;align-items:center;gap:10px;color:#fff;font-weight:900;font-size:1.2rem;letter-spacing:.1em;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">もっと見る <span>▼</span></a>
            </div>
        </div>
    </section>

    <section id="safety" class="relative w-full h-[calc(100vh-72px)] bg-white flex flex-col items-center justify-center">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="absolute bottom-0 left-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" class="absolute top-0 right-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">


        <div class="relative z-30 w-full max-w-7xl mx-auto px-8 md:px-12">
            <div class="text-center mb-12">
                <h3 class="text-6xl md:text-7xl font-black text-[#2d5c8a] tracking-wider js-heading-up">SAFETY</h3>
            </div>

            <!-- 写真ボックス -->
            <div class="js-fade-up" style="position:relative;border:1.5px solid #c8d9e6;border-radius:4px;overflow:hidden;background:#000;width:clamp(400px,75vw,1000px);margin:0 auto;">
                <!-- 画像（作業員＋ショベルカー：人と機械の安全を象徴） -->
                <div style="width:100%;height:clamp(200px,44vh,480px);overflow:hidden;">
                    <?php echo wf_picture( 'wf-064', '安全に配慮した重機操作', array( 'class' => 'w-full h-full object-cover' ) ); ?>
                </div>
                <!-- 下部暗グラデ（キャッチコピー可読性のため） -->
                <div style="position:absolute;bottom:0;left:0;right:0;height:55%;background:linear-gradient(to top, rgba(0,0,0,0.7), transparent);pointer-events:none;"></div>
                <!-- キャッチコピー（写真下部中央に重ねて表示） -->
                <div style="position:absolute;bottom:0;left:0;right:0;padding:32px 32px;text-align:center;z-index:2;">
                    <p style="font-size:2.4rem;font-weight:900;color:#ffffff;letter-spacing:.06em;text-shadow:0 2px 12px rgba(0,0,0,0.7), 0 0 6px rgba(0,0,0,0.5);">毎日の安全が、地域の安全をつくる。</p>
                </div>
            </div>

            <div class="text-center mt-12 js-fade-up">
                <a href="<?php echo esc_url( home_url( '/safety/' ) ); ?>" style="background:#2d5c8a;border-radius:9999px;padding:16px 56px;display:inline-flex;align-items:center;gap:10px;color:#f5c518;font-weight:900;font-size:1.1rem;letter-spacing:.1em;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">もっと見る・お問い合わせ <span>▼</span></a>
            </div>
        </div>
    </section>

    <!-- RECRUIT セクション -->
    <section id="recruit" class="relative w-full h-[calc(100vh-72px)] bg-white flex flex-col items-center justify-center">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="absolute top-0 left-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="absolute bottom-0 right-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">


        <div class="relative z-20 w-full max-w-7xl mx-auto px-8 md:px-16">
            <div class="text-center mb-12">
                <h3 class="text-6xl md:text-7xl font-black text-[#2d5c8a] tracking-wider js-heading-up">RECRUIT</h3>
            </div>

            <!-- パターンC: 人物写真3枚（応募動機を引き出す） -->
            <div class="js-fade-up">
                <?php
                $recruit_people = array(
                    array( 'photo' => 'wf-037', 'sub' => 'TEAM',           'label' => '仲間と、共に。' ),
                    array( 'photo' => 'wf-043', 'sub' => 'PROFESSIONAL',   'label' => '一人ひとりの挑戦。' ),
                    array( 'photo' => 'wf-070', 'sub' => 'FIELD',          'label' => '現場で、活きる。' ),
                );
                ?>
                <style>
                @media (max-width: 768px) { .recruit-people-grid { grid-template-columns: 1fr !important; } }
                </style>
                <div class="recruit-people-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
                    <?php foreach ( $recruit_people as $p ) : ?>
                    <div style="position:relative;aspect-ratio:3/4;overflow:hidden;border-radius:6px;background:#000;">
                        <?php echo wf_picture( $p['photo'], $p['label'], array( 'class' => 'w-full h-full object-cover' ) ); ?>
                        <!-- 下部暗グラデ -->
                        <div style="position:absolute;bottom:0;left:0;right:0;height:60%;background:linear-gradient(to top, rgba(0,0,0,0.78), transparent);pointer-events:none;"></div>
                        <!-- タグライン -->
                        <div style="position:absolute;bottom:20px;left:22px;right:22px;color:#fff;">
                            <p style="font-size:0.78rem;font-weight:700;letter-spacing:.25em;opacity:.85;margin-bottom:6px;"><?php echo esc_html( $p['sub'] ); ?></p>
                            <p style="font-size:clamp(1.1rem,1.6vw,1.6rem);font-weight:900;letter-spacing:.05em;text-shadow:0 2px 8px rgba(0,0,0,0.6);"><?php echo esc_html( $p['label'] ); ?></p>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <div style="background:#fef9e7;border:1px solid #f0d96a;padding:18px 24px;margin-top:16px;text-align:center;">
                    <p style="font-size:clamp(1.5rem,2.5vw,3rem);font-weight:900;color:#2d5c8a;letter-spacing:.05em;">スマイル宣言はじめませんか？</p>
                </div>
            </div>

            <!-- スマイル宣言説明バー -->
            <div class="js-fade-up" style="background:#fef9e7;border:1px solid #f0d96a;border-top:none;padding:clamp(10px,1.5vh,18px) 20px;font-size:clamp(0.85rem,1.3vw,1.25rem);font-weight:700;color:#2d5c8a;line-height:1.7;text-align:center;">
                スマイル宣言とは：元気な挨拶、丁寧な言葉遣いで笑顔あふれる地域をめざす、ウィルフロンティアの取り組み
            </div>

            <div class="text-center mt-12 js-fade-up">
                <a href="<?php echo esc_url( home_url( '/recruit/' ) ); ?>" style="background:#2d5c8a;border-radius:6px;padding:24px 120px;display:inline-flex;align-items:center;gap:10px;color:#f5c518;font-weight:900;font-size:1.6rem;letter-spacing:.1em;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">応募する <span>▼</span></a>
            </div>
        </div>
    </section>

    <section id="company" class="relative w-full h-[calc(100vh-72px)] bg-white flex flex-col items-center justify-center" style="overflow:hidden;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="absolute bottom-0 left-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" class="absolute top-0 right-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">
        <div class="absolute inset-0 z-0">
            <img src="<?php echo get_template_directory_uri(); ?>/assets/images/横浜全景-イラスト風.jpg" alt="背景" class="w-full h-full object-cover opacity-10">
        </div>


        <div id="company-inner" class="relative z-30 w-full max-w-6xl mx-auto" style="padding:0 6%;">
            <h3 class="text-6xl md:text-7xl font-black text-[#2d5c8a] tracking-wider mb-16 text-center js-heading-up">CAMPANY</h3>

            <div style="border-top:1.5px solid #4a9db5;">
                <dl class="js-fade-up" style="display:flex;padding:20px 0;border-bottom:none;background-image:repeating-linear-gradient(to right,#4a9db5 0,#4a9db5 20px,transparent 20px,transparent 36px);background-repeat:repeat-x;background-position:bottom;background-size:100% 1px;align-items:flex-start;">
                    <dt style="color:#4a9db5;font-weight:700;letter-spacing:.12em;width:280px;flex-shrink:0;font-size:18px;">COMPANY NAME</dt>
                    <dd style="color:#2d5c8a;font-weight:700;font-size:20px;letter-spacing:.04em;">株式会社 ウィルフロンティア</dd>
                </dl>
                <dl class="js-fade-up" style="display:flex;padding:20px 0;border-bottom:none;background-image:repeating-linear-gradient(to right,#4a9db5 0,#4a9db5 20px,transparent 20px,transparent 36px);background-repeat:repeat-x;background-position:bottom;background-size:100% 1px;align-items:flex-start;">
                    <dt style="color:#4a9db5;font-weight:700;letter-spacing:.12em;width:280px;flex-shrink:0;font-size:18px;">REPRESENTATIVE</dt>
                    <dd style="color:#2d5c8a;font-weight:700;font-size:20px;letter-spacing:.04em;">代表取締役　石政 章治</dd>
                </dl>
                <dl class="js-fade-up" style="display:flex;padding:20px 0;border-bottom:none;background-image:repeating-linear-gradient(to right,#4a9db5 0,#4a9db5 20px,transparent 20px,transparent 36px);background-repeat:repeat-x;background-position:bottom;background-size:100% 1px;align-items:flex-start;">
                    <dt style="color:#4a9db5;font-weight:700;letter-spacing:.12em;width:280px;flex-shrink:0;font-size:18px;">ADDRESS</dt>
                    <dd style="color:#2d5c8a;font-weight:700;font-size:20px;line-height:1.9;">
                        <div style="margin-bottom:20px;">
                            <span style="display:inline-block;background:#4a9db5;border:none;color:#fff;font-size:16px;font-weight:700;padding:8px 0;margin-bottom:4px;letter-spacing:.08em;display:block;width:140px;text-align:center;">横浜本社</span>
                            〒241-0003 神奈川県横浜市旭区白根町 895 番地<br>
                            TEL 045-959-3225　FAX 045-959-3226<br>
                            MAIL　eco-will@kvj.biglobe.ne.jp
                        </div>
                        <div style="margin-bottom:20px;">
                            <span style="display:inline-block;background:#4a9db5;border:none;color:#fff;font-size:16px;font-weight:700;padding:8px 0;margin-bottom:4px;letter-spacing:.08em;display:block;width:140px;text-align:center;">WF-A.BASE</span>
                            〒243-0807 神奈川県厚木市金田 1107-7<br>
                            TEL 046-205-4177　FAX 046-205-4178
                        </div>
                        <div>
                            <span style="display:inline-block;background:#4a9db5;border:none;color:#fff;font-size:16px;font-weight:700;padding:8px 0;margin-bottom:4px;letter-spacing:.08em;display:block;width:140px;text-align:center;">川口支社</span>
                            〒334-0076 埼玉県川口市本蓮 4-5-10<br>
                            TEL 048-229-4024　FAX 048-229-4025
                        </div>
                    </dd>
                </dl>
                <dl class="js-fade-up" style="display:flex;padding:20px 0;border-bottom:none;background-image:repeating-linear-gradient(to right,#4a9db5 0,#4a9db5 20px,transparent 20px,transparent 36px);background-repeat:repeat-x;background-position:bottom;background-size:100% 1px;align-items:flex-start;">
                    <dt style="color:#4a9db5;font-weight:700;letter-spacing:.12em;width:280px;flex-shrink:0;font-size:18px;">ESTABLISHED</dt>
                    <dd style="color:#2d5c8a;font-weight:700;font-size:20px;">平成 25 年 10 月 25 日</dd>
                </dl>
                <dl class="js-fade-up" style="display:flex;padding:20px 0;border-bottom:none;background-image:repeating-linear-gradient(to right,#4a9db5 0,#4a9db5 20px,transparent 20px,transparent 36px);background-repeat:repeat-x;background-position:bottom;background-size:100% 1px;align-items:flex-start;">
                    <dt style="color:#4a9db5;font-weight:700;letter-spacing:.12em;width:280px;flex-shrink:0;font-size:18px;">CAPITAL</dt>
                    <dd style="color:#2d5c8a;font-weight:700;font-size:20px;">1,000 万円</dd>
                </dl>
                <dl class="js-fade-up" style="display:flex;padding:20px 0;align-items:flex-start;">
                    <dt style="color:#4a9db5;font-weight:700;letter-spacing:.12em;width:280px;flex-shrink:0;font-size:18px;">BUSINESS</dt>
                    <dd style="color:#2d5c8a;font-weight:700;font-size:20px;">産業廃棄物収集運搬業 / リサイクル事業 / コンサルティング</dd>
                </dl>
            </div>
        </div>
    </section>

</main>

<script>
function scaleCompanySection() {
    var inner = document.getElementById('company-inner');
    if (!inner) return;
    var section = document.getElementById('company');
    inner.style.transform = 'scale(1)';
    inner.style.transformOrigin = 'top center';
    var availH = section.clientHeight - 60;
    var availW = section.clientWidth - 80;
    var scaleH = availH / inner.scrollHeight;
    var scaleW = availW / inner.scrollWidth;
    var scale = Math.min(scaleH, scaleW, 1);
    inner.style.transform = 'scale(' + scale + ')';
    inner.style.marginBottom = -(inner.scrollHeight * (1 - scale)) + 'px';
}
window.addEventListener('load', scaleCompanySection);
window.addEventListener('resize', scaleCompanySection);
</script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const swiper = new Swiper('.vehicleSwiper', {
            loop: true,
            grabCursor: true,
            spaceBetween: 30,
            navigation: {
                nextEl: '.vehicle-next',
                prevEl: '.vehicle-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });
    });
</script>
<style>
    /* 矢印のデザイン調整 */
    .vehicle-prev, .vehicle-next { opacity: 1; transition: opacity 0.3s; }
    .vehicle-prev:hover, .vehicle-next:hover { opacity: 0.5; }

    .swiper-pagination-bullet { background-color: transparent !important; border: 2px solid #4a9db5 !important; opacity: 1 !important; width: 14px !important; height: 14px !important; margin: 0 8px !important; }
    .swiper-pagination-bullet-active { background-color: #4a9db5 !important; }
    .swiper-pagination { position: relative !important; bottom: 0 !important; margin-top: 20px; }
    .vehicleSwiper .swiper-slide { overflow: visible; }
    .aspect-square { aspect-ratio: 1 / 1; }

    /* js-fade-up / js-leaf の初期状態 */
    .js-fade-up { opacity: 0; }

    /* ─── vw/vhベース統一スタイル（全PCサイズで比例スケール） ──────── */
    main section h3 {
        font-size: clamp(2rem, 5vw, 4.5rem) !important;
    }

    /* セクション共通余白 */
    main section .mb-12 { margin-bottom: clamp(0.8rem, 2.5vh, 3rem) !important; }
    main section .mt-12 { margin-top:    clamp(0.8rem, 2.5vh, 3rem) !important; }
    main section .mb-10 { margin-bottom: clamp(0.6rem, 2vh,   2.5rem) !important; }
    main section .mb-16 { margin-bottom: clamp(1rem,   3vh,   4rem) !important; }
    main section .mb-8  { margin-bottom: clamp(0.5rem, 1.8vh, 2rem) !important; }
    main section .mt-8  { margin-top:    clamp(0.5rem, 1.8vh, 2rem) !important; }
    main section .mt-10 { margin-top:    clamp(0.5rem, 2vh,   2.5rem) !important; }
    main section .mt-4  { margin-top:    clamp(0.3rem, 1vh,   1rem) !important; }

    /* SERVICEサークル（svc-circleクラスはPHP側で付与済み） */
    .svc-circle > div { font-size: clamp(12px, 1.4vw, 22px) !important; }

    /* VEHICLE矢印位置 */
    .vehicle-prev, .vehicle-next {
        top: clamp(70px, 15vh, 210px) !important;
    }

    /* ─── モバイル専用スタイル ─────────────────────────────────────── */
    @media (max-width: 1023px) {
        section:not(#hero) {
            height: 1000px !important;
            min-height: unset !important;
        }
        #workflow .flex.justify-between {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
        }
        #workflow .flex.justify-between > p {
            text-align: left !important;
            padding-left: 5rem !important;
        }
        #service .grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
        }
        #service .grid .bg-\[#4a9db5\] { padding: 6px 8px !important; }
        #service .grid h4 { font-size: 0.65rem !important; }
        #service .grid p  { font-size: 0.55rem !important; }

        /* PC版の葉画像を非表示にして pseudo-element でタイリング */
        img[src*="plant-"] { display: none !important; }

        section:not(#hero)::before,
        section:not(#hero)::after {
            content: '';
            position: absolute;
            top: 0;
            width: 28vw;
            height: 100%;
            background-size: 28vw auto;
            background-repeat: repeat-y;
            z-index: 10;
            pointer-events: none;
            opacity: 0.95;
        }
        section:not(#hero)::before { left: 0; }
        section:not(#hero)::after  { right: 0; transform: scaleX(-1); }

        /* 奇数セクション（MISSION / WORKFLOW / CASE）: bottom-left を下から積む */
        #mission::before, #workflow::before, #case::before,
        #mission::after,  #workflow::after,  #case::after {
            background-image: url('<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.svg');
            background-position: left bottom;
        }
        /* 偶数セクション（SERVICE / VEHICLES / COMPANY）: top-left を上から積む */
        #service::before, #vehicles::before, #company::before,
        #service::after,  #vehicles::after,  #company::after {
            background-image: url('<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.svg');
            background-position: left top;
        }
    }

</style>

<?php get_footer(); ?>