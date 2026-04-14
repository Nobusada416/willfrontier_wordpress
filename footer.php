<footer class="w-full" style="background:#2d5c8a;">
    <div class="max-w-7xl mx-auto px-6 md:px-12" style="height:72px;display:flex;align-items:center;justify-content:space-between;">

        <!-- ロゴ -->
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="block transition hover:opacity-80 flex-shrink-0">
            <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logocolor.svg" alt="ウィルフロンティア" style="height:40px;width:auto;object-fit:contain;">
        </a>

        <!-- ナビ -->
        <nav>
            <ul style="list-style:none;margin:0;padding:0;display:flex;align-items:center;gap:40px;">
                <li><a href="#service"  style="color:#fff;font-size:13px;font-weight:700;letter-spacing:.12em;text-decoration:none;opacity:.9;transition:opacity .2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.9'">SERVICE</a></li>
                <li><a href="#workflow" style="color:#fff;font-size:13px;font-weight:700;letter-spacing:.12em;text-decoration:none;opacity:.9;transition:opacity .2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.9'">WORKFLOW</a></li>
                <li><a href="#vehicles" style="color:#fff;font-size:13px;font-weight:700;letter-spacing:.12em;text-decoration:none;opacity:.9;transition:opacity .2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.9'">VEHICLES</a></li>
                <li><a href="#case-study" style="color:#fff;font-size:13px;font-weight:700;letter-spacing:.12em;text-decoration:none;opacity:.9;transition:opacity .2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.9'">CASE</a></li>
                <li><a href="#company"  style="color:#fff;font-size:13px;font-weight:700;letter-spacing:.12em;text-decoration:none;opacity:.9;transition:opacity .2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.9'">COMPANY</a></li>
            </ul>
        </nav>

        <!-- CONTACTボタン -->
        <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" style="display:inline-flex;align-items:center;gap:6px;border:2px solid #fff;border-radius:9999px;padding:10px 28px;color:#fff;font-size:13px;font-weight:700;letter-spacing:.12em;text-decoration:none;transition:background .2s,color .2s;" onmouseover="this.style.background='#fff';this.style.color='#2d5c8a'" onmouseout="this.style.background='transparent';this.style.color='#fff'">
            <span style="font-size:15px;font-weight:900;">&#62;</span> CONTACT
        </a>

    </div>
</footer>

    <?php wp_footer(); ?>
</body>
</html>
