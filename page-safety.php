<?php
/**
 * Template Name: 安全管理
 */
get_header();
?>

<main class="relative w-full bg-white">

    <!-- セクション1: 写真＋テキスト3行 -->
    <section style="position:relative;width:100%;min-height:1180px;padding:80px 40px;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" style="position:absolute;top:0;bottom:0;left:0;width:320px;height:100%;object-fit:cover;pointer-events:none;opacity:.5;z-index:1;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" style="position:absolute;top:0;bottom:0;right:0;width:320px;height:100%;object-fit:cover;pointer-events:none;opacity:.5;z-index:1;">
        <div style="max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:32px;">

            <?php
            $items = [
                [
                    'title' => '【車両等の点検・講習】',
                    'text'  => '毎日の車両等の点検のほか、定期的に講習会などを行っています。',
                    'img'   => '',
                ],
                [
                    'title' => '【危険予測トレーニング】',
                    'text'  => '講習会などで危険予測のトレーニングを行っています。',
                    'img'   => '',
                ],
                [
                    'title' => '【地域清掃】',
                    'text'  => '地域の清掃を定期的に行っています。',
                    'img'   => '',
                ],
            ];
            foreach ($items as $item) :
            ?>
            <div style="display:flex;align-items:center;gap:32px;">
                <!-- 写真 -->
                <div style="flex-shrink:0;width:380px;height:260px;border:1.5px solid #c8d9e6;background:#fff;display:flex;align-items:center;justify-content:center;">
                    <?php if (!empty($item['img'])) : ?>
                        <img src="<?php echo esc_url($item['img']); ?>" alt="<?php echo esc_attr($item['title']); ?>" style="width:100%;height:100%;object-fit:cover;display:block;">
                    <?php else : ?>
                        <span style="font-size:1rem;font-weight:700;color:#9ab8c8;letter-spacing:.1em;">写真</span>
                    <?php endif; ?>
                </div>
                <!-- テキスト -->
                <div>
                    <p style="font-size:18px;font-weight:900;color:#4a9db5;margin-bottom:8px;"><?php echo esc_html($item['title']); ?></p>
                    <p style="font-size:17px;color:#4a9db5;font-weight:500;line-height:1.8;"><?php echo esc_html($item['text']); ?></p>
                </div>
            </div>
            <?php endforeach; ?>

        </div>
    </section>

    <!-- セクション2: お問い合わせ -->
    <section style="position:relative;width:100%;min-height:1180px;padding:80px 40px;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" style="position:absolute;top:0;bottom:0;left:0;width:320px;height:100%;object-fit:cover;pointer-events:none;opacity:.5;z-index:1;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" style="position:absolute;top:0;bottom:0;right:0;width:320px;height:100%;object-fit:cover;pointer-events:none;opacity:.5;z-index:1;">
        <div style="max-width:1200px;margin:0 auto;">

            <!-- 見出し -->
            <h2 style="font-size:2.4rem;font-weight:900;color:#2d5c8a;text-align:center;letter-spacing:.04em;margin-bottom:48px;">はじめてのお問い合わせも安心です。</h2>

            <!-- ステップフロー（全幅） -->
            <div style="margin-bottom:56px;">
                <div style="font-size:15px;font-weight:900;color:#9ca3af;letter-spacing:.15em;display:flex;align-items:center;margin-bottom:28px;">
                    <span style="flex:1;height:1px;background:#e5e7eb;"></span>
                    <span style="margin:0 16px;">お問い合わせ後の流れ</span>
                    <span style="flex:1;height:1px;background:#e5e7eb;"></span>
                </div>
                <div style="display:flex;align-items:center;justify-content:center;gap:40px;">
                    <div style="flex:1;">
                        <div style="font-size:16px;font-weight:700;color:#2d5c8a;margin-bottom:14px;">📞 STEP1</div>
                        <div style="font-size:1.3rem;font-weight:900;color:#1f2937;margin-bottom:10px;">お問い合わせ<br>（電話またはメール）</div>
                        <div style="font-size:15px;color:#4a9db5;font-weight:700;">基本当日中に折り返し</div>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:center;color:#4a9db5;font-size:36px;width:60px;flex-shrink:0;align-self:center;margin-left:-20px;">→</div>
                    <div style="flex:1;">
                        <div style="font-size:16px;font-weight:700;color:#2d5c8a;margin-bottom:14px;">🔍 STEP2</div>
                        <div style="font-size:1.3rem;font-weight:900;color:#1f2937;margin-bottom:10px;">現地確認・見積</div>
                        <div style="font-size:15px;color:#4a9db5;font-weight:700;">無料</div>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:center;color:#4a9db5;font-size:36px;width:60px;flex-shrink:0;align-self:center;margin-left:-20px;">→</div>
                    <div style="flex:1;">
                        <div style="font-size:16px;font-weight:700;color:#2d5c8a;margin-bottom:14px;">🤝 STEP3</div>
                        <div style="font-size:1.3rem;font-weight:900;color:#1f2937;margin-bottom:10px;">ご契約・回収開始</div>
                        <div style="font-size:15px;color:#4a9db5;font-weight:700;">最短１週間</div>
                    </div>
                </div>
            </div>

            <!-- よくあるご質問（左寄せ） -->
            <div style="max-width:700px;margin-bottom:48px;">
                <div style="font-size:15px;font-weight:900;color:#9ca3af;letter-spacing:.15em;display:flex;align-items:center;margin-bottom:24px;">
                    <span style="flex:1;height:1px;background:#e5e7eb;"></span>
                    <span style="margin:0 16px;">よくあるご質問</span>
                    <span style="flex:1;height:1px;background:#e5e7eb;"></span>
                </div>
                <div style="display:grid;grid-template-columns:1fr auto auto;gap:14px 20px;align-items:center;font-size:16px;">
                    <?php
                    $faqs = [
                        ['q' => 'Q.少量の産業廃棄物でも回収してもらえますか？', 'a' => '少量でも回収可能です'],
                        ['q' => 'Q.見積もりだけの依頼は可能ですか？',           'a' => '見積のみも可能です'],
                        ['q' => 'Q.急ぎの回収は対応可能ですか？',               'a' => 'ご相談ください'],
                    ];
                    foreach ($faqs as $faq) :
                    ?>
                        <span style="color:#374151;font-weight:600;"><?php echo esc_html($faq['q']); ?></span>
                        <span style="color:#2d5c8a;font-weight:700;text-align:center;">→</span>
                        <span style="color:#2d5c8a;font-weight:700;"><?php echo esc_html($faq['a']); ?></span>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- メールフォーム -->
            <?php
            $sent = false;
            $errors = [];
            if (isset($_POST['safety_nonce']) && wp_verify_nonce($_POST['safety_nonce'], 'safety_contact')) {
                $fields = [
                    '担当者名'    => sanitize_text_field($_POST['name'] ?? ''),
                    'フリガナ'    => sanitize_text_field($_POST['kana'] ?? ''),
                    '会社名'      => sanitize_text_field($_POST['company'] ?? ''),
                    '電話番号'    => sanitize_text_field($_POST['tel'] ?? ''),
                    'メールアドレス' => sanitize_email($_POST['email'] ?? ''),
                    '問い合わせ内容' => sanitize_textarea_field($_POST['message'] ?? ''),
                ];
                if (empty($fields['担当者名'])) $errors[] = '担当者名を入力してください。';
                if (empty($fields['電話番号']))  $errors[] = '電話番号を入力してください。';
                if (empty($errors)) {
                    $body = '';
                    foreach ($fields as $k => $v) $body .= "{$k}：{$v}\n";
                    if (wp_mail(get_option('admin_email'), '【ウィルフロンティア】お問い合わせ', $body)) {
                        $sent = true;
                    } else {
                        $errors[] = '送信に失敗しました。';
                    }
                }
            }
            ?>

            <?php if ($sent) : ?>
                <div style="background:#f0fdf4;border:1px solid #86efac;color:#166534;padding:16px;border-radius:6px;text-align:center;font-weight:700;margin-bottom:24px;">
                    お問い合わせを受け付けました。ありがとうございます。
                </div>
            <?php endif; ?>
            <?php if (!empty($errors)) : ?>
                <div style="background:#fef2f2;border:1px solid #fca5a5;color:#991b1b;padding:14px;border-radius:6px;margin-bottom:20px;font-size:13px;">
                    <?php foreach ($errors as $e) echo '<p>' . esc_html($e) . '</p>'; ?>
                </div>
            <?php endif; ?>

            <?php if (!$sent) : ?>
            <form method="post" style="border:1.5px solid #c8d9e6;border-radius:4px;padding:32px 40px;">
                <?php wp_nonce_field('safety_contact', 'safety_nonce'); ?>
                <div style="font-size:15px;font-weight:900;color:#9ca3af;letter-spacing:.15em;text-align:center;margin-bottom:28px;">— メールフォームからのお問い合わせ —</div>
                <?php
                $form_fields = [
                    ['label' => '担当者名',     'name' => 'name',    'type' => 'text'],
                    ['label' => 'フリガナ',     'name' => 'kana',    'type' => 'text'],
                    ['label' => '会社名',       'name' => 'company', 'type' => 'text'],
                    ['label' => '電話番号',     'name' => 'tel',     'type' => 'tel'],
                    ['label' => 'メールアドレス','name' => 'email',   'type' => 'email'],
                ];
                foreach ($form_fields as $f) :
                ?>
                <div style="display:flex;align-items:center;margin-bottom:14px;font-size:16px;font-weight:700;color:#374151;">
                    <span style="width:140px;flex-shrink:0;"><?php echo esc_html($f['label']); ?></span>
                    <span style="margin-right:8px;">［</span>
                    <input type="<?php echo esc_attr($f['type']); ?>" name="<?php echo esc_attr($f['name']); ?>" style="flex:1;border:none;border-bottom:1px solid #c8d9e6;outline:none;padding:6px 0;font-size:16px;" value="<?php echo esc_attr($_POST[$f['name']] ?? ''); ?>">
                    <span style="margin-left:8px;">］</span>
                </div>
                <?php endforeach; ?>
                <div style="display:flex;align-items:flex-start;margin-bottom:28px;font-size:16px;font-weight:700;color:#374151;">
                    <span style="width:140px;flex-shrink:0;padding-top:4px;">問い合わせ内容</span>
                    <span style="margin-right:8px;padding-top:4px;">［</span>
                    <textarea name="message" rows="3" style="flex:1;border:none;border-bottom:1px solid #c8d9e6;outline:none;padding:6px 0;font-size:16px;resize:vertical;"><?php echo esc_textarea($_POST['message'] ?? ''); ?></textarea>
                    <span style="margin-left:8px;padding-top:4px;">］</span>
                </div>
                <div style="text-align:center;margin-bottom:20px;">
                    <button type="submit" style="background:#2d5c8a;border-radius:9999px;padding:16px 72px;color:#f5c518;font-weight:900;font-size:1.1rem;letter-spacing:.1em;border:none;cursor:pointer;transition:opacity .2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">送信する ▼</button>
                </div>
                <div style="display:flex;justify-content:center;gap:12px;">
                    <div style="background:#f3f4f6;border-radius:6px;padding:14px 44px;text-align:center;font-size:17px;font-weight:900;color:#374151;">見積無料</div>
                    <div style="background:#f3f4f6;border-radius:6px;padding:14px 44px;text-align:center;font-size:17px;font-weight:900;color:#374151;">秘密厳守</div>
                </div>
            </form>
            <?php endif; ?>

        </div>
    </section>

</main>

<?php get_footer(); ?>
