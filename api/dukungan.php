<?php
// api/dukungan.php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ===== GET - Ambil dukungan untuk cerita tertentu =====
if ($method === 'GET') {
    $cerita_id = isset($_GET['cerita_id']) ? intval($_GET['cerita_id']) : 0;

    if (!$cerita_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'cerita_id wajib diisi']);
        exit();
    }

    $stmt = $db->prepare("SELECT * FROM dukungan WHERE cerita_id = ? ORDER BY created_at ASC");
    $stmt->bind_param('i', $cerita_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $dukungan = [];
    while ($row = $result->fetch_assoc()) {
        $dukungan[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $dukungan]);

// ===== POST - Kirim dukungan baru =====
} elseif ($method === 'POST') {
    $body      = json_decode(file_get_contents('php://input'), true);
    $cerita_id = isset($body['cerita_id']) ? intval($body['cerita_id']) : 0;
    $isi       = isset($body['isi'])       ? trim($body['isi'])         : '';
    $nama      = isset($body['nama'])      ? trim($body['nama'])        : 'Anonim';

    if (!$cerita_id || !$isi) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'cerita_id dan isi wajib diisi']);
        exit();
    }

    // Cek apakah kolom nama ada (untuk kompatibilitas)
    $columns = $db->query("SHOW COLUMNS FROM dukungan LIKE 'nama'")->fetch_assoc();

    if ($columns) {
        // Kolom nama ADA
        $stmt = $db->prepare("INSERT INTO dukungan (cerita_id, isi, nama, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->bind_param('iss', $cerita_id, $isi, $nama);
    } else {
        // Kolom nama BELUM ADA — pakai user_id default
        $user_id = 1;
        $stmt = $db->prepare("INSERT INTO dukungan (cerita_id, user_id, isi, created_at) VALUES (?, ?, ?, NOW())");
        $stmt->bind_param('iis', $cerita_id, $user_id, $isi);
    }

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Dukungan berhasil dikirim!',
            'data'    => [
                'id'         => $db->insert_id,
                'cerita_id'  => $cerita_id,
                'isi'        => $isi,
                'nama'       => $nama,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Gagal mengirim dukungan: ' . $db->error]);
    }

} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan']);
}

$db->close();