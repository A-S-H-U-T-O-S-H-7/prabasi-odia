<?php
header('Content-Type: application/json');

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$otp = trim($_POST['otp'] ?? '');

if ($name === '') {
    http_response_code(400);
    echo json_encode([
        'status' => false,
        'message' => 'Full name is required.',
        'errors' => ['Full name is required.'],
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'status' => false,
        'message' => 'Valid email address is required.',
        'errors' => ['Valid email address is required.'],
    ]);
    exit;
}

if (!preg_match('/^\d{6}$/', $otp)) {
    http_response_code(400);
    echo json_encode([
        'status' => false,
        'message' => 'Valid 6-digit OTP is required.',
        'errors' => ['Valid 6-digit OTP is required.'],
    ]);
    exit;
}

$safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$subject = 'Your Prabasi Odia verification OTP';
$body = <<<HTML
<html>
  <body style="font-family: Arial, sans-serif; color: #2A1636; line-height: 1.5;">
    <p>Namaskar {$safeName},</p>
    <p>Your OTP for Prabasi Odia registration is:</p>
    <p style="font-size: 28px; letter-spacing: 6px; font-weight: bold; color: #6B1E5B;">{$otp}</p>
    <p>This OTP is valid for 5 minutes. Keep it confidential.</p>
    <p>Team Prabasi Odia</p>
  </body>
</html>
HTML;

$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: Prabasi Odia <noreply@svsamiti.com>',
    'Reply-To: noreply@svsamiti.com',
];

$sent = mail($email, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'Unable to send OTP email.',
    ]);
    exit;
}

echo json_encode([
    'status' => true,
    'message' => 'OTP sent to email successfully.',
]);
