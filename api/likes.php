<?php
// api/likes.php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// GET - Cek status like berdasarkan IP
if ($method === 'GET') {
    $cerita_id = isset($_GET['cerita_id']) ? intval($_GET['cerita_id']) : 0;
    $user_ip   = $_SERVER['REMOTE_ADDR'];

    if (!$cerita_id) {
        echo json_encode(['liked' => false, 'total' => 0]);
        exit();
    }

    // Cek liked
    $stmt = $db->prepare("SELECT id FROM likes WHERE cerita_id = ? AND user_ip = ?");
    $stmt->bind_param('is', $cerita_id, $user_ip);
    $stmt->execute();
    $liked = $stmt->get_result()->fetch_assoc() ? true : false;

    // Hitung total
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM likes WHERE cerita_id = ?");
    $countStmt->bind_param('i', $cerita_id);
    $countStmt->execute();
    $total = (int)$countStmt->get_result()->fetch_assoc()['total'];

    echo json_encode(['liked' => $liked, 'total' => $total]);

// POST - Toggle like (like / unlike)
} elseif ($method === 'POST') {
    $body      = json_decode(file_get_contents('php://input'), true);
    $cerita_id = isset($body['cerita_id']) ? intval($body['cerita_id']) : 0;
    $user_ip   = $_SERVER['REMOTE_ADDR'];

    if (!$cerita_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'cerita_id wajib diisi']);
        exit();
    }

    // Cek apakah kolom user_ip ada di tabel likes
    $colCheck = $db->query("SHOW COLUMNS FROM likes LIKE 'user_ip'")->fetch_assoc();

    if (!$colCheck) {
        // Kolom user_ip belum ada, tambahkan dulu
        $db->query("ALTER TABLE likes ADD COLUMN user_ip VARCHAR(45) DEFAULT NULL");
        $db->query("ALTER TABLE likes MODIFY COLUMN user_id INT DEFAULT NULL");
    }

    // Cek apakah sudah pernah like dari IP ini
    $stmt = $db->prepare("SELECT id FROM likes WHERE cerita_id = ? AND user_ip = ?");
    $stmt->bind_param('is', $cerita_id, $user_ip);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();

    if ($existing) {
        // UNLIKE — hapus like
        $del = $db->prepare("DELETE FROM likes WHERE cerita_id = ? AND user_ip = ?");
        $del->bind_param('is', $cerita_id, $user_ip);
        $del->execute();
        $liked = false;
    } else {
        // LIKE — tambah like
        $ins = $db->prepare("INSERT INTO likes (cerita_id, user_ip, created_at) VALUES (?, ?, NOW())");
        $ins->bind_param('is', $cerita_id, $user_ip);
        if (!$ins->execute()) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Gagal menyimpan like: ' . $db->error]);
            exit();
        }
        $liked = true;
    }

    // Hitung total likes setelah toggle
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM likes WHERE cerita_id = ?");
    $countStmt->bind_param('i', $cerita_id);
    $countStmt->execute();
    $total = (int)$countStmt->get_result()->fetch_assoc()['total'];

    echo json_encode([
        'success' => true,
        'liked'   => $liked,
        'total'   => $total
    ]);

} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan']);
}

$db->close();