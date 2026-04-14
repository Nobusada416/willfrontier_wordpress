<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class( 'antialiased text-gray-800 bg-white font-sans' ); ?> style="min-height:100vh;display:flex;flex-direction:column;">
    <?php wp_body_open(); ?>

    <header class="w-full bg-white z-[99997]" style="border-bottom:1px solid #e5e7eb;position:sticky;top:0;">
        <div class="max-w-7xl mx-auto px-6 md:px-12" style="height:72px;display:flex;align-items:center;justify-content:space-between;">

            <!-- ロゴ -->
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="block transition hover:opacity-80 flex-shrink-0">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/logocolor.svg" alt="ウィルフロンティア" style="height:40px;width:auto;object-fit:contain;">
            </a>

            <!-- ナビ -->
            <nav>
                <ul style="list-style:none;margin:0;padding:0;display:flex;align-items:center;gap:40px;">
                    <li><a href="#service"    style="color:#2d5c8a;font-size:16px;font-weight:700;letter-spacing:.12em;text-decoration:none;transition:opacity .2s;" onmouseover="this.style.opacity='.6'" onmouseout="this.style.opacity='1'">SERVICE</a></li>
                    <li><a href="#workflow"   style="color:#2d5c8a;font-size:16px;font-weight:700;letter-spacing:.12em;text-decoration:none;transition:opacity .2s;" onmouseover="this.style.opacity='.6'" onmouseout="this.style.opacity='1'">WORKFLOW</a></li>
                    <li><a href="#vehicles"   style="color:#2d5c8a;font-size:16px;font-weight:700;letter-spacing:.12em;text-decoration:none;transition:opacity .2s;" onmouseover="this.style.opacity='.6'" onmouseout="this.style.opacity='1'">VEHICLES</a></li>
                    <li><a href="#case-study" style="color:#2d5c8a;font-size:16px;font-weight:700;letter-spacing:.12em;text-decoration:none;transition:opacity .2s;" onmouseover="this.style.opacity='.6'" onmouseout="this.style.opacity='1'">CASE</a></li>
                    <li><a href="#company"    style="color:#2d5c8a;font-size:16px;font-weight:700;letter-spacing:.12em;text-decoration:none;transition:opacity .2s;" onmouseover="this.style.opacity='.6'" onmouseout="this.style.opacity='1'">COMPANY</a></li>
                </ul>
            </nav>

            <!-- CONTACTボタン -->
            <a href="<?php echo esc_url( home_url( '/safety/' ) ); ?>" style="display:inline-flex;align-items:center;gap:6px;background:#d4874a;border-radius:4px;padding:10px 24px;color:#fff;font-size:13px;font-weight:700;letter-spacing:.12em;text-decoration:none;transition:opacity .2s;flex-shrink:0;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">
                <span style="font-size:15px;font-weight:900;">&#62;</span> CONTACT
            </a>

        </div>
    </header>

