<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class( 'antialiased text-gray-800 bg-white font-sans' ); ?>>
    <?php wp_body_open(); ?>
    
    <header class="w-full bg-white py-3 px-8 md:px-12 flex justify-between items-center border-b border-gray-100 z-50 relative">
        
        <h1 class="flex-shrink-0">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="block transition hover:opacity-80">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logocolor.svg" alt="ウィルフロンティア" class="h-12 w-auto object-contain">
            </a>
        </h1>

        <nav class="hidden lg:flex flex-1 justify-center">
            <ul class="flex items-center space-x-8 xl:space-x-12 text-[15px] font-bold text-black tracking-wider">
                <li><a href="#service" class="hover:text-gray-400 transition-colors duration-300">SERVICE</a></li>
                <li><a href="#workflow" class="hover:text-gray-400 transition-colors duration-300">WORKFLOW</a></li>
                <li><a href="#vehicles" class="hover:text-gray-400 transition-colors duration-300">VEHICLES</a></li>
                <li><a href="#case" class="hover:text-gray-400 transition-colors duration-300">CASE</a></li>
                <li><a href="#company" class="hover:text-gray-400 transition-colors duration-300">COMPANY</a></li>
            </ul>
        </nav>

        <div class="hidden lg:block flex-shrink-0">
            <a href="#contact" class="flex items-center justify-center bg-[#F59E0B] text-white font-bold text-[15px] tracking-wider px-8 py-3.5 hover:bg-[#D97706] transition-colors duration-300">
                <span class="mr-2 text-lg leading-none font-normal">＞</span> CONTACT
            </a>
        </div>

        <button class="lg:hidden flex flex-col justify-center items-center w-10 h-10 space-y-2">
            <span class="block w-8 h-0.5 bg-black"></span>
            <span class="block w-8 h-0.5 bg-black"></span>
            <span class="block w-8 h-0.5 bg-black"></span>
        </button>

    </header>