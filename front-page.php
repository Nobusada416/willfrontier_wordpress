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
            <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="inline-flex items-center gap-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-lg md:text-xl tracking-widest px-10 py-4 transition-colors duration-300 shadow-lg">
                <span class="text-2xl font-black leading-none">&gt;</span> CONTACT
            </a>
        </div>
    </section>

    <section id="mission" class="relative w-full py-24 min-h-[1180px] bg-white flex flex-col justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
            <img src="<?php echo get_template_directory_uri(); ?>/assets/images/warter.jpg" alt="背景" class="w-full h-full object-cover opacity-40">
        </div>

        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="absolute top-0 -bottom-16 left-0 w-40 md:w-72 lg:w-[350px] xl:w-[450px] h-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="absolute top-0 -bottom-16 right-0 w-40 md:w-72 lg:w-[350px] xl:w-[450px] h-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">

        <div class="relative z-30 max-w-6xl mx-auto px-12 md:px-20 lg:px-32">
            <div class="mb-12">
                <h3 class="text-6xl md:text-7xl font-black text-gray-800 tracking-wider mb-4 js-heading-up">MISSION</h3>
                <div class="w-full h-[3px] bg-[#F59E0B]"></div>
            </div>

            <div class="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                <div class="w-full md:w-1/3 flex justify-center flex-shrink-0 js-fade-up">
                    <img src="<?php echo get_template_directory_uri(); ?>/assets/images/circle.svg" alt="循環サイクル" class="w-full max-w-[380px] h-auto object-contain">
                </div>
                <div class="w-full md:w-2/3">
                    <p class="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-relaxed tracking-wider js-fade-up">
                        都市の代謝を支え、未来のインフラを構築する。
                    </p>
                    <p class="text-base md:text-lg text-gray-700 leading-[2.2] font-medium tracking-wide js-fade-up">
                        私たちは、最先端のテクノロジーと長年培ったノウハウを融合させ、<br class="hidden xl:block">
                        持続可能な都市環境の実現に貢献します。<br>
                        廃棄物を単なるゴミではなく、新たな資源として捉え直し、<br class="hidden xl:block">
                        循環型社会の構築を目指します。
                    </p>
                </div>
            </div>
        </div>
    </section>

    <section id="service" class="relative w-full py-24 min-h-[1180px] bg-white flex flex-col justify-center overflow-hidden">

        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="absolute top-0 -bottom-16 left-0 w-40 md:w-72 lg:w-[350px] xl:w-[450px] h-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" class="absolute top-0 -bottom-16 right-0 w-40 md:w-72 lg:w-[350px] xl:w-[450px] h-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">

        <div class="relative z-30 max-w-6xl mx-auto px-12 md:px-20 lg:px-24">
            <div class="text-center mb-16">
                <h3 class="text-6xl md:text-7xl font-black text-gray-700 tracking-wider js-heading-up">SERVICE</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <div class="bg-white group cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col js-fade-up">
                    <div class="w-full aspect-square relative bg-gray-200 overflow-hidden">
                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/collection.jpg" alt="COLLECTION" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="bg-[#F59E0B] p-6 text-white mt-auto z-10 relative">
                        <h4 class="text-2xl font-black tracking-wider mb-1 leading-none">COLLECTION</h4>
                        <p class="text-sm font-bold tracking-widest">産業廃棄物の収集</p>
                    </div>
                </div>
                <div class="bg-white group cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col js-fade-up">
                    <div class="w-full aspect-square relative bg-gray-200 overflow-hidden">
                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/transporte.jpg" alt="TRANSPORT" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="bg-[#F59E0B] p-6 text-white mt-auto z-10 relative">
                        <h4 class="text-2xl font-black tracking-wider mb-1 leading-none">TRANSPORT</h4>
                        <p class="text-sm font-bold tracking-widest">安全な運搬システム</p>
                    </div>
                </div>
                <div class="bg-white group cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col js-fade-up">
                    <div class="w-full aspect-square relative bg-gray-200 overflow-hidden">
                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/選別ライン-イラスト風.jpg" alt="PROCESSING" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="bg-[#F59E0B] p-6 text-white mt-auto z-10 relative">
                        <h4 class="text-2xl font-black tracking-wider mb-1 leading-none">PROCESSING</h4>
                        <p class="text-sm font-bold tracking-widest">最適な処理技術</p>
                    </div>
                </div>
                <div class="bg-white group cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col js-fade-up">
                    <div class="w-full aspect-square relative bg-gray-200 overflow-hidden">
                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/recycling.jpg" alt="RECYCLING" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="bg-[#F59E0B] p-6 text-white mt-auto z-10 relative">
                        <h4 class="text-2xl font-black tracking-wider mb-1 leading-none">RECYCLING</h4>
                        <p class="text-sm font-bold tracking-widest">資源の再生利用</p>
                    </div>
                </div>
                <div class="bg-white group cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col js-fade-up">
                    <div class="w-full aspect-square relative bg-gray-200 overflow-hidden">
                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/consulting.jpg" alt="CONSULTING" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="bg-[#F59E0B] p-6 text-white mt-auto z-10 relative">
                        <h4 class="text-2xl font-black tracking-wider mb-1 leading-none">CONSULTING</h4>
                        <p class="text-sm font-bold tracking-widest">廃棄物管理コンサルティング</p>
                    </div>
                </div>
                <div class="bg-white group cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col js-fade-up">
                    <div class="w-full aspect-square relative bg-gray-200 overflow-hidden">
                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/monitoring.jpg" alt="MONITORING" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    </div>
                    <div class="bg-[#F59E0B] p-6 text-white mt-auto z-10 relative">
                        <h4 class="text-2xl font-black tracking-wider mb-1 leading-none">MONITORING</h4>
                        <p class="text-sm font-bold tracking-widest">リアルタイム管理システム</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="workflow" class="relative w-full py-24 min-h-[1180px] bg-white flex flex-col justify-center overflow-hidden">

        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="absolute top-0 -bottom-16 left-0 w-40 md:w-72 lg:w-[350px] xl:w-[450px] h-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="absolute top-0 -bottom-16 right-0 w-40 md:w-72 lg:w-[350px] xl:w-[450px] h-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">

        <div class="relative z-30 max-w-4xl mx-auto px-12 md:px-20 lg:px-24 w-full">
            <div class="text-center mb-16">
                <h3 class="text-6xl md:text-7xl font-black text-gray-700 tracking-wider js-heading-up">WORKFLOW</h3>
            </div>
            <div class="border-t border-[#F59E0B]">
                <div class="flex items-center justify-between py-8 md:py-10 border-b border-[#F59E0B] group hover:bg-gray-50 transition-colors duration-300 px-4 -mx-4 rounded-sm js-fade-up">
                    <div class="flex items-center gap-8 md:gap-14">
                        <span class="text-4xl md:text-5xl font-black text-[#F59E0B]">01</span>
                        <div>
                            <h4 class="text-2xl md:text-3xl font-black text-gray-700 tracking-wider leading-tight">受付・計量</h4>
                            <p class="text-xs font-bold text-gray-400 tracking-widest mt-0.5">ACCEPTANCE</p>
                        </div>
                    </div>
                    <p class="text-sm md:text-base font-bold text-gray-600 tracking-widest text-right">適正な受け入れと<br class="hidden md:block">マニフェスト管理</p>
                </div>
                <div class="flex items-center justify-between py-8 md:py-10 border-b border-[#F59E0B] group hover:bg-gray-50 transition-colors duration-300 px-4 -mx-4 rounded-sm js-fade-up">
                    <div class="flex items-center gap-8 md:gap-14">
                        <span class="text-4xl md:text-5xl font-black text-[#F59E0B]">02</span>
                        <div>
                            <h4 class="text-2xl md:text-3xl font-black text-gray-700 tracking-wider leading-tight">展開検査・荷卸し</h4>
                            <p class="text-xs font-bold text-gray-400 tracking-widest mt-0.5">INSPECTION</p>
                        </div>
                    </div>
                    <p class="text-sm md:text-base font-bold text-gray-600 tracking-widest text-right">目視による厳格な<br class="hidden md:block">品目チェック</p>
                </div>
                <div class="flex items-center justify-between py-8 md:py-10 border-b border-[#F59E0B] group hover:bg-gray-50 transition-colors duration-300 px-4 -mx-4 rounded-sm js-fade-up">
                    <div class="flex items-center gap-8 md:gap-14">
                        <span class="text-4xl md:text-5xl font-black text-[#F59E0B]">03</span>
                        <div>
                            <h4 class="text-2xl md:text-3xl font-black text-gray-700 tracking-wider leading-tight">分別・選別</h4>
                            <p class="text-xs font-bold text-gray-400 tracking-widest mt-0.5">SORTING</p>
                        </div>
                    </div>
                    <p class="text-sm md:text-base font-bold text-gray-600 tracking-widest text-right">手作業と機械による<br class="hidden md:block">高精度な仕分け</p>
                </div>
                <div class="flex items-center justify-between py-8 md:py-10 border-b border-[#F59E0B] group hover:bg-gray-50 transition-colors duration-300 px-4 -mx-4 rounded-sm js-fade-up">
                    <div class="flex items-center gap-8 md:gap-14">
                        <span class="text-4xl md:text-5xl font-black text-[#F59E0B]">04</span>
                        <div>
                            <h4 class="text-2xl md:text-3xl font-black text-gray-700 tracking-wider leading-tight">破砕・圧縮加工</h4>
                            <p class="text-xs font-bold text-gray-400 tracking-widest mt-0.5">PROCESSING</p>
                        </div>
                    </div>
                    <p class="text-sm md:text-base font-bold text-gray-600 tracking-widest text-right">再資源化・減容化の<br class="hidden md:block">ための二次処理</p>
                </div>
                <div class="flex items-center justify-between py-8 md:py-10 border-b border-[#F59E0B] group hover:bg-gray-50 transition-colors duration-300 px-4 -mx-4 rounded-sm js-fade-up">
                    <div class="flex items-center gap-8 md:gap-14">
                        <span class="text-4xl md:text-5xl font-black text-[#F59E0B]">05</span>
                        <div>
                            <h4 class="text-2xl md:text-3xl font-black text-gray-700 tracking-wider leading-tight">出荷・最終処分</h4>
                            <p class="text-xs font-bold text-gray-400 tracking-widest mt-0.5">SHIPPING</p>
                        </div>
                    </div>
                    <p class="text-sm md:text-base font-bold text-gray-600 tracking-widest text-right">リサイクル製品の供給と<br class="hidden md:block">適正な最終委託</p>
                </div>
            </div>
        </div>
    </section>

    <section id="vehicles" class="relative w-full py-24 min-h-[1180px] bg-white flex flex-col items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
            <img src="<?php echo get_template_directory_uri(); ?>/assets/images/車両-イラスト風.jpg" alt="背景" class="w-full h-full object-cover opacity-10">
        </div>

        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="absolute top-0 -bottom-16 left-0 w-40 md:w-72 lg:w-[350px] xl:w-[450px] h-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" class="absolute top-0 -bottom-16 right-0 w-40 md:w-72 lg:w-[350px] xl:w-[450px] h-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">

        <div class="relative z-30 w-full max-w-6xl mx-auto px-12 md:px-20 lg:px-24 text-center">
            <h3 class="text-6xl md:text-7xl font-black text-gray-700 tracking-wider mb-12 js-heading-up">VEHICLE LINEUP</h3>

            <div class="flex items-center gap-4 md:gap-8 w-full">
                <button class="vehicle-prev flex-shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center z-10">
                    <svg viewBox="0 0 24 24" class="w-10 h-10 md:w-12 md:h-12" fill="#F59E0B"><path d="M16.5 3c-.5 0-1 .2-1.4.6l-9 8c-.8.7-.8 2 0 2.8l9 8c.8.7 2.1.4 2.6-.4.2-.3.3-.7.3-1V5c0-1.1-.9-2-2-2z"/></svg>
                </button>

                <div class="flex-1 min-w-0">
                    <div class="swiper vehicleSwiper pb-12 w-full">
                        <div class="swiper-wrapper mb-8">
                            <div class="swiper-slide w-full flex flex-col items-center justify-center">
                                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/truck.jpg" alt="ARM ROLL" class="block w-full h-[360px] md:h-[520px] object-contain mx-auto mb-8 drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)]">
                                <p class="text-gray-800 font-bold text-2xl md:text-3xl tracking-wider text-center w-full">
                                    ARM ROLL <span class="text-base md:text-lg text-gray-600 ml-3 font-medium tracking-widest">4t アームロール車</span>
                                </p>
                            </div>
                            <div class="swiper-slide w-full flex flex-col items-center justify-center">
                                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/truck.jpg" alt="DUMP TRUCK" class="block w-full h-[360px] md:h-[520px] object-contain mx-auto mb-8 drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)]">
                                <p class="text-gray-800 font-bold text-2xl md:text-3xl tracking-wider text-center w-full">
                                    DUMP TRUCK <span class="text-base md:text-lg text-gray-600 ml-3 font-medium tracking-widest">ダンプトラック</span>
                                </p>
                            </div>
                            <div class="swiper-slide w-full flex flex-col items-center justify-center">
                                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/truck.jpg" alt="PACKER CAR" class="block w-full h-[360px] md:h-[520px] object-contain mx-auto mb-8 drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)]">
                                <p class="text-gray-800 font-bold text-2xl md:text-3xl tracking-wider text-center w-full">
                                    PACKER CAR <span class="text-base md:text-lg text-gray-600 ml-3 font-medium tracking-widest">パッカー車</span>
                                </p>
                            </div>
                        </div>
                        <div class="swiper-pagination"></div>
                    </div>
                </div>

                <button class="vehicle-next flex-shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center z-10">
                    <svg viewBox="0 0 24 24" class="w-10 h-10 md:w-12 md:h-12 scale-x-[-1]" fill="#F59E0B"><path d="M16.5 3c-.5 0-1 .2-1.4.6l-9 8c-.8.7-.8 2 0 2.8l9 8c.8.7 2.1.4 2.6-.4.2-.3.3-.7.3-1V5c0-1.1-.9-2-2-2z"/></svg>
                </button>
            </div>
        </div>
    </section>

    <section id="safety" class="relative w-full py-16 min-h-[1180px] bg-white flex flex-col items-center justify-center overflow-hidden">

        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="absolute top-0 -bottom-16 left-0 w-40 md:w-72 lg:w-[350px] xl:w-[450px] h-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="absolute top-0 -bottom-16 right-0 w-40 md:w-72 lg:w-[350px] xl:w-[450px] h-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">

        <div class="relative z-30 w-full max-w-6xl mx-auto px-12 md:px-20 lg:px-24">
            <div class="text-center mb-16">
                <h3 class="text-6xl md:text-7xl font-black text-gray-700 tracking-wider js-heading-up">SAFETY</h3>
                <p class="text-base font-bold text-gray-500 tracking-widest mt-3 js-fade-up">安全・衛生管理</p>
            </div>

            <p class="text-base md:text-lg text-gray-700 leading-[2.2] font-medium tracking-wide text-center mb-16 js-fade-up">
                弊社では安全面・衛生面を考え、定期的な講習及び作業効率上昇のため、<br class="hidden lg:block">
                重機の追加など現場の意見を取り入れながら、<br class="hidden lg:block">
                従業員・お客様にスムーズかつ安全に過ごしていただけるよう努力しております。
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="border border-[#F59E0B] p-8 md:p-10 js-fade-up">
                    <div class="flex items-center gap-4 mb-4">
                        <span class="w-2 h-8 bg-[#F59E0B] block flex-shrink-0"></span>
                        <h4 class="text-xl md:text-2xl font-black text-gray-700 tracking-wider">重機の点検方法の講習</h4>
                    </div>
                    <p class="text-sm md:text-base text-gray-600 leading-relaxed tracking-wide font-medium">
                        定期的な重機点検講習を実施し、機械の安全な操作方法と日常点検の手順を全従業員が習得。現場での事故ゼロを目指した取り組みを継続しています。
                    </p>
                </div>
                <div class="border border-[#F59E0B] p-8 md:p-10 js-fade-up">
                    <div class="flex items-center gap-4 mb-4">
                        <span class="w-2 h-8 bg-[#F59E0B] block flex-shrink-0"></span>
                        <h4 class="text-xl md:text-2xl font-black text-gray-700 tracking-wider">危険予知トレーニング</h4>
                    </div>
                    <p class="text-sm md:text-base text-gray-600 leading-relaxed tracking-wide font-medium">
                        KYT（危険予知トレーニング）を定期的に実施し、現場に潜む危険を事前に察知・回避する能力を育成。従業員全員の安全意識の向上を図っています。
                    </p>
                </div>
            </div>
        </div>
    </section>

    <section id="company" class="relative w-full py-16 min-h-[1180px] bg-white flex flex-col items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
            <img src="<?php echo get_template_directory_uri(); ?>/assets/images/横浜全景-イラスト風.jpg" alt="背景" class="w-full h-full object-cover opacity-10">
        </div>

        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="absolute top-0 -bottom-16 left-0 w-40 md:w-72 lg:w-[350px] xl:w-[450px] h-auto z-40 pointer-events-none opacity-95 js-leaf">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" class="absolute top-0 -bottom-16 right-0 w-40 md:w-72 lg:w-[350px] xl:w-[450px] h-auto z-40 pointer-events-none opacity-95 js-leaf js-leaf-right">

        <div class="relative z-30 w-full max-w-4xl mx-auto px-12 md:px-20 lg:px-24">
            <h3 class="text-4xl md:text-5xl lg:text-6xl font-black text-gray-700 tracking-wider mb-16 text-center js-heading-up">COMPANY</h3>
            
            <div class="border-t border-[#F59E0B]">
                <dl class="flex flex-col md:flex-row py-6 md:py-8 border-b border-dashed border-[#F59E0B] items-start js-fade-up">
                    <dt class="text-[#F59E0B] font-bold tracking-widest w-full md:w-64 mb-3 md:mb-0 shrink-0 mt-1">COMPANY NAME</dt>
                    <dd class="text-gray-700 font-bold tracking-widest flex-1 text-sm md:text-base">株式会社 ウィルフロンティア</dd>
                </dl>
                <dl class="flex flex-col md:flex-row py-6 md:py-8 border-b border-dashed border-[#F59E0B] items-start js-fade-up">
                    <dt class="text-[#F59E0B] font-bold tracking-widest w-full md:w-64 mb-3 md:mb-0 shrink-0 mt-1">REPRESENTATIVE</dt>
                    <dd class="text-gray-700 font-bold tracking-widest flex-1 text-sm md:text-base">代表取締役　岩井 和也</dd>
                </dl>
                <dl class="flex flex-col md:flex-row py-6 md:py-8 border-b border-dashed border-[#F59E0B] items-start">
                    <dt class="text-[#F59E0B] font-bold tracking-widest w-full md:w-64 mb-3 md:mb-0 shrink-0 mt-1">ADDRESS</dt>
                    <dd class="text-gray-700 font-bold tracking-widest flex-1 space-y-8 text-sm md:text-base leading-relaxed">
                        <div>
                            <span class="inline-block bg-[#F59E0B] text-white text-xs font-bold px-4 py-1.5 mb-3 tracking-widest">本社（積み替え保管）</span>
                            <p>
                                〒241-0003 神奈川県横浜市旭区白根町 895 番地<br>
                                TEL 045-959-3225　FAX 045-959-3226<br>
                                MAIL　eco-will@kvj.biglobe.ne.jp
                            </p>
                        </div>
                        <div>
                            <span class="inline-block bg-[#F59E0B] text-white text-xs font-bold px-4 py-1.5 mb-3 tracking-widest">WF-A.BASE（中間処理場）</span>
                            <p>
                                〒243-0807 神奈川県厚木市金田 1107<br>
                                TEL 046-205-4177　FAX 046-205-4178
                            </p>
                        </div>
                        <div>
                            <span class="inline-block bg-[#F59E0B] text-white text-xs font-bold px-4 py-1.5 mb-3 tracking-widest">HUCOM（積み替え保管）</span>
                            <p>
                                〒341-0055 埼玉県三郷市上口 2-75-1<br>
                                TEL 048-969-4811　FAX 048-969-4812
                            </p>
                        </div>
                    </dd>
                </dl>
                <dl class="flex flex-col md:flex-row py-6 md:py-8 border-b border-dashed border-[#F59E0B] items-start">
                    <dt class="text-[#F59E0B] font-bold tracking-widest w-full md:w-64 mb-3 md:mb-0 shrink-0 mt-1">ESTABLISHED</dt>
                    <dd class="text-gray-700 font-bold tracking-widest flex-1 text-sm md:text-base">平成 25 年 10 月 25 日</dd>
                </dl>
                <dl class="flex flex-col md:flex-row py-6 md:py-8 border-b border-dashed border-[#F59E0B] items-start">
                    <dt class="text-[#F59E0B] font-bold tracking-widest w-full md:w-64 mb-3 md:mb-0 shrink-0 mt-1">CAPITAL</dt>
                    <dd class="text-gray-700 font-bold tracking-widest flex-1 text-sm md:text-base">1,000 万円</dd>
                </dl>
                <dl class="flex flex-col md:flex-row py-6 md:py-8 border-b border-dashed border-[#F59E0B] items-start">
                    <dt class="text-[#F59E0B] font-bold tracking-widest w-full md:w-64 mb-3 md:mb-0 shrink-0 mt-1">BUSINESS</dt>
                    <dd class="text-gray-700 font-bold tracking-widest flex-1 text-sm md:text-base">産業廃棄物収集運搬業 / リサイクル事業 / コンサルティング</dd>
                </dl>
            </div>
        </div>
    </section>

</main>

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

    .swiper-pagination-bullet { background-color: transparent !important; border: 2px solid #F59E0B !important; opacity: 1 !important; width: 14px !important; height: 14px !important; margin: 0 8px !important; }
    .swiper-pagination-bullet-active { background-color: #F59E0B !important; }
    .swiper-pagination { position: relative !important; bottom: 0 !important; margin-top: 20px; }
    .vehicleSwiper .swiper-slide { overflow: visible; }
    .aspect-square { aspect-ratio: 1 / 1; }

    /* js-fade-up / js-leaf の初期状態 */
    .js-fade-up { opacity: 0; }
    .js-leaf { opacity: 0; }

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
        #service .grid .bg-\[#F59E0B\] { padding: 6px 8px !important; }
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