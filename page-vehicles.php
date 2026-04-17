<?php
/**
 * Template Name: 車両一覧
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

<main class="relative w-full bg-white overflow-hidden">

    <!-- セクション1: container1.png -->
    <section style="position:relative;width:100%;display:flex;align-items:center;justify-content:center;padding:60px 40px;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="absolute bottom-0 left-0 h-full w-auto pointer-events-none detail-leaf" style="z-index:10;opacity:0.5;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="absolute bottom-0 right-0 h-full w-auto pointer-events-none detail-leaf detail-leaf-right" style="z-index:10;opacity:0.5;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/container1.png" alt="車両ラインナップ 1" style="position:relative;z-index:20;width:100%;max-width:1000px;height:auto;display:block;">
    </section>

    <!-- セクション2: container2.png -->
    <section style="position:relative;width:100%;display:flex;align-items:center;justify-content:center;padding:60px 40px;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="absolute top-0 left-0 h-full w-auto pointer-events-none detail-leaf" style="z-index:10;opacity:0.5;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" class="absolute top-0 right-0 h-full w-auto pointer-events-none detail-leaf detail-leaf-right" style="z-index:10;opacity:0.5;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/container2.png" alt="車両ラインナップ 2" style="position:relative;z-index:20;width:100%;max-width:1000px;height:auto;display:block;">
    </section>

</main>

<?php get_footer(); ?>
