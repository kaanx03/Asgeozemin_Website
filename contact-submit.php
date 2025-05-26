<?php
// contact-submit.php - Mail + Telegram Sistemi

require_once 'mail-config.php';
require_once 'vendor/phpmailer/phpmailer/src/Exception.php';
require_once 'vendor/phpmailer/phpmailer/src/PHPMailer.php';
require_once 'vendor/phpmailer/phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Sadece POST metodu kabul edilir']);
    exit;
}

function sanitize($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

$firstName = sanitize($_POST['firstName'] ?? '');
$lastName = sanitize($_POST['lastName'] ?? '');
$email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
$phone = sanitize($_POST['phone'] ?? '');
$company = sanitize($_POST['company'] ?? '');
$service = sanitize($_POST['service'] ?? '');
$budget = sanitize($_POST['budget'] ?? '');
$message = sanitize($_POST['message'] ?? '');
$consent = isset($_POST['consent']);
$newsletter = isset($_POST['newsletter']);

$errors = [];
if (empty($firstName)) $errors[] = 'Ad alanı zorunludur';
if (empty($lastName)) $errors[] = 'Soyad alanı zorunludur';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Geçerli bir e-posta adresi giriniz';
if (empty($message)) $errors[] = 'Mesaj alanı zorunludur';
if (!$consent) $errors[] = 'Kişisel verilerin korunması onayı gereklidir';

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

$serviceTypes = [
    'zemin-etudu' => 'Zemin Etüdü',
    'sondaj' => 'Sondaj Çalışmaları',
    'laboratuvar' => 'Zemin Laboratuvarı',
    'madencilik' => 'Madencilik Danışmanlığı',
    'diger' => 'Diğer'
];

$serviceName = $serviceTypes[$service] ?? 'Belirtilmemiş';

$budgetRanges = [
    '0-50000' => '0 - 50.000 TL',
    '50000-100000' => '50.000 - 100.000 TL',
    '100000-250000' => '100.000 - 250.000 TL',
    '250000+' => '250.000+ TL'
];

$budgetName = $budgetRanges[$budget] ?? 'Belirtilmemiş';

$messageId = date('YmdHis') . rand(1000, 9999);
$submissionDate = date('d.m.Y H:i:s');
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'Bilinmiyor';

$mailSent = false;
$telegramSent = false;
$errors = [];

// ===========================================
// 1. MAİL GÖNDERİMİ
// ===========================================
try {
    // Yöneticiye mail gönder
    $adminMail = new PHPMailer(true);
    $adminMail->isSMTP();
    $adminMail->Host = SMTP_HOST;
    $adminMail->SMTPAuth = true;
    $adminMail->Username = SMTP_USERNAME;
    $adminMail->Password = SMTP_PASSWORD;
    $adminMail->SMTPSecure = SMTP_ENCRYPTION;
    $adminMail->Port = SMTP_PORT;
    $adminMail->CharSet = 'UTF-8';
    
    $adminMail->setFrom(FROM_EMAIL, FROM_NAME);
    $adminMail->addAddress(TO_EMAIL, TO_NAME);
    $adminMail->addReplyTo($email, $firstName . ' ' . $lastName);
    
    $adminMail->isHTML(true);
    $adminMail->Subject = "🔔 Yeni İletişim Formu Mesajı - #{$messageId}";
    
    $adminMailBody = "
    <h2>🔔 Yeni İletişim Formu Mesajı</h2>
    <p><strong>Mesaj ID:</strong> #{$messageId}</p>
    <p><strong>Tarih:</strong> {$submissionDate}</p>
    <p><strong>Ad Soyad:</strong> {$firstName} {$lastName}</p>
    <p><strong>E-posta:</strong> <a href='mailto:{$email}'>{$email}</a></p>
    <p><strong>Telefon:</strong> " . ($phone ?: 'Belirtilmemiş') . "</p>
    <p><strong>Şirket:</strong> " . ($company ?: 'Belirtilmemiş') . "</p>
    <p><strong>Hizmet:</strong> {$serviceName}</p>
    <p><strong>Bütçe:</strong> {$budgetName}</p>
    <h3>Mesaj:</h3>
    <p>" . nl2br($message) . "</p>
    ";
    
    $adminMail->Body = $adminMailBody;
    $adminMail->send();

    // Müşteriye teşekkür maili
    $customerMail = new PHPMailer(true);
    $customerMail->isSMTP();
    $customerMail->Host = SMTP_HOST;
    $customerMail->SMTPAuth = true;
    $customerMail->Username = SMTP_USERNAME;
    $customerMail->Password = SMTP_PASSWORD;
    $customerMail->SMTPSecure = SMTP_ENCRYPTION;
    $customerMail->Port = SMTP_PORT;
    $customerMail->CharSet = 'UTF-8';
    
    $customerMail->setFrom(FROM_EMAIL, FROM_NAME);
    $customerMail->addAddress($email, $firstName . ' ' . $lastName);
    
    $customerMail->isHTML(true);
    $customerMail->Subject = "Mesajınız İçin Teşekkürler - AS GEO ZEMİN";
    
    $customerMailBody = "
    <h2>✅ Mesajınız Alındı!</h2>
    <p>Sayın {$firstName} {$lastName},</p>
    <p>AS GEO ZEMİN iletişim formu üzerinden göndermiş olduğunuz mesaj için teşekkür ederiz.</p>
    <p><strong>Mesaj ID:</strong> #{$messageId}</p>
    <p><strong>Hizmet Türü:</strong> {$serviceName}</p>
    <p>En geç 24 saat içinde size dönüş yapacağız.</p>
    <p>Saygılarımızla,<br><strong>AS GEO ZEMİN Ekibi</strong></p>
    ";
    
    $customerMail->Body = $customerMailBody;
    $customerMail->send();
    
    $mailSent = true;
    
} catch (Exception $e) {
    $errors[] = 'Mail gönderim hatası: ' . $e->getMessage();
}

// ===========================================
// 2. TELEGRAM GÖNDERİMİ
// ===========================================

$botToken = "8081089835:AAGjbyWPOXiTy7fth_Y5OwQeszJmcIuXUwE";
$chatId = "1724873656";

try {
    $telegramMessage = "🔔 <b>YENİ FORM MESAJI #{$messageId}</b>\n\n";
    $telegramMessage .= "👤 <b>Ad:</b> {$firstName} {$lastName}\n";
    $telegramMessage .= "📧 <b>E-posta:</b> {$email}\n";
    $telegramMessage .= "📱 <b>Telefon:</b> " . ($phone ?: 'Yok') . "\n";
    $telegramMessage .= "🏢 <b>Şirket:</b> " . ($company ?: 'Yok') . "\n";
    $telegramMessage .= "⚙️ <b>Hizmet:</b> {$serviceName}\n";
    $telegramMessage .= "💰 <b>Bütçe:</b> {$budgetName}\n";
    $telegramMessage .= "📬 <b>Newsletter:</b> " . ($newsletter ? 'Evet' : 'Hayır') . "\n\n";
    $telegramMessage .= "💬 <b>Mesaj:</b>\n<i>{$message}</i>\n\n";
    $telegramMessage .= "📅 <b>Tarih:</b> {$submissionDate}\n";
    $telegramMessage .= "🌐 <b>IP:</b> {$ipAddress}\n\n";
    $telegramMessage .= "⚡ <b>YAPILACAK:</b> info@asgeozemin.com'dan {$email} adresine yanıt ver!";

    $telegramUrl = "https://api.telegram.org/bot{$botToken}/sendMessage";
    $telegramData = [
        'chat_id' => $chatId,
        'text' => $telegramMessage,
        'parse_mode' => 'HTML'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $telegramUrl);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($telegramData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $telegramSent = true;
    } else {
        $errors[] = 'Telegram gönderim hatası: HTTP ' . $httpCode;
    }
} catch (Exception $e) {
    $errors[] = 'Telegram hatası: ' . $e->getMessage();
}

// ===========================================
// SONUÇ HAZIRLA
// ===========================================

$response = [
    'success' => true,
    'message' => 'Mesajınız başarıyla gönderildi!',
    'message_id' => $messageId,
    'details' => [
        'mail_sent' => $mailSent,
        'telegram_sent' => $telegramSent
    ]
];

// Başarı mesajını güncelle
if ($mailSent && $telegramSent) {
    $response['message'] = 'Mesajınız başarıyla gönderildi! E-posta adresinize onay maili gönderdik.';
} elseif ($mailSent) {
    $response['message'] = 'Mesajınız başarıyla gönderildi! E-posta adresinize onay maili gönderdik.';
} elseif ($telegramSent) {
    $response['message'] = 'Mesajınız başarıyla alındı!';
} else {
    $response['success'] = false;
    $response['message'] = 'Mesaj gönderilemedi. Lütfen tekrar deneyin veya doğrudan bizimle iletişime geçin.';
}

if (!empty($errors)) {
    $response['errors'] = $errors;
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>