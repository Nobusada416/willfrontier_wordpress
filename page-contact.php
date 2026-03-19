<?php
/**
 * Template Name: お問い合わせ
 */

// フォーム送信処理
$sent    = false;
$errors  = array();

if ( isset( $_POST['wf_contact_nonce'] ) && wp_verify_nonce( $_POST['wf_contact_nonce'], 'wf_contact_form' ) ) {
    $name    = sanitize_text_field( $_POST['name'] ?? '' );
    $company = sanitize_text_field( $_POST['company'] ?? '' );
    $email   = sanitize_email( $_POST['email'] ?? '' );
    $tel     = sanitize_text_field( $_POST['tel'] ?? '' );
    $postal  = sanitize_text_field( $_POST['postal'] ?? '' );
    $address = sanitize_text_field( $_POST['address'] ?? '' );
    $message = sanitize_textarea_field( $_POST['message'] ?? '' );

    if ( empty( $name ) )    $errors[] = 'お名前を入力してください。';
    if ( empty( $email ) )   $errors[] = 'メールアドレスを入力してください。';
    if ( ! is_email( $email ) ) $errors[] = '正しいメールアドレスを入力してください。';
    if ( empty( $message ) ) $errors[] = 'お問い合わせ内容を入力してください。';

    if ( empty( $errors ) ) {
        $to      = get_option( 'admin_email' );
        $subject = '【ウィルフロンティア】お問い合わせ：' . $name . ' 様';
        $body    = "お名前：{$name}\n会社名：{$company}\nメール：{$email}\n電話：{$tel}\n〒：{$postal}\n住所：{$address}\n\n内容：\n{$message}";
        $headers = array( 'Reply-To: ' . $email );

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
.contact-input {
    border-left: 3px solid transparent;
    transition: border-left-color 0.3s ease, border-color 0.3s ease, background 0.3s ease;
}
.contact-input:focus {
    border-left-color: #F59E0B;
    background: #fffbf0;
    outline: none;
}
.contact-input.is-error {
    border-color: #ef4444;
    border-left-color: #ef4444;
    background: #fff5f5;
}
.contact-error-msg {
    display: none;
    color: #ef4444;
    font-size: 0.78rem;
    font-weight: 600;
    margin-top: 4px;
    letter-spacing: .05em;
}
.contact-error-msg.is-visible {
    display: block;
}
</style>

<main class="relative w-full overflow-x-hidden bg-white">

    <section class="relative w-full py-24 bg-white min-h-screen flex flex-col justify-center overflow-hidden">

        <div class="relative z-20 w-full max-w-2xl mx-auto px-6 md:px-12">

            <div id="contact-heading" class="mb-12 text-center" style="opacity:0;">
                <h2 class="text-5xl md:text-6xl font-black text-gray-700 tracking-wider mb-4">CONTACT</h2>
                <div class="w-16 h-[3px] bg-[#F59E0B] mx-auto"></div>
                <p class="mt-6 text-gray-600 font-medium tracking-wider leading-relaxed">
                    お問い合わせはこちらのフォームよりお気軽にどうぞ。<br>
                    担当者より折り返しご連絡いたします。
                </p>
            </div>

            <?php if ( $sent ) : ?>
                <div class="bg-green-50 border border-green-300 text-green-800 px-6 py-5 rounded mb-8 text-center font-bold tracking-wider">
                    お問い合わせを受け付けました。ありがとうございます。
                </div>
            <?php endif; ?>

            <?php if ( ! empty( $errors ) ) : ?>
                <div class="bg-red-50 border border-red-300 text-red-700 px-6 py-4 rounded mb-8">
                    <ul class="list-disc list-inside space-y-1 text-sm font-medium">
                        <?php foreach ( $errors as $e ) : ?>
                            <li><?php echo esc_html( $e ); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>

            <?php if ( ! $sent ) : ?>
            <form method="post" class="space-y-6">
                <?php wp_nonce_field( 'wf_contact_form', 'wf_contact_nonce' ); ?>

                <div class="contact-field" style="opacity:0;">
                    <label class="block text-sm font-bold text-[#F59E0B] tracking-widest mb-2">
                        お名前 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" name="name" id="field-name" value="<?php echo esc_attr( $_POST['name'] ?? '' ); ?>"
                        class="contact-input w-full border border-gray-300 px-4 py-3 text-gray-800"
                        placeholder="山田 太郎">
                    <span class="contact-error-msg" id="err-name">お名前を入力してください。</span>
                </div>

                <div class="contact-field" style="opacity:0;">
                    <label class="block text-sm font-bold text-[#F59E0B] tracking-widest mb-2">
                        会社名
                    </label>
                    <input type="text" name="company" value="<?php echo esc_attr( $_POST['company'] ?? '' ); ?>"
                        class="contact-input w-full border border-gray-300 px-4 py-3 text-gray-800"
                        placeholder="株式会社〇〇">
                </div>

                <div class="contact-field" style="opacity:0;">
                    <label class="block text-sm font-bold text-[#F59E0B] tracking-widest mb-2">
                        メールアドレス <span class="text-red-500">*</span>
                    </label>
                    <input type="email" name="email" id="field-email" value="<?php echo esc_attr( $_POST['email'] ?? '' ); ?>"
                        class="contact-input w-full border border-gray-300 px-4 py-3 text-gray-800"
                        placeholder="example@email.com">
                    <span class="contact-error-msg" id="err-email">正しいメールアドレスを入力してください。</span>
                </div>

                <div class="contact-field" style="opacity:0;">
                    <label class="block text-sm font-bold text-[#F59E0B] tracking-widest mb-2">
                        電話番号
                    </label>
                    <input type="tel" name="tel" id="field-tel" value="<?php echo esc_attr( $_POST['tel'] ?? '' ); ?>"
                        class="contact-input w-full border border-gray-300 px-4 py-3 text-gray-800"
                        placeholder="000-0000-0000">
                    <span class="contact-error-msg" id="err-tel">正しい電話番号を入力してください（例：000-0000-0000）。</span>
                </div>

                <div class="contact-field" style="opacity:0;">
                    <label class="block text-sm font-bold text-[#F59E0B] tracking-widest mb-2">
                        郵便番号
                    </label>
                    <div class="flex items-center gap-3">
                        <span class="text-gray-500 font-bold text-lg flex-shrink-0">〒</span>
                        <input type="text" name="postal" id="field-postal" value="<?php echo esc_attr( $_POST['postal'] ?? '' ); ?>"
                            class="contact-input border border-gray-300 px-4 py-3 text-gray-800 w-40"
                            placeholder="1234567" maxlength="8" inputmode="numeric">
                        <span id="postal-status" class="text-sm text-gray-400 tracking-wide"></span>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">ハイフンなし7桁で入力すると住所が自動入力されます</p>
                </div>

                <div class="contact-field" style="opacity:0;">
                    <label class="block text-sm font-bold text-[#F59E0B] tracking-widest mb-2">
                        住所
                    </label>
                    <input type="text" name="address" id="field-address" value="<?php echo esc_attr( $_POST['address'] ?? '' ); ?>"
                        class="contact-input w-full border border-gray-300 px-4 py-3 text-gray-800"
                        placeholder="東京都〇〇区〇〇 1-2-3">
                </div>

                <div class="contact-field" style="opacity:0;">
                    <label class="block text-sm font-bold text-[#F59E0B] tracking-widest mb-2">
                        お問い合わせ内容 <span class="text-red-500">*</span>
                    </label>
                    <textarea name="message" id="field-message" rows="6"
                        class="contact-input w-full border border-gray-300 px-4 py-3 text-gray-800 resize-none"
                        placeholder="お問い合わせ内容をご記入ください"><?php echo esc_textarea( $_POST['message'] ?? '' ); ?></textarea>
                    <span class="contact-error-msg" id="err-message">お問い合わせ内容を入力してください。</span>
                </div>

                <div class="contact-field text-center pt-4" style="opacity:0;">
                    <button type="submit"
                        class="inline-flex items-center gap-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-lg tracking-widest px-12 py-4 transition-colors duration-300 shadow-lg">
                        <span class="text-xl font-black leading-none">&gt;</span> 送信する
                    </button>
                </div>
            </form>

            <script>
            (function () {
                var form = document.querySelector('form[method="post"]');
                if (!form) return;

                function showError(input, errId) {
                    input.classList.add('is-error');
                    var msg = document.getElementById(errId);
                    if (msg) msg.classList.add('is-visible');
                }
                function clearError(input, errId) {
                    input.classList.remove('is-error');
                    var msg = document.getElementById(errId);
                    if (msg) msg.classList.remove('is-visible');
                }
                function isValidEmail(v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                }
                function isValidTel(v) {
                    return v === '' || /^[\d\-+() ]{7,15}$/.test(v);
                }

                // リアルタイム検証（blurで発火）
                var nameEl    = document.getElementById('field-name');
                var emailEl   = document.getElementById('field-email');
                var telEl     = document.getElementById('field-tel');
                var messageEl = document.getElementById('field-message');

                if (nameEl) nameEl.addEventListener('blur', function () {
                    this.value.trim() ? clearError(this, 'err-name') : showError(this, 'err-name');
                });
                if (emailEl) emailEl.addEventListener('blur', function () {
                    isValidEmail(this.value.trim()) ? clearError(this, 'err-email') : showError(this, 'err-email');
                });
                if (telEl) telEl.addEventListener('blur', function () {
                    isValidTel(this.value.trim()) ? clearError(this, 'err-tel') : showError(this, 'err-tel');
                });
                if (messageEl) messageEl.addEventListener('blur', function () {
                    this.value.trim() ? clearError(this, 'err-message') : showError(this, 'err-message');
                });

                // 郵便番号 → 住所自動入力
                var postalEl  = document.getElementById('field-postal');
                var addressEl = document.getElementById('field-address');
                var statusEl  = document.getElementById('postal-status');

                function lookupPostal(code) {
                    var clean = code.replace(/[^\d]/g, '');
                    if (clean.length !== 7) return;
                    statusEl.textContent = '検索中…';
                    statusEl.style.color = '#9ca3af';
                    fetch('https://zipcloud.ibsnet.co.jp/api/search?zipcode=' + clean)
                        .then(function (r) { return r.json(); })
                        .then(function (data) {
                            if (data.results && data.results[0]) {
                                var r = data.results[0];
                                var addr = r.address1 + r.address2 + r.address3;
                                addressEl.value = addr;
                                statusEl.textContent = '✓ 住所を入力しました';
                                statusEl.style.color = '#22c55e';
                            } else {
                                statusEl.textContent = '該当する住所が見つかりません';
                                statusEl.style.color = '#ef4444';
                            }
                        })
                        .catch(function () {
                            statusEl.textContent = '取得に失敗しました';
                            statusEl.style.color = '#ef4444';
                        });
                }

                if (postalEl) {
                    postalEl.addEventListener('input', function () {
                        var v = this.value.replace(/[^\d\-]/g, '');
                        this.value = v;
                        statusEl.textContent = '';
                        if (v.replace(/[^\d]/g, '').length === 7) lookupPostal(v);
                    });
                    postalEl.addEventListener('blur', function () {
                        if (this.value.replace(/[^\d]/g, '').length === 7) lookupPostal(this.value);
                    });
                }

                // 送信前の最終チェック
                form.addEventListener('submit', function (e) {
                    var valid = true;
                    if (nameEl && !nameEl.value.trim())            { showError(nameEl, 'err-name');       valid = false; }
                    if (emailEl && !isValidEmail(emailEl.value.trim())) { showError(emailEl, 'err-email'); valid = false; }
                    if (telEl && !isValidTel(telEl.value.trim()))  { showError(telEl, 'err-tel');         valid = false; }
                    if (messageEl && !messageEl.value.trim())      { showError(messageEl, 'err-message'); valid = false; }
                    if (!valid) e.preventDefault();
                });
            })();
            </script>
            <?php endif; ?>

        </div>
    </section>

</main>

<?php get_footer(); ?>
