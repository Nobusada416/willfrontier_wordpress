/**
 * Will Frontier - Animation
 * Lenis (inertia scroll) + GSAP + ScrollTrigger
 */

document.addEventListener('DOMContentLoaded', function () {

    // ─── 0. イントロアニメーション ────────────────────────────────────
    var overlay = document.getElementById('intro-overlay');
    var introLogo = document.getElementById('intro-logo');

    if (overlay && introLogo) {
        // スクロール禁止
        document.body.style.overflow = 'hidden';

        var tl = gsap.timeline();

        // ロゴをじんわり表示
        tl.to(introLogo, {
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
        });

        // 1秒間静止してからオーバーレイをフェードアウト
        tl.to(overlay, {
            opacity: 0,
            duration: 0.8,
            delay: 1.0,
            ease: 'power2.inOut',
            onComplete: function () {
                overlay.style.display = 'none';
                document.body.style.overflow = '';

                // ヘッダー（ロゴ・メニューボタン）をフェードイン
                gsap.fromTo(
                    ['#header-logo', '#nav-open'],
                    { opacity: 0, y: -12 },
                    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1 }
                );

                // ヒーローコンテンツを子要素ごとにスタガーで浮かび上がらせる
                var heroContent = document.getElementById('hero-content');
                if (heroContent) {
                    gsap.set(heroContent, { opacity: 1 });
                    gsap.fromTo(
                        heroContent.children,
                        { opacity: 0, y: 40 },
                        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15, delay: 0.1 }
                    );
                }
            },
        });
    }

    // ─── 1. Lenis 慣性スクロール初期化 ───────────────────────────────
    const lenis = new Lenis({
        duration: 1.2,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smooth: true,
    });

    // GSAP ticker と Lenis を同期
    gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // ─── 2. ScrollTrigger 登録 ────────────────────────────────────────
    gsap.registerPlugin(ScrollTrigger);

    // Lenis スクロール位置を ScrollTrigger に伝える
    lenis.on('scroll', ScrollTrigger.update);

    // ─── 3. .js-fade-up : スクロールで下からフェードイン ─────────────
    gsap.utils.toArray('.js-fade-up').forEach(function (el) {
        gsap.fromTo(
            el,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                },
            }
        );
    });

    // ─── 4. .js-parallax : 背景画像のパララックス ────────────────────
    gsap.utils.toArray('.js-parallax').forEach(function (el) {
        gsap.fromTo(
            el,
            { y: '-8%' },
            {
                y: '8%',
                ease: 'none',
                scrollTrigger: {
                    trigger: el.closest('section') || el.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            }
        );
    });

    // ─── 5. お問い合わせページ : 見出し＋フィールドのページロードアニメーション ──
    var contactHeading = document.getElementById('contact-heading');
    if (contactHeading) {
        gsap.fromTo(contactHeading,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
        );
        gsap.fromTo('.contact-field',
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1, delay: 0.5 }
        );
    }

    // ─── 6. .js-leaf : セクション入場時に左右から飛び出す ───────────
    gsap.utils.toArray('.js-leaf').forEach(function (el) {
        var isRight = el.classList.contains('js-leaf-right');
        gsap.fromTo(
            el,
            { opacity: 0, x: isRight ? 120 : -120 },
            {
                opacity: 0.95,
                x: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: el.closest('section') || el.parentElement,
                    start: 'top 85%',
                    end: 'top 30%',
                    scrub: 1.2,
                },
            }
        );
    });

});
