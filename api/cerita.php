<?php
// api/cerita.php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

// ===== GET =====
if ($method === 'GET') {
    $id      = isset($_GET['id'])      ? intval($_GET['id'])      : null;
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

    // Ambil satu cerita by ID
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM cerita WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $cerita = $stmt->get_result()->fetch_assoc();

        if ($cerita) {
            $likeStmt = $db->prepare("SELECT COUNT(*) as total FROM likes WHERE cerita_id = ?");
            $likeStmt->bind_param('i', $id);
            $likeStmt->execute();
            $cerita['likes'] = (int)$likeStmt->get_result()->fetch_assoc()['total'];
            echo json_encode(['success' => true, 'data' => $cerita]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Cerita tidak ditemukan']);
        }

    // Ambil cerita milik user (riwayat)
    } elseif ($user_id) {
        $stmt = $db->prepare("
            SELECT c.*,
                (SELECT COUNT(*) FROM likes l WHERE l.cerita_id = c.id) as likes,
                (SELECT COUNT(*) FROM dukungan d WHERE d.cerita_id = c.id) as dukungan_count
            FROM cerita c
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        ");
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $cerita = [];
        while ($row = $result->fetch_assoc()) {
            $row['likes']          = (int)$row['likes'];
            $row['dukungan_count'] = (int)$row['dukungan_count'];
            $cerita[] = $row;
        }
        echo json_encode(['success' => true, 'data' => $cerita]);

    // Ambil semua cerita
    } else {
        $perasaan = isset($_GET['perasaan']) ? $_GET['perasaan'] : '';
        $search   = isset($_GET['search'])   ? '%' . $_GET['search'] . '%' : '';

        $sql    = "SELECT c.*, (SELECT COUNT(*) FROM likes l WHERE l.cerita_id = c.id) as likes
                   FROM cerita c WHERE c.status = 'diterbitkan'";
        $params = [];
        $types  = '';

        if ($perasaan && $perasaan !== 'semua') {
            $sql .= " AND c.perasaan = ?";
            $params[] = $perasaan;
            $types   .= 's';
        }
        if ($search && $search !== '%%') {
            $sql .= " AND (c.judul LIKE ? OR c.isi LIKE ?)";
            $params[] = $search;
            $params[] = $search;
            $types   .= 'ss';
        }
        $sql .= " ORDER BY c.created_at DESC";

        if ($params) {
            $stmt = $db->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $result = $db->query($sql);
        }

        $cerita = [];
        while ($row = $result->fetch_assoc()) {
            $row['likes'] = (int)$row['likes'];
            $cerita[] = $row;
        }
        echo json_encode(['success' => true, 'data' => $cerita]);
    }

// ===== POST =====
} elseif ($method === 'POST') {
    $body           = json_decode(file_get_contents('php://input'), true);
    $judul          = isset($body['judul'])         ? trim($body['judul'])          : 'Tanpa Judul';
    $isi            = isset($body['isi'])            ? trim($body['isi'])            : '';
    $nama_panggilan = isset($body['nama_panggilan']) ? trim($body['nama_panggilan']) : 'Anonim';
    $perasaan       = isset($body['perasaan'])       ? trim($body['perasaan'])       : 'netral';
    $user_id        = isset($body['user_id'])        ? intval($body['user_id'])      : 1;

    if (!$isi) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Isi cerita wajib diisi']);
        exit();
    }

    $stmt = $db->prepare(
        "INSERT INTO cerita (user_id, judul, isi, nama_panggilan, perasaan, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'diterbitkan', NOW(), NOW())"
    );
    $stmt->bind_param('issss', $user_id, $judul, $isi, $nama_panggilan, $perasaan);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Cerita berhasil disimpan!', 'data' => ['id' => $db->insert_id]]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Gagal menyimpan: ' . $db->error]);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method tidak diizinkan']);
}

$db->close();