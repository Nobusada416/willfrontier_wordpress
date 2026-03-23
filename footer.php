<footer class="w-full bg-white relative z-20">
        <div class="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-12">
            
            <div class="flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-0">

                <div class="flex-shrink-0 flex flex-col items-center lg:items-start gap-4">
                    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="block transition hover:opacity-80">
                        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logocolor.svg" alt="ウィルフロンティア" class="h-10 md:h-12 w-auto object-contain">
                    </a>
                    <div class="flex items-center gap-4">
                        <a href="https://www.instagram.com/willfrontier" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-[#E1306C] transition-colors duration-300" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                            </svg>
                        </a>
                        <a href="https://x.com/base_wf_a" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-black transition-colors duration-300" aria-label="X (Twitter)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <nav class="w-full lg:w-auto">
                    <ul class="flex flex-wrap justify-center lg:justify-end items-center gap-x-6 gap-y-4 xl:gap-x-10 text-[13px] md:text-[15px] font-bold text-gray-800 tracking-wider">
                        <li><a href="#service" class="hover:text-[#F59E0B] transition-colors duration-300">SERVICE</a></li>
                        <li><a href="#workflow" class="hover:text-[#F59E0B] transition-colors duration-300">WORKFLOW</a></li>
                        <li><a href="#vehicles" class="hover:text-[#F59E0B] transition-colors duration-300">VEHICLES</a></li>
                        <li><a href="#safety" class="hover:text-[#F59E0B] transition-colors duration-300">SAFETY</a></li>
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