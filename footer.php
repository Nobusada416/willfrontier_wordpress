<footer class="w-full bg-white relative z-20">
        <div class="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-12">
            
            <div class="flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-0">
                
                <div class="flex-shrink-0">
                    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="block transition hover:opacity-80">
                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logocolor.svg" alt="ウィルフロンティア" class="h-10 md:h-12 w-auto object-contain">
                    </a>
                </div>

                <nav class="w-full lg:w-auto">
                    <ul class="flex flex-wrap justify-center lg:justify-end items-center gap-x-6 gap-y-4 xl:gap-x-10 text-[13px] md:text-[15px] font-bold text-gray-800 tracking-wider">
                        <li><a href="#service" class="hover:text-[#F59E0B] transition-colors duration-300">SERVICE</a></li>
                        <li><a href="#workflow" class="hover:text-[#F59E0B] transition-colors duration-300">WORKFLOW</a></li>
                        <li><a href="#vehicles" class="hover:text-[#F59E0B] transition-colors duration-300">VEHICLES</a></li>
                        <li><a href="#case" class="hover:text-[#F59E0B] transition-colors duration-300">CASE</a></li>
                        <li><a href="#company" class="hover:text-[#F59E0B] transition-colors duration-300">COMPANY</a></li>
                        <li class="mt-2 lg:mt-0 lg:ml-4">
                            <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="inline-flex items-center justify-center bg-[#F59E0B] text-white font-bold tracking-wider px-6 py-2.5 hover:bg-[#D97706] transition-colors duration-300">
                                <span class="mr-2 text-lg leading-none font-normal">＞</span> CONTACT
                            </a>
                        </li>
                    </ul>
                </nav>
                
            </div>
            
        </div>
    </footer>

    <?php wp_footer(); ?>
</body>
</html>