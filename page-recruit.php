<?php
/**
 * Template Name: 採用
 */
get_header();
?>

<main class="relative w-full bg-white">

    <!-- セクション1: 求人情報 -->
    <section style="position:relative;width:100%;padding:80px 40px;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.png" alt="" style="position:absolute;top:-100px;bottom:0;left:0;width:320px;height:calc(100% + 100px);object-fit:cover;pointer-events:none;opacity:.5;z-index:1;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.png" alt="" style="position:absolute;top:-100px;bottom:0;right:0;width:320px;height:calc(100% + 100px);object-fit:cover;pointer-events:none;opacity:.5;z-index:1;">
        <div style="max-width:1200px;margin:0 auto;position:relative;z-index:2;">

            <!-- 募集職種 -->
            <div style="display:flex;align-items:flex-start;gap:48px;margin-bottom:40px;">
                <div style="font-size:26px;font-weight:900;color:#2d5c8a;white-space:nowrap;padding-top:16px;">【募集職種】</div>
                <div style="display:flex;gap:40px;flex:1;justify-content:space-around;">
                    <?php
                    $jobs = [
                        [
                            'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="#2d5c8a"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
                            'title' => '【ドライバー】',
                            'salary' => '日給 13,000円〜',
                        ],
                        [
                            'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="#2d5c8a"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
                            'title' => '【作業員】',
                            'salary' => '日給 10,000円〜',
                        ],
                        [
                            'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="#2d5c8a"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>',
                            'title' => '【管理候補】',
                            'salary' => '月給応相談',
                        ],
                        [
                            'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="#2d5c8a"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>',
                            'title' => '【事務】',
                            'salary' => '日給 9,500円〜',
                        ],
                    ];
                    foreach ($jobs as $job) : ?>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;">
                        <?php echo $job['icon']; ?>
                        <div style="font-size:18px;font-weight:900;color:#2d5c8a;"><?php echo esc_html($job['title']); ?></div>
                        <div style="font-size:16px;color:#2d5c8a;font-weight:700;"><?php echo esc_html($job['salary']); ?></div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- 区切り線（破線） -->
            <div style="border-top:2px dashed #2d5c8a;margin-bottom:40px;"></div>

            <!-- 1日の安全管理・業務の流れ -->
            <div style="background:#fef9e7;border-radius:6px;padding:28px 36px;margin-bottom:40px;">
                <div style="font-size:26px;font-weight:900;color:#2d5c8a;margin-bottom:16px;">1日の安全管理・業務の流れ</div>
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:18px;font-weight:900;color:#2d5c8a;">
                    <span>●AM 00:00　朝礼</span>
                    <span style="padding:0 8px;flex-shrink:0;"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="20" viewBox="0 0 48 20"><polygon points="0,7 34,7 34,2 48,10 34,18 34,13 0,13" fill="#2d5c8a"/></svg></span>
                    <span>●AM 00:00　車両点検</span>
                    <span style="padding:0 8px;flex-shrink:0;"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="20" viewBox="0 0 48 20"><polygon points="0,7 34,7 34,2 48,10 34,18 34,13 0,13" fill="#2d5c8a"/></svg></span>
                    <span>●AM 00:00　業務開始</span>
                    <span style="padding:0 8px;flex-shrink:0;"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="20" viewBox="0 0 48 20"><polygon points="0,7 34,7 34,2 48,10 34,18 34,13 0,13" fill="#2d5c8a"/></svg></span>
                    <span>●PM 00:00　終礼</span>
                </div>
            </div>

            <!-- 従業員の声 -->
            <div style="display:flex;align-items:flex-start;gap:48px;margin-bottom:40px;">
                <div style="font-size:26px;font-weight:900;color:#2d5c8a;white-space:nowrap;padding-top:8px;">【従業員の声】</div>
                <div style="display:flex;gap:40px;flex:1;">
                    <?php
                    $voices = [
                        ['name' => 'T さん（入社 3年目）', 'role' => '職種：ドライバー', 'quote' => '「スマイル宣言が業務にも活かされることが入社の決め手です。」', 'img' => ''],
                        ['name' => 'S さん（入社 1年目）', 'role' => '職種：作業員',     'quote' => '「未経験でも丁寧に教えてもらえました。」',                   'img' => ''],
                    ];
                    foreach ($voices as $v) : ?>
                    <div style="display:flex;align-items:flex-start;gap:20px;">
                        <!-- 写真/アイコン（imgにURLを入れると画像表示、空ならプレースホルダー） -->
                        <div style="width:130px;height:130px;border-radius:50%;border:2px solid #c8d9e6;background:#f3f4f6;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;text-align:center;">
                            <?php if (!empty($v['img'])) : ?>
                                <img src="<?php echo esc_url($v['img']); ?>" alt="<?php echo esc_attr($v['name']); ?>" style="width:100%;height:100%;object-fit:cover;display:block;">
                            <?php else : ?>
                                <span style="font-size:12px;font-weight:700;color:#9ab8c8;line-height:1.4;">写真<br>or<br>アイコン</span>
                            <?php endif; ?>
                        </div>
                        <div>
                            <div style="font-size:18px;font-weight:900;color:#2d5c8a;margin-bottom:4px;"><?php echo esc_html($v['name']); ?></div>
                            <div style="font-size:16px;color:#2d5c8a;font-weight:700;margin-bottom:8px;"><?php echo esc_html($v['role']); ?></div>
                            <div style="font-size:16px;color:#2d5c8a;font-weight:600;line-height:1.7;"><?php echo esc_html($v['quote']); ?></div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- 区切り線（破線） -->
            <div style="border-top:2px dashed #2d5c8a;margin-bottom:28px;"></div>

            <!-- 応募の流れ -->
            <div>
                <div style="font-size:17px;font-weight:900;color:#2d5c8a;letter-spacing:.15em;display:flex;align-items:center;margin-bottom:16px;max-width:280px;">
                    <span style="width:40px;height:2px;background:#2d5c8a;margin-right:12px;flex-shrink:0;"></span>
                    <span style="margin-right:12px;">応募の流れ</span>
                    <span style="width:40px;height:2px;background:#2d5c8a;flex-shrink:0;"></span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:18px;font-weight:900;color:#2d5c8a;">
                    <span>❶お問い合わせ（電話またはメールフォームから応募）</span>
                    <span style="padding:0 8px;flex-shrink:0;"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="20" viewBox="0 0 48 20"><polygon points="0,7 34,7 34,2 48,10 34,18 34,13 0,13" fill="#2d5c8a"/></svg></span>
                    <span>❷面接（カジュアル OK）</span>
                    <span style="padding:0 8px;flex-shrink:0;"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="20" viewBox="0 0 48 20"><polygon points="0,7 34,7 34,2 48,10 34,18 34,13 0,13" fill="#2d5c8a"/></svg></span>
                    <span>❸入社（最短２週間）</span>
                </div>
            </div>

        </div>
    </section>

    <!-- セクション2: 応募フォーム -->
    <section style="position:relative;width:100%;padding:80px 40px;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-left.png" alt="" style="position:absolute;top:0;bottom:0;left:0;width:320px;height:100%;object-fit:cover;pointer-events:none;opacity:.5;z-index:1;">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-top-right.png" alt="" style="position:absolute;top:0;bottom:0;right:0;width:320px;height:100%;object-fit:cover;pointer-events:none;opacity:.5;z-index:1;">
        <div style="max-width:1200px;margin:0 auto;position:relative;z-index:2;">

            <?php
            $sent   = false;
            $errors = [];
            if (isset($_POST['recruit_nonce']) && wp_verify_nonce($_POST['recruit_nonce'], 'recruit_apply')) {
                $fields = [
                    'お名前'         => sanitize_text_field($_POST['name']     ?? ''),
                    'フリガナ'        => sanitize_text_field($_POST['kana']     ?? ''),
                    'ご住所'         => sanitize_text_field($_POST['address']  ?? ''),
                    '電話番号'        => sanitize_text_field($_POST['tel']      ?? ''),
                    'メールアドレス'   => sanitize_email($_POST['email']         ?? ''),
                    '希望職種'        => sanitize_text_field($_POST['job']      ?? ''),
                    '最終学歴'        => sanitize_text_field($_POST['edu']      ?? ''),
                    '学校名'         => sanitize_text_field($_POST['school']   ?? ''),
                    '卒業学部・学科'   => sanitize_text_field($_POST['faculty']  ?? ''),
                    '卒業年月'        => sanitize_text_field($_POST['graddate'] ?? ''),
                    '職歴'           => sanitize_text_field($_POST['career']   ?? ''),
                    '備考'           => sanitize_textarea_field($_POST['note'] ?? ''),
                ];
                $required = ['お名前', 'フリガナ', 'ご住所', '電話番号', 'メールアドレス', '希望職種', '最終学歴', '備考'];
                foreach ($required as $r) {
                    if (empty($fields[$r])) $errors[] = $r . 'を入力してください。';
                }
                if (!empty($fields['メールアドレス']) && $fields['メールアドレス'] !== sanitize_email($_POST['email_confirm'] ?? '')) {
                    $errors[] = 'メールアドレスが一致しません。';
                }
                if (empty($errors)) {
                    $body = '';
                    foreach ($fields as $k => $v) $body .= "{$k}：{$v}\n";
                    if (wp_mail(get_option('admin_email'), '【ウィルフロンティア】採用応募', $body)) {
                        $sent = true;
                    } else {
                        $errors[] = '送信に失敗しました。';
                    }
                }
            }
            ?>

            <?php if ($sent) : ?>
                <div style="background:#f0fdf4;border:1px solid #86efac;color:#166534;padding:16px;border-radius:6px;text-align:center;font-weight:700;margin-bottom:24px;">
                    応募を受け付けました。ありがとうございます。
                </div>
            <?php endif; ?>
            <?php if (!empty($errors)) : ?>
                <div style="background:#fef2f2;border:1px solid #fca5a5;color:#991b1b;padding:14px;border-radius:6px;margin-bottom:20px;font-size:14px;">
                    <?php foreach ($errors as $e) echo '<p>' . esc_html($e) . '</p>'; ?>
                </div>
            <?php endif; ?>

            <?php if (!$sent) : ?>
            <form method="post" style="position:relative;border:1.5px solid #2d5c8a;border-radius:4px;padding:56px 60px 40px;">
                <?php wp_nonce_field('recruit_apply', 'recruit_nonce'); ?>

                <!-- フォームタイトル（枠線上に重ねて表示） -->
                <div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:#fff;padding:0 20px;font-size:18px;font-weight:900;color:#2d5c8a;letter-spacing:.1em;white-space:nowrap;">メールフォームからのご応募</div>

                <?php
                $required_badge = '<span style="background:#c0392b;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:2px;margin-left:6px;vertical-align:middle;">必須</span>';

                $form_rows = [
                    ['label' => '○お名前',       'req' => true,  'name' => 'name',     'type' => 'text',  'placeholder' => '例）田中　太郎',                   'sub' => false],
                    ['label' => '○フリガナ',      'req' => true,  'name' => 'kana',     'type' => 'text',  'placeholder' => '例）タナカ　タロウ',                 'sub' => false],
                    ['label' => '○ご住所',        'req' => true,  'name' => 'address',  'type' => 'text',  'placeholder' => '例）〒000-0000',                    'sub' => false],
                    ['label' => '○電話番号',      'req' => true,  'name' => 'tel',      'type' => 'tel',   'placeholder' => '例）000-000-0000',                  'sub' => false],
                    ['label' => '○メールアドレス', 'req' => true,  'name' => 'email',    'type' => 'email', 'placeholder' => '例）example@willfrontier.co.jp',    'sub' => true],
                    ['label' => '○希望職種',      'req' => true,  'name' => 'job',      'type' => 'text',  'placeholder' => '例）作業員',                        'sub' => false],
                    ['label' => '○最終学歴',      'req' => true,  'name' => 'edu',      'type' => 'text',  'placeholder' => '例）大学卒業',                      'sub' => false],
                    ['label' => '　学校名',        'req' => false, 'name' => 'school',   'type' => 'text',  'placeholder' => '例）○○大学',                       'sub' => false],
                    ['label' => '　卒業学部、学科', 'req' => false, 'name' => 'faculty',  'type' => 'text',  'placeholder' => '例）○○学部、○○学科',              'sub' => false],
                    ['label' => '　卒業年月',      'req' => false, 'name' => 'graddate', 'type' => 'text',  'placeholder' => '例）2026年3月',                     'sub' => false],
                    ['label' => '○職歴',          'req' => false, 'name' => 'career',   'type' => 'text',  'placeholder' => '',                                  'sub' => false],
                    ['label' => '○備考',          'req' => true,  'name' => 'note',     'type' => 'text',  'placeholder' => '',                                  'sub' => false],
                ];
                foreach ($form_rows as $f) :
                    $label_html = esc_html($f['label']) . ($f['req'] ? $required_badge : '');
                ?>
                <div style="display:flex;align-items:flex-start;margin-bottom:14px;font-size:15px;font-weight:700;color:#374151;gap:16px;">
                    <span style="width:170px;flex-shrink:0;padding-top:6px;"><?php echo $label_html; ?></span>
                    <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                        <div style="display:flex;align-items:center;">
                            <span style="margin-right:6px;">［</span>
                            <div style="flex:1;position:relative;">
                                <input type="<?php echo esc_attr($f['type']); ?>" name="<?php echo esc_attr($f['name']); ?>" placeholder="<?php echo esc_attr($f['placeholder']); ?>" style="width:100%;border:none;border-bottom:1px solid #c8d9e6;outline:none;padding:6px 0;font-size:14px;background:transparent;" value="<?php echo esc_attr($_POST[$f['name']] ?? ''); ?>">
                            </div>
                            <span style="margin-left:6px;">］</span>
                        </div>
                        <?php if ($f['sub']) : ?>
                        <div style="display:flex;align-items:center;">
                            <span style="margin-right:6px;">［</span>
                            <div style="flex:1;">
                                <input type="email" name="email_confirm" placeholder="確認のため、もう一度ご入力ください。" style="width:100%;border:none;border-bottom:1px solid #c8d9e6;outline:none;padding:6px 0;font-size:14px;background:transparent;" value="<?php echo esc_attr($_POST['email_confirm'] ?? ''); ?>">
                            </div>
                            <span style="margin-left:6px;">］</span>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endforeach; ?>

                <!-- 応募するボタン -->
                <div style="text-align:center;margin-top:32px;">
                    <button type="submit" style="background:#2d5c8a;border-radius:9999px;padding:18px 80px;color:#f5c518;font-weight:900;font-size:1.2rem;letter-spacing:.1em;border:none;cursor:pointer;transition:opacity .2s;" onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">応募する ▼</button>
                </div>
            </form>
            <?php endif; ?>

        </div>
    </section>

</main>

<?php get_footer(); ?>
