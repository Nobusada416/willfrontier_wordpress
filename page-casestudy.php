<?php
/**
 * Template Name: ケーススタディ
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

<main class="relative w-full bg-white" style="margin:0;padding:0;flex:1;display:flex;flex-direction:column;overflow:hidden;">

    <section style="position:relative;width:100%;height:calc(100vh - 72px);box-sizing:border-box;overflow:hidden;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="detail-leaf" style="position:absolute;top:0;left:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:1;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="detail-leaf detail-leaf-right" style="position:absolute;bottom:0;right:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:1;">
    </section>

</main>

<?php get_footer(); ?>
