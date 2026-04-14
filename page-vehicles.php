<?php
/**
 * Template Name: 車両一覧
 */
get_header();
?>

<main class="relative w-full bg-white overflow-hidden">

    <!-- セクション1: container1.png -->
    <section style="position:relative;width:100%;display:flex;align-items:center;justify-content:center;padding:60px 40px;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="absolute top-0 bottom-0 left-0 w-32 md:w-56 lg:w-[280px] xl:w-[360px] h-full pointer-events-none" style="z-index:10;object-fit:cover;opacity:0.5;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="absolute top-0 bottom-0 right-0 w-32 md:w-56 lg:w-[280px] xl:w-[360px] h-full pointer-events-none" style="z-index:10;object-fit:cover;opacity:0.5;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/container1.png" alt="車両ラインナップ 1" style="position:relative;z-index:20;width:100%;max-width:1000px;height:auto;display:block;">
    </section>

    <!-- セクション2: container2.png -->
    <section style="position:relative;width:100%;display:flex;align-items:center;justify-content:center;padding:60px 40px;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="absolute top-0 bottom-0 left-0 w-32 md:w-56 lg:w-[280px] xl:w-[360px] h-full pointer-events-none" style="z-index:10;object-fit:cover;opacity:0.5;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" class="absolute top-0 bottom-0 right-0 w-32 md:w-56 lg:w-[280px] xl:w-[360px] h-full pointer-events-none" style="z-index:10;object-fit:cover;opacity:0.5;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/container2.png" alt="車両ラインナップ 2" style="position:relative;z-index:20;width:100%;max-width:1000px;height:auto;display:block;">
    </section>

</main>

<?php get_footer(); ?>
