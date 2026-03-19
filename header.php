<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class( 'antialiased text-gray-800 bg-white font-sans' ); ?>>
    <?php wp_body_open(); ?>

    <!-- メニューパネル（画面右上から展開・角丸） -->
    <div id="nav-overlay" style="position:fixed;top:0;right:0;z-index:99998;width:min(620px,95vw);height:100vh;background:rgba(245,158,11,0.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:0 0 0 32px;display:flex;flex-direction:column;padding:120px 56px 52px;opacity:0;transform:translateY(-16px);pointer-events:none;box-shadow:0 12px 48px rgba(0,0,0,0.2);overflow-y:auto;">

        <!-- 閉じるボタン -->
        <button id="nav-close" aria-label="メニューを閉じる" style="position:absolute;top:48px;right:32px;width:40px;height:40px;background:rgba(255,255,255,0.25);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <line x1="2" y1="2" x2="16" y2="16" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
                <line x1="16" y1="2" x2="2" y2="16" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
            </svg>
        </button>

        <!-- ナビ項目 -->
        <nav>
            <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:36px;">
                <li class="nav-item" style="display:flex;align-items:center;gap:16px;opacity:0;transform:translateX(-20px);">
                    <span style="color:#fff;font-size:14px;">&#9658;</span>
                    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" style="color:#fff;font-size:2.4rem;font-weight:900;letter-spacing:.1em;text-decoration:none;">トップページ</a>
                </li>
                <li class="nav-item" style="display:flex;align-items:center;gap:16px;opacity:0;transform:translateX(-20px);">
                    <span style="color:#fff;font-size:14px;">&#9658;</span>
                    <a href="#mission" style="color:#fff;font-size:2.4rem;font-weight:900;letter-spacing:.1em;text-decoration:none;">MISSION</a>
                </li>
                <li class="nav-item" style="display:flex;align-items:center;gap:16px;opacity:0;transform:translateX(-20px);">
                    <span style="color:#fff;font-size:14px;">&#9658;</span>
                    <a href="#service" style="color:#fff;font-size:2.4rem;font-weight:900;letter-spacing:.1em;text-decoration:none;">SERVICE</a>
                </li>
                <li class="nav-item" style="display:flex;align-items:center;gap:16px;opacity:0;transform:translateX(-20px);">
                    <span style="color:#fff;font-size:14px;">&#9658;</span>
                    <a href="#workflow" style="color:#fff;font-size:2.4rem;font-weight:900;letter-spacing:.1em;text-decoration:none;">WORKFLOW</a>
                </li>
                <li class="nav-item" style="display:flex;align-items:center;gap:16px;opacity:0;transform:translateX(-20px);">
                    <span style="color:#fff;font-size:14px;">&#9658;</span>
                    <a href="#vehicles" style="color:#fff;font-size:2.4rem;font-weight:900;letter-spacing:.1em;text-decoration:none;">VEHICLES</a>
                </li>
                <li class="nav-item" style="display:flex;align-items:center;gap:16px;opacity:0;transform:translateX(-20px);">
                    <span style="color:#fff;font-size:14px;">&#9658;</span>
                    <a href="#company" style="color:#fff;font-size:2.4rem;font-weight:900;letter-spacing:.1em;text-decoration:none;">COMPANY</a>
                </li>
                <li class="nav-item" style="display:flex;align-items:center;gap:16px;opacity:0;transform:translateX(-20px);margin-top:14px;padding-top:28px;border-top:1px solid rgba(255,255,255,0.4);">
                    <span style="color:#fff;font-size:14px;">&#9658;</span>
                    <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" style="color:#fff;font-size:2.4rem;font-weight:900;letter-spacing:.1em;text-decoration:none;">お問い合わせ</a>
                </li>
            </ul>
        </nav>
    </div>

    <header class="w-full pt-16 pb-4 px-8 md:px-12 flex justify-between items-center z-[99997] absolute top-0 left-0 right-0" style="background:transparent;">

        <h1 id="header-logo" class="flex-shrink-0" style="opacity:0;">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="block transition hover:opacity-80">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logocolor.svg" alt="ウィルフロンティア" class="h-12 w-auto object-contain drop-shadow-md">
            </a>
        </h1>

        <!-- メニューボタン -->
        <button id="nav-open" aria-label="メニューを開く" style="opacity:0;width:120px;height:60px;border-radius:30px;border:2px solid #F59E0B;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-direction:column;gap:5px;flex-shrink:0;padding:0 18px;">
            <svg width="44" height="14" viewBox="0 0 44 14" fill="none">
                <line x1="0" y1="1"  x2="44" y2="1"  stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                <line x1="6" y1="7"  x2="38" y2="7"  stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                <line x1="0" y1="13" x2="44" y2="13" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span style="font-family:Georgia,serif;font-size:11px;color:#F59E0B;font-style:italic;font-weight:700;letter-spacing:.12em;line-height:1;">menu</span>
        </button>

    </header>

    <script>
    (function () {
        var panel    = document.getElementById('nav-overlay');
        var openBtn  = document.getElementById('nav-open');
        var closeBtn = document.getElementById('nav-close');
        var navItems = panel ? panel.querySelectorAll('.nav-item') : [];
        var navLinks = panel ? panel.querySelectorAll('a') : [];
        var isOpen   = false;

        function openMenu() {
            if (isOpen) return;
            isOpen = true;
            panel.style.pointerEvents = 'auto';

            if (typeof gsap !== 'undefined') {
                gsap.to(panel, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
                gsap.fromTo(navItems,
                    { opacity: 0, x: -20 },
                    { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06, delay: 0.15 }
                );
            } else {
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
                navItems.forEach(function(el) { el.style.opacity = '1'; el.style.transform = 'none'; });
            }
        }

        function closeMenu() {
            if (!isOpen) return;
            isOpen = false;

            if (typeof gsap !== 'undefined') {
                gsap.to(navItems, { opacity: 0, x: -16, duration: 0.2, ease: 'power2.in', stagger: 0.04 });
                gsap.to(panel, {
                    opacity: 0, y: -12, duration: 0.3, delay: 0.1, ease: 'power2.in',
                    onComplete: function () { panel.style.pointerEvents = 'none'; }
                });
            } else {
                panel.style.opacity = '0';
                panel.style.transform = 'translateY(-12px)';
                panel.style.pointerEvents = 'none';
            }
        }

        if (openBtn)  openBtn.addEventListener('click', openMenu);
        if (closeBtn) closeBtn.addEventListener('click', closeMenu);

        navLinks.forEach(function(link) {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeMenu();
        });

        // パネル外タップで閉じる
        document.addEventListener('click', function(e) {
            if (isOpen && !panel.contains(e.target) && e.target !== openBtn && !openBtn.contains(e.target)) {
                closeMenu();
            }
        });
    })();
    </script>
