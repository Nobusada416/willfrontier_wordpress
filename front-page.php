<?php get_header(); ?>

<!-- イントロオーバーレイ -->
<div id="intro-overlay" style="position:fixed;inset:0;z-index:99999;background:rgba(245,158,11,0.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;pointer-events:none;">
    <img id="intro-logo" src="<?php echo get_template_directory_uri(); ?>/assets/images/logocolor.svg" alt="Will Frontier" style="width:320px;max-width:70vw;opacity:0;">
</div>

<main class="relative w-full overflow-x-hidden bg-white">

    <section id="hero" class="relative w-full h-screen min-h-[700px] flex items-center justify-center bg-sky-300">
        <div class="absolute inset-0 z-0">
            <img src="<?php echo get_template_directory_uri(); ?>/assets/images/hero-bg.jpg" alt="ウィルフロンティア" class="w-full h-full object-cover js-parallax">
        </div>
        <div class="absolute inset-0 z-0 bg-sky-200 opacity-20"></div>

        <div id="hero-content" class="relative z-10 text-center text-white px-6 flex flex-col items-center" style="opacity:0;">
            <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logowhite.svg" alt="willF" class="w-48 md:w-64 lg:w-80 mb-8 drop-shadow-lg">
            <h2 class="text-4xl md:text-5xl lg:text-6xl font-black tracking-widest mb-5 drop-shadow-lg leading-tight">
                都市インフラを支える、<br>産業廃棄物テック。
            </h2>
            <p class="text-base md:text-lg font-semibold tracking-widest drop-shadow-md mb-10">
                Sustainable Urban Infrastructure &amp; Technology
            </p>
            <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="inline-flex items-center gap-3 bg-[#4a9db5] hover:bg-[#3a85a0] text-white font-black text-lg md:text-xl tracking-widest px-10 py-4 transition-colors duration-300 shadow-lg rounded-full">
                <span class="text-4xl font-thin leading-none">&gt;</span> CONTACT
            </a>
        </div>
    </section>

    <section id="mission" class="relative w-full h-[calc(100vh-72px)] bg-white flex flex-col justify-center">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="absolute top-0 left-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="absolute bottom-0 right-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">
        <div class="absolute inset-0 z-0">
            <img src="<?php echo get_template_directory_uri(); ?>/assets/images/warter.jpg" alt="背景" class="w-full h-full object-cover opacity-40">
        </div>


        <div class="relative z-30 w-full text-center" style="padding: 0 8vw;">

            <h3 class="text-7xl md:text-8xl font-black text-gray-800 tracking-wider mb-12 js-heading-up">MISSION</h3>

            <!-- 環境の方程式 -->
            <div class="js-fade-up mb-4 inline-block relative">
                <p class="font-black text-[#4a9db5] tracking-wide leading-tight" style="font-size:clamp(1.2rem, 4vw, 3.8rem); white-space:nowrap;">
                    環境 = 地球 + Forest + 水 + Animal + 街 + 人
                </p>
                <p class="text-[#4a9db5] font-bold tracking-wide text-right" style="font-size:clamp(0.8rem, 1.6vw, 1.5rem);">を重要なテーマとして捉えています。</p>
            </div>

            <!-- PLUS スマイル宣言 -->
            <div class="js-fade-up mt-4 mb-8 flex flex-col items-center">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/+.svg" alt="plus" style="width:100px;height:100px;display:block;margin-left:2vw;">
                <p class="text-gray-800 tracking-wide leading-tight mt-3" style="font-size:clamp(1.2rem, 2.5vw, 2rem); white-space:nowrap; font-weight:700; margin-right:1vw;">スマイル宣言</p>
            </div>

            <!-- もっと見るボタン -->
            <div class="js-fade-up">
                <a href="<?php echo esc_url( home_url( '/mission/' ) ); ?>" style="background:#d4874a;border-radius:9999px;padding:14px 48px;display:inline-flex;align-items:center;gap:10px;color:#fff;font-weight:900;font-size:1.5rem;letter-spacing:.1em;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
                    もっと見る <span>▼</span>
                </a>
            </div>

        </div>
    </section>

    <section id="service" class="relative w-full h-[calc(100vh-72px)] bg-white flex flex-col justify-start pt-10">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="absolute bottom-0 left-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" class="absolute top-0 right-0 h-full w-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">


        <div class="relative z-30 w-full text-center" style="padding:0 8vw;">
            <h3 class="font-black text-gray-700 tracking-wider mb-16 js-heading-up" style="font-size:clamp(3rem,7vw,6rem);margin-top:20px;">SERVICE</h3>

            <!-- 5サークルレイアウト -->
            <?php
            // 共通スタイル
            $outer = 'width:210px;height:210px;border-radius:50%;background:#4a9db5;display:flex;align-items:center;justify-content:center;padding:16px;cursor:pointer;transition:transform 0.2s;flex-shrink:0;';
            $inner = 'width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,0.85);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:22px;line-height:1.3;text-align:center;padding:20px;';
            $outer_lg = 'width:210px;height:210px;border-radius:50%;background:#4a9db5;display:flex;align-items:center;justify-content:center;padding:16px;cursor:pointer;transition:transform 0.2s;flex-shrink:0;';
            $inner_lg = 'width:100%;height:100%;border-radius:50%;border:2px solid rgba(255,255,255,0.85);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:22px;line-height:1.3;text-align:center;padding:20px;';
            ?>
            <div class="relative js-fade-up" style="max-width:900px;margin:0 auto;margin-top:-100px;">

                <!-- 上段 2つ -->
                <div style="display:flex;justify-content:space-between;margin-bottom:-50px;">
                    <div style="<?php echo $outer; ?>" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="<?php echo $inner; ?>font-size:21px;white-space:nowrap;">自社の<br>処理施設を<br>（積替え・保管）<br>所有</div>
                    </div>
                    <div style="<?php echo $outer; ?>" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="<?php echo $inner; ?>display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;">
                                <span>自社<br>中間処理場</span>
                                <span style="display:inline-block;background:none;border:1.5px solid rgba(255,255,255,0.7);padding:6px 20px;font-size:16px;white-space:nowrap;">WF-A.BASE</span>
                            </div>
                    </div>
                </div>

                <!-- 中段 センター -->
                <div style="display:flex;justify-content:center;margin-bottom:-50px;">
                    <div style="<?php echo $outer_lg; ?>" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="<?php echo $inner_lg; ?>font-size:18px;flex-direction:column;gap:4px;"><span style="white-space:nowrap;">鉄・非鉄</span><span style="white-space:nowrap;">買い取ります。</span></div>
                    </div>
                </div>

                <!-- 下段 2つ -->
                <div style="display:flex;justify-content:space-between;">
                    <div style="<?php echo $outer; ?>" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <div style="<?php echo $inner; ?>white-space:nowrap;">どんな<br>産業廃棄物にも<br>対応</div>
                    </div>
                    <div style="<?php echo $outer; ?>" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
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
                    <div class="flex items-center py-7 border-b border-[#4a9db5] js-fade-up" style="gap:2rem;">
                        <span class="font-black text-[#4a9db5] flex-shrink-0" style="font-size:2.2rem;width:3.5rem;text-align:left;"><?php echo $s['num']; ?></span>
                        <h4 class="font-black text-gray-700 tracking-wider flex-shrink-0" style="font-size:2rem;text-align:left;min-width:220px;"><?php echo $s['en']; ?></h4>
                        <p class="text-gray-500 font-bold tracking-wider text-right flex-1" style="font-size:0.85rem;"><?php echo $s['ja']; ?></p>
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
                                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/truck.jpg" alt="ARM ROLL" style="width:100%;height:420px;object-fit:cover;display:block;">
                            </div>
                            <p class="font-black text-gray-800 tracking-wider mt-5" style="font-size:1.2rem;">
                                ARM ROLL <span style="font-size:0.9rem;color:#6b7280;font-weight:700;margin-left:8px;">4t アームロール車</span>
                            </p>
                        </div>
                        <div class="swiper-slide w-full flex flex-col items-center">
                            <div style="background:#fff;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);width:100%;">
                                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/truck.jpg" alt="DUMP TRUCK" style="width:100%;height:420px;object-fit:cover;display:block;">
                            </div>
                            <p class="font-black text-gray-800 tracking-wider mt-5" style="font-size:1.2rem;">
                                DUMP TRUCK <span style="font-size:0.9rem;color:#6b7280;font-weight:700;margin-left:8px;">ダンプトラック</span>
                            </p>
                        </div>
                        <div class="swiper-slide w-full flex flex-col items-center">
                            <div style="background:#fff;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);width:100%;">
                                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/truck.jpg" alt="PACKER CAR" style="width:100%;height:420px;object-fit:cover;display:block;">
                            </div>
                            <p class="font-black text-gray-800 tracking-wider mt-5" style="font-size:1.2rem;">
                                PACKER CAR <span style="font-size:0.9rem;color:#6b7280;font-weight:700;margin-left:8px;">パッカー車</span>
                            </p>
                        </div>
                    </div>
                    <div class="swiper-pagination"></div>
                </div>

                <!-- 矢印：画像の真横に絶対配置 -->
                <button class="vehicle-prev" style="position:absolute;top:210px;left:-56px;transform:translateY(-50%);background:none;border:none;cursor:pointer;z-index:10;">
                    <svg viewBox="0 0 24 24" style="width:44px;height:44px;" fill="#2d5c8a"><path d="M16.5 3c-.5 0-1 .2-1.4.6l-9 8c-.8.7-.8 2 0 2.8l9 8c.8.7 2.1.4 2.6-.4.2-.3.3-.7.3-1V5c0-1.1-.9-2-2-2z"/></svg>
                </button>
                <button class="vehicle-next" style="position:absolute;top:210px;right:-56px;transform:translateY(-50%);background:none;border:none;cursor:pointer;z-index:10;">
                    <svg viewBox="0 0 24 24" style="width:44px;height:44px;transform:scaleX(-1);" fill="#2d5c8a"><path d="M16.5 3c-.5 0-1 .2-1.4.6l-9 8c-.8.7-.8 2 0 2.8l9 8c.8.7 2.1.4 2.6-.4.2-.3.3-.7.3-1V5c0-1.1-.9-2-2-2z"/></svg>
                </button>
            </div>

            <div class="text-center mt-8 js-fade-up">
                <a href="<?php echo esc_url( home_url( '/vehicles/' ) ); ?>" style="background:#d4874a;border-radius:9999px;padding:16px 72px;display:inline-flex;align-items:center;gap:10px;color:#fff;font-weight:900;font-size:1.2rem;letter-spacing:.1em;text-decoration:none;transition:opacity 0.2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">もっと見る <span>▼</span></a>
            </div>
        </div>
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
            <div class="js-fade-up" style="position:relative;border:1.5px solid #c8d9e6;border-radius:4px;overflow:hidden;background:#fff;">
                <!-- 画像エリア（画像追加時は img タグに差し替え） -->
                <div style="width:100%;height:520px;background:#fff;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:1.2rem;font-weight:700;color:#9ab8c8;letter-spacing:.1em;">写真</span>
                </div>
                <!-- キャッチコピー（写真下部中央に重ねて表示） -->
                <div style="position:absolute;bottom:0;left:0;right:0;padding:32px 32px;text-align:center;">
                    <p style="font-size:2.4rem;font-weight:900;color:#4a9db5;letter-spacing:.06em;text-shadow:0 2px 8px rgba(0,0,0,0.3);">毎日の安全が、地域の安全をつくる。</p>
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

            <!-- 写真＋テキスト重ねボックス -->
            <div class="js-fade-up" style="position:relative;border:1.5px solid #000;border-radius:4px;overflow:hidden;background:#fff;">
                <!-- 画像エリア（画像追加時は img タグに差し替え） -->
                <div style="width:100%;height:240px;background:#fff;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:1.1rem;font-weight:700;color:#9ab8c8;letter-spacing:.1em;">写真</span>
                </div>
                <!-- キャッチコピー（写真に重ねて下部中央） -->
                <div style="position:absolute;bottom:0;left:0;right:0;padding:24px 32px;text-align:center;">
                    <p style="font-size:3rem;font-weight:900;color:#4a9db5;letter-spacing:.05em;">スマイル宣言はじめませんか？</p>
                </div>
            </div>

            <!-- スマイル宣言説明バー -->
            <div class="js-fade-up" style="background:#fef9e7;border:1px solid #f0d96a;border-top:none;padding:18px 20px;font-size:20px;font-weight:700;color:#2d5c8a;line-height:1.7;text-align:center;">
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