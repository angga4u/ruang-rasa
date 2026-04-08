<?php
// api/auth.php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

$body   = json_decode(file_get_contents('php://input'), true);
$action = isset($body['action']) ? $body['action'] : '';

// ===== REGISTER =====
if ($action === 'register') {
    $email           = isset($body['email']) ? trim($body['email']) : '';
    $nama_panggilan  = isset($body['nama_panggilan']) ? trim($body['nama_panggilan']) : 'Anonim';
    $password        = isset($body['password']) ? $body['password'] : '';

    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email dan password wajib diisi']);
        exit();
    }

    // Cek email sudah ada
    $cek = $db->prepare("SELECT id FROM users WHERE email = ?");
    $cek->bind_param('s', $email);
    $cek->execute();
    if ($cek->get_result()->fetch_assoc()) {
        echo json_encode(['success' => false, 'message' => 'Email sudah terdaftar']);
        exit();
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare("INSERT INTO users (email, nama_panggilan, password, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param('sss', $email, $nama_panggilan, $hash);

    if ($stmt->execute()) {
        $userId = $db->insert_id;
        $user = ['id' => $userId, 'email' => $email, 'nama_panggilan' => $nama_panggilan];
        echo json_encode(['success' => true, 'message' => 'Registrasi berhasil!', 'user' => $user]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Gagal registrasi: ' . $db->error]);
    }

// ===== LOGIN =====
} elseif ($action === 'login') {
    $email    = isset($body['email']) ? trim($body['email']) : '';
    $password = isset($body['password']) ? $body['password'] : '';

    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email dan password wajib diisi']);
        exit();
    }

    $stmt = $db->prepare("SELECT id, email, nama_panggilan, password FROM users WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if ($user && password_verify($password, $user['password'])) {
        unset($user['password']); // jangan kirim password ke frontend
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Email atau password salah']);
    }

} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Action tidak dikenal']);
}

$db->close();