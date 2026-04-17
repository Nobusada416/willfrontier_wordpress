<?php
/**
 * Template Name: 安全管理
 */
get_header();
?>
<script>
function scaleSafetySections() {
    ['safety-sec1-inner','safety-sec2-inner'].forEach(function(id) {
        var inner = document.getElementById(id);
        if (!inner) return;
        var section = inner.parentElement;
        inner.style.transform = 'scale(1)';
        inner.style.transformOrigin = 'top center';
        var availH = section.clientHeight - 60;
        var availW = section.clientWidth - 80;
        var scaleH = availH / inner.scrollHeight;
        var scaleW = availW / inner.scrollWidth;
        var scale = Math.min(scaleH, scaleW, 1);
        inner.style.transform = 'scale(' + scale + ')';
        inner.style.marginBottom = -(inner.scrollHeight * (1 - scale)) + 'px';
    });
}
window.addEventListener('load', scaleSafetySections);
window.addEventListener('resize', scaleSafetySections);
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

<main class="relative w-full bg-white">

    <!-- セクション1: 写真＋テキスト3行 -->
    <section style="position:relative;width:100%;height:calc(100vh - 72px);padding:30px 40px;overflow:hidden;box-sizing:border-box;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" class="detail-leaf" style="position:absolute;bottom:0;left:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:1;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" class="detail-leaf detail-leaf-right" style="position:absolute;top:0;right:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:1;">
        <div id="safety-sec1-inner" style="max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:60px;padding-left:80px;">

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
                <div style="flex-shrink:0;width:300px;height:200px;border:1.5px solid #000;background:#fff;display:flex;align-items:center;justify-content:center;">
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
    <section style="position:relative;width:100%;height:calc(100vh - 72px);padding:30px 40px;overflow:hidden;box-sizing:border-box;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" class="detail-leaf" style="position:absolute;top:0;left:0px;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:1;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" class="detail-leaf detail-leaf-right" style="position:absolute;bottom:0;right:0;height:100%;width:auto;pointer-events:none;opacity:.5;z-index:1;">
        <div id="safety-sec2-inner" style="max-width:1200px;margin:0 auto;">

            <!-- 見出し -->
            <h2 style="font-size:3rem;font-weight:900;color:#2d5c8a;text-align:center;letter-spacing:.04em;margin-bottom:16px;">はじめてのお問い合わせも安心です。</h2>

            <!-- ステップフロー（全幅） -->
            <div style="margin-bottom:20px;">
                <div style="font-size:20px;font-weight:900;color:#2d5c8a;letter-spacing:.15em;display:flex;align-items:center;margin-bottom:28px;">
                    <span style="width:40px;height:2px;background:#2d5c8a;"></span>
                    <span style="margin:0 16px;">お問い合わせ後の流れ</span>
                    <span style="width:40px;height:2px;background:#2d5c8a;"></span>
                </div>
                <div style="display:flex;align-items:center;justify-content:center;gap:40px;">
                    <div style="flex:1;text-align:center;">
                        <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:14px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2d5c8a"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z"/></svg>
                            <div style="font-size:18px;font-weight:700;color:#2d5c8a;">STEP1</div>
                        </div>
                        <div style="font-size:1rem;font-weight:900;color:#2d5c8a;margin-bottom:6px;">お問い合わせ<br>（電話またはメール）</div>
                        <div style="font-size:16px;color:#4a9db5;font-weight:700;">基本当日中に折り返し</div>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:center;width:80px;flex-shrink:0;align-self:center;margin-left:-20px;transform:translateX(20px);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="36" viewBox="0 0 64 36"><polygon points="0,13 40,13 40,5 64,18 40,31 40,23 0,23" fill="#2d5c8a"/></svg>
                    </div>
                    <div style="flex:1;text-align:center;">
                        <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:14px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2d5c8a"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                            <div style="font-size:18px;font-weight:700;color:#2d5c8a;">STEP2</div>
                        </div>
                        <div style="font-size:1rem;font-weight:900;color:#2d5c8a;margin-bottom:6px;">現地確認・見積</div>
                        <div style="font-size:16px;color:#4a9db5;font-weight:700;">無料</div>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:center;width:80px;flex-shrink:0;align-self:center;margin-left:-20px;transform:translateX(20px);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="36" viewBox="0 0 64 36"><polygon points="0,13 40,13 40,5 64,18 40,31 40,23 0,23" fill="#2d5c8a"/></svg>
                    </div>
                    <div style="flex:1;text-align:center;">
                        <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:14px;">
                            <img src="<?php echo get_template_directory_uri(); ?>/assets/images/handshake.png" alt="" style="width:24px;height:24px;object-fit:contain;">
                            <div style="font-size:18px;font-weight:700;color:#2d5c8a;">STEP3</div>
                        </div>
                        <div style="font-size:1rem;font-weight:900;color:#2d5c8a;margin-bottom:6px;">ご契約・回収開始</div>
                        <div style="font-size:16px;color:#4a9db5;font-weight:700;">最短１週間</div>
                    </div>
                </div>
            </div>

            <!-- よくあるご質問（左寄せ） -->
            <div style="max-width:700px;margin-bottom:20px;">
                <div style="font-size:20px;font-weight:900;color:#4a9db5;letter-spacing:.15em;display:flex;align-items:center;margin-bottom:24px;">
                    <span style="width:75px;height:2px;background:#4a9db5;"></span>
                    <span style="margin:0 16px;">よくあるご質問</span>
                    <span style="width:75px;height:2px;background:#4a9db5;"></span>
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
                        <span style="color:#4a9db5;font-weight:700;"><?php echo esc_html($faq['q']); ?></span>
                        <span style="color:#4a9db5;font-weight:700;text-align:center;margin-left:-150px;">→</span>
                        <span style="color:#4a9db5;font-weight:700;margin-left:-50px;"><?php echo esc_html($faq['a']); ?></span>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- メールフォーム -->
            <?php
            $sent = isset($_GET['sent']) && $_GET['sent'] === '1';
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
                    if (wp_mail('n.okamoto@utiliai.ai', '【ウィルフロンティア】お問い合わせ', $body)) {
                        wp_redirect(add_query_arg('sent', '1', get_permalink()));
                        exit;
                    } else {
                        $errors[] = '送信に失敗しました。';
                    }
                }
            }
            ?>

            <?php if ($sent) : ?>
            <div id="success-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;">
                <div style="background:#fff;border-radius:12px;padding:48px 56px;text-align:center;max-width:480px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,0.2);">
                    <div style="font-size:56px;margin-bottom:16px;">✅</div>
                    <h2 style="font-size:1.6rem;font-weight:900;color:#2d5c8a;margin-bottom:12px;">送信完了</h2>
                    <p style="font-size:1rem;font-weight:700;color:#374151;line-height:1.8;margin-bottom:32px;">お問い合わせを受け付けました。<br>ありがとうございます。<br>担当者より折り返しご連絡いたします。</p>
                    <button onclick="window.history.back()" style="background:#2d5c8a;color:#f5c518;font-weight:900;font-size:1.1rem;padding:14px 60px;border:none;border-radius:9999px;cursor:pointer;transition:opacity .2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">閉じる</button>
                </div>
            </div>
            <?php endif; ?>
            <?php if (!empty($errors)) : ?>
                <div style="background:#fef2f2;border:1px solid #fca5a5;color:#991b1b;padding:14px;border-radius:6px;margin-bottom:20px;font-size:13px;">
                    <?php foreach ($errors as $e) echo '<p>' . esc_html($e) . '</p>'; ?>
                </div>
            <?php endif; ?>

            <?php if (!$sent) : ?>
            <form method="post" style="border:1.5px solid #000;border-radius:4px;padding:14px 28px;position:relative;margin-top:14px;">
                <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#fff;padding:0 16px;font-size:24px;font-weight:900;color:#2d5c8a;letter-spacing:.15em;white-space:nowrap;">メールフォームからのお問い合わせ</div>
                <?php wp_nonce_field('safety_contact', 'safety_nonce'); ?>
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
                <div style="display:flex;align-items:center;margin-bottom:6px;font-size:16px;font-weight:700;color:#374151;max-width:600px;margin-left:auto;margin-right:auto;">
                    <span style="width:140px;flex-shrink:0;"><?php echo esc_html($f['label']); ?></span>
                    <span style="margin-right:8px;">［</span>
                    <input type="<?php echo esc_attr($f['type']); ?>" name="<?php echo esc_attr($f['name']); ?>" style="flex:1;border:none;border-bottom:1px solid #c8d9e6;outline:none;padding:6px 0;font-size:16px;" value="<?php echo esc_attr($_POST[$f['name']] ?? ''); ?>">
                    <span style="margin-left:8px;">］</span>
                </div>
                <?php endforeach; ?>
                <div style="display:flex;align-items:flex-start;margin-bottom:6px;font-size:16px;font-weight:700;color:#374151;max-width:600px;margin-left:auto;margin-right:auto;">
                    <span style="width:140px;flex-shrink:0;white-space:nowrap;">問い合わせ内容</span>
                    <span style="margin-right:8px;">［</span>
                    <textarea name="message" rows="3" style="flex:1;border:none;border-bottom:1px solid #c8d9e6;outline:none;padding:6px 0;font-size:16px;resize:vertical;"><?php echo esc_textarea($_POST['message'] ?? ''); ?></textarea>
                    <span style="margin-left:8px;">］</span>
                </div>
                <div style="text-align:center;margin-bottom:20px;">
                    <button type="submit" style="background:#2d5c8a;border-radius:9999px;padding:18px 140px;color:#f5c518;font-weight:900;font-size:1.5rem;letter-spacing:.1em;border:none;cursor:pointer;transition:opacity .2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">送信する ▼</button>
                </div>
                <div style="display:flex;justify-content:center;gap:12px;">
                    <div style="border:1.5px solid #4a9db5;padding:8px 32px;text-align:center;font-size:17px;font-weight:900;color:#4a9db5;">見積無料</div>
                    <div style="border:1.5px solid #4a9db5;padding:8px 32px;text-align:center;font-size:17px;font-weight:900;color:#4a9db5;">秘密厳守</div>
                </div>
            </form>
            <?php endif; ?>

        </div>
    </section>

</main>

<?php get_footer(); ?>
