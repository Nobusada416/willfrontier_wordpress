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
    $message = sanitize_textarea_field( $_POST['message'] ?? '' );

    if ( empty( $name ) )    $errors[] = 'お名前を入力してください。';
    if ( empty( $email ) )   $errors[] = 'メールアドレスを入力してください。';
    if ( ! is_email( $email ) ) $errors[] = '正しいメールアドレスを入力してください。';
    if ( empty( $message ) ) $errors[] = 'お問い合わせ内容を入力してください。';

    if ( empty( $errors ) ) {
        $to      = get_option( 'admin_email' );
        $subject = '【ウィルフロンティア】お問い合わせ：' . $name . ' 様';
        $body    = "お名前：{$name}\n会社名：{$company}\nメール：{$email}\n電話：{$tel}\n\n内容：\n{$message}";
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

<main class="relative w-full overflow-x-hidden bg-white">

    <section class="relative w-full py-24 bg-white min-h-screen flex flex-col justify-center overflow-hidden">

        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-left.svg" alt="" class="absolute top-0 bottom-0 left-0 w-40 md:w-72 lg:w-[350px] h-auto z-10 pointer-events-none opacity-95">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/images/plant-bottom-right.svg" alt="" class="absolute top-0 bottom-0 right-0 w-40 md:w-72 lg:w-[350px] h-auto z-10 pointer-events-none opacity-95">

        <div class="relative z-20 w-full max-w-2xl mx-auto px-6 md:px-12">

            <div class="mb-12 text-center">
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

                <div>
                    <label class="block text-sm font-bold text-[#F59E0B] tracking-widest mb-2">
                        お名前 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" name="name" value="<?php echo esc_attr( $_POST['name'] ?? '' ); ?>"
                        class="w-full border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:border-[#F59E0B] transition-colors"
                        placeholder="山田 太郎">
                </div>

                <div>
                    <label class="block text-sm font-bold text-[#F59E0B] tracking-widest mb-2">
                        会社名
                    </label>
                    <input type="text" name="company" value="<?php echo esc_attr( $_POST['company'] ?? '' ); ?>"
                        class="w-full border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:border-[#F59E0B] transition-colors"
                        placeholder="株式会社〇〇">
                </div>

                <div>
                    <label class="block text-sm font-bold text-[#F59E0B] tracking-widest mb-2">
                        メールアドレス <span class="text-red-500">*</span>
                    </label>
                    <input type="email" name="email" value="<?php echo esc_attr( $_POST['email'] ?? '' ); ?>"
                        class="w-full border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:border-[#F59E0B] transition-colors"
                        placeholder="example@email.com">
                </div>

                <div>
                    <label class="block text-sm font-bold text-[#F59E0B] tracking-widest mb-2">
                        電話番号
                    </label>
                    <input type="tel" name="tel" value="<?php echo esc_attr( $_POST['tel'] ?? '' ); ?>"
                        class="w-full border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:border-[#F59E0B] transition-colors"
                        placeholder="000-0000-0000">
                </div>

                <div>
                    <label class="block text-sm font-bold text-[#F59E0B] tracking-widest mb-2">
                        お問い合わせ内容 <span class="text-red-500">*</span>
                    </label>
                    <textarea name="message" rows="6"
                        class="w-full border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:border-[#F59E0B] transition-colors resize-none"
                        placeholder="お問い合わせ内容をご記入ください"><?php echo esc_textarea( $_POST['message'] ?? '' ); ?></textarea>
                </div>

                <div class="text-center pt-4">
                    <button type="submit"
                        class="inline-flex items-center gap-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-lg tracking-widest px-12 py-4 transition-colors duration-300 shadow-lg">
                        <span class="text-xl font-black leading-none">&gt;</span> 送信する
                    </button>
                </div>
            </form>
            <?php endif; ?>

        </div>
    </section>

</main>

<?php get_footer(); ?>
