<?php
/**
 * Template Name: お問い合わせ
 */

$sent   = false;
$errors = array();

if ( isset( $_POST['wf_contact_nonce'] ) && wp_verify_nonce( $_POST['wf_contact_nonce'], 'wf_contact_form' ) ) {
    $company = sanitize_text_field( $_POST['company'] ?? '' );
    $name    = sanitize_text_field( $_POST['name'] ?? '' );
    $tel     = sanitize_text_field( $_POST['tel'] ?? '' );
    $message = sanitize_textarea_field( $_POST['message'] ?? '' );

    if ( empty( $name ) )    $errors[] = '担当者名を入力してください。';
    if ( empty( $tel ) )     $errors[] = '電話番号を入力してください。';
    if ( empty( $message ) ) $errors[] = '内容を入力してください。';

    if ( empty( $errors ) ) {
        $to      = get_option( 'admin_email' );
        $subject = '【ウィルフロンティア】お問い合わせ：' . $name . ' 様';
        $body    = "会社名：{$company}\n担当者名：{$name}\n電話番号：{$tel}\n\n内容：\n{$message}";
        $headers = array();

        if ( wp_mail( $to, $subject, $body, $headers ) ) {
            $sent = true;
        } else {
            $errors[] = '送信に失敗しました。しばらくしてから再度お試しください。';
        }
    }
}

get_header();
?>

<style>
.contact-page {
    max-width: 100%;
    margin: 0;
    padding: 100px 40px 80px;
}

/* 安心ヘッダー */
.contact-assurance {
    background: #fef9e7;
    border: 1px solid #f0d96a;
    border-radius: 6px;
    padding: 20px 24px;
    margin-bottom: 36px;
}
.contact-assurance h2 {
    font-size: 1.25rem;
    font-weight: 900;
    color: #1f2937;
    letter-spacing: .04em;
}

/* セクション区切りタイトル */
.section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 900;
    color: #9ca3af;
    letter-spacing: .15em;
    margin-bottom: 20px;
}
.section-label::before,
.section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
}

/* ステップフロー */
.steps-wrap {
    display: flex;
    align-items: flex-start;
    gap: 0;
    margin-bottom: 40px;
}
.step-block {
    flex: 1;
    text-align: center;
}
.step-icon-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #2d5c8a;
    margin-bottom: 8px;
}
.step-icon-label .step-id {
    font-weight: 900;
    font-size: 13px;
}
.step-title {
    font-size: 15px;
    font-weight: 900;
    color: #1f2937;
    margin-bottom: 4px;
}
.step-sub {
    font-size: 11px;
    color: #4a9db5;
    font-weight: 700;
}
.step-arrow {
    padding-top: 18px;
    color: #4a9db5;
    font-size: 18px;
    flex-shrink: 0;
    width: 36px;
    text-align: center;
}

/* FAQ */
.faq-wrap {
    margin-bottom: 40px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
}
.faq-item {
    font-size: 13px;
    color: #374151;
    display: grid;
    grid-template-columns: 20px 1fr auto auto;
    gap: 8px;
    width: 420px;
}
.faq-q { color: #9ca3af; font-weight: 700; flex-shrink: 0; }
.faq-arrow { color: #2d5c8a; font-weight: 700; margin: 0 4px; }
.faq-a { color: #2d5c8a; font-weight: 700; }

/* フォーム */
.contact-form-wrap {
    margin-bottom: 28px;
}
.form-inner {
    max-width: 520px;
    margin: 0 auto;
}
.form-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    gap: 12px;
}
.form-label {
    font-size: 12px;
    font-weight: 700;
    color: #374151;
    width: 72px;
    flex-shrink: 0;
    text-align: right;
}
.form-input {
    flex: 1;
    border: 1px solid #d1d5db;
    border-radius: 3px;
    padding: 8px 12px;
    font-size: 13px;
    color: #1f2937;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    background: #fff;
}
.form-input:focus {
    border-color: #2d5c8a;
    background: #f8fafc;
}
.form-input.is-error { border-color: #ef4444; }

/* 送信ボタン */
.submit-btn-wrap {
    text-align: center;
    margin-bottom: 16px;
}
.submit-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #2d5c8a;
    color: #f5c518;
    font-weight: 900;
    font-size: 16px;
    letter-spacing: .1em;
    padding: 18px 64px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
}
.submit-btn:hover { background: #1e4570; transform: translateY(-2px); }

/* バッジ */
.badges {
    display: flex;
    justify-content: center;
    gap: 10px;
}
.badge {
    background: #f3f4f6;
    border-radius: 6px;
    padding: 18px 72px;
    text-align: center;
    font-size: 15px;
    font-weight: 900;
    color: #374151;
    letter-spacing: .05em;
}
</style>

<main class="relative w-full overflow-x-hidden bg-white">
<div class="contact-page">

    <?php if ( $sent ) : ?>
        <div style="background:#f0fdf4;border:1px solid #86efac;color:#166534;padding:20px 24px;border-radius:6px;font-weight:700;text-align:center;margin-bottom:32px;">
            お問い合わせを受け付けました。ありがとうございます。
        </div>
    <?php endif; ?>

    <?php if ( ! empty( $errors ) ) : ?>
        <div style="background:#fef2f2;border:1px solid #fca5a5;color:#991b1b;padding:16px 20px;border-radius:6px;margin-bottom:24px;">
            <ul style="list-style:disc;padding-left:20px;margin:0;font-size:13px;font-weight:600;">
                <?php foreach ( $errors as $e ) : ?>
                    <li><?php echo esc_html( $e ); ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>

    <!-- 安心ヘッダー -->
    <div class="contact-assurance">
        <h2>はじめてのお問い合わせも安心です</h2>
    </div>

    <!-- ステップフロー -->
    <div class="section-label">お問い合わせ後の流れ</div>
    <div class="steps-wrap">

        <div class="step-block">
            <div class="step-icon-label">
                <span>📞</span><span class="step-id">STEP 1</span>
            </div>
            <div class="step-title">お問い合わせ</div>
            <div class="step-sub">当日中に折り返し</div>
        </div>

        <div class="step-arrow">→</div>

        <div class="step-block">
            <div class="step-icon-label">
                <span>🔍</span><span class="step-id">STEP 2</span>
            </div>
            <div class="step-title">現地確認・見積</div>
            <div class="step-sub">無料</div>
        </div>

        <div class="step-arrow">→</div>

        <div class="step-block">
            <div class="step-icon-label">
                <span>🤝</span><span class="step-id">STEP 3</span>
            </div>
            <div class="step-title">ご契約・回収開始</div>
            <div class="step-sub">最短 1週間</div>
        </div>

    </div>

    <!-- よくあるご質問 -->
    <div class="section-label">よくあるご質問</div>
    <div class="faq-wrap">
        <div class="faq-item">
            <span class="faq-q">Q.</span>
            <span>少量でも回収してもらえますか？</span>
            <span class="faq-arrow">→</span>
            <span class="faq-a">はい</span>
        </div>
        <div class="faq-item">
            <span class="faq-q">Q.</span>
            <span>見積もりだけでも依頼できますか？</span>
            <span class="faq-arrow">→</span>
            <span class="faq-a">もちろんです</span>
        </div>
        <div class="faq-item">
            <span class="faq-q">Q.</span>
            <span>急ぎの回収は対応可能ですか？</span>
            <span class="faq-arrow">→</span>
            <span class="faq-a">ご相談ください</span>
        </div>
    </div>

    <!-- フォーム -->
    <?php if ( ! $sent ) : ?>
    <form method="post" class="contact-form-wrap">
        <?php wp_nonce_field( 'wf_contact_form', 'wf_contact_nonce' ); ?>
        <div class="form-inner">
        <div class="form-row">
            <label class="form-label" for="f-company">会社名</label>
            <input type="text" id="f-company" name="company"
                class="form-input"
                value="<?php echo esc_attr( $_POST['company'] ?? '' ); ?>"
                placeholder="">
        </div>

        <div class="form-row">
            <label class="form-label" for="f-name">担当者名</label>
            <input type="text" id="f-name" name="name"
                class="form-input <?php echo in_array('担当者名を入力してください。', $errors) ? 'is-error' : ''; ?>"
                value="<?php echo esc_attr( $_POST['name'] ?? '' ); ?>"
                placeholder="">
        </div>

        <div class="form-row">
            <label class="form-label" for="f-tel">電話番号</label>
            <input type="tel" id="f-tel" name="tel"
                class="form-input <?php echo in_array('電話番号を入力してください。', $errors) ? 'is-error' : ''; ?>"
                value="<?php echo esc_attr( $_POST['tel'] ?? '' ); ?>"
                placeholder="">
        </div>

        <div class="form-row" style="align-items:flex-start;">
            <label class="form-label" for="f-message" style="padding-top:8px;">内容</label>
            <textarea id="f-message" name="message" rows="4"
                class="form-input <?php echo in_array('内容を入力してください。', $errors) ? 'is-error' : ''; ?>"
                style="resize:vertical;"
                placeholder=""><?php echo esc_textarea( $_POST['message'] ?? '' ); ?></textarea>
        </div>

        </div><!-- /.form-inner -->

        <div class="submit-btn-wrap">
            <button type="submit" class="submit-btn">送信する →</button>
        </div>

        <div class="badges">
            <div class="badge">見積無料</div>
            <div class="badge">秘密厳守</div>
        </div>

    </form>
    <?php endif; ?>

</div>
</main>

<?php wp_footer(); ?>
</body>
</html>
