<?php
error_reporting(0);
ini_set('display_errors', 0);
session_start();
require_once __DIR__ . '/config.php';
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$action = $_GET['action'] ?? '';

if ($action === 'login' && $method === 'POST') {
    $body     = json_decode(file_get_contents('php://input'), true);
    $email    = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';
    $stmt     = $db->prepare("SELECT * FROM admins WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $admin = $stmt->get_result()->fetch_assoc();
    if ($admin && password_verify($password, $admin['password'])) {
        $_SESSION['admin_id']    = $admin['id'];
        $_SESSION['admin_nama']  = $admin['nama'];
        $_SESSION['admin_email'] = $admin['email'];
        unset($admin['password']);
        echo json_encode(['success' => true, 'admin' => $admin]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Email atau password salah']);
    }
    exit();
}

if ($action === 'check') {
    echo json_encode(['success' => !empty($_SESSION['admin_id']), 'nama' => $_SESSION['admin_nama'] ?? '', 'email' => $_SESSION['admin_email'] ?? '']);
    exit();
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
    exit();
}

// ===== AUTH CHECK =====
$isAdmin = !empty($_SESSION['admin_id']);
if (!$isAdmin) {
    $headers    = getallheaders();
    $adminToken = $headers['X-Admin-Auth'] ?? '';
    if ($adminToken) {
        $adminId = intval($adminToken);
        $stmt    = $db->prepare("SELECT id, nama, email FROM admins WHERE id = ?");
        $stmt->bind_param('i', $adminId);
        $stmt->execute();
        $adminRow = $stmt->get_result()->fetch_assoc();
        if ($adminRow) {
            $isAdmin = true;
            $_SESSION['admin_id']   = $adminRow['id'];
            $_SESSION['admin_nama'] = $adminRow['nama'];
        }
    }
}
if (!$isAdmin) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

if ($action === 'stats') {
    $stats = [];
    foreach ([
        'total_cerita'   => "SELECT COUNT(*) FROM cerita",
        'cerita_publik'  => "SELECT COUNT(*) FROM cerita WHERE privasi='publik'",
        'cerita_anonim'  => "SELECT COUNT(*) FROM cerita WHERE privasi='anonim'",
        'total_dukungan' => "SELECT COUNT(*) FROM dukungan",
        'total_likes'    => "SELECT COUNT(*) FROM likes",
        'total_users'    => "SELECT COUNT(*) FROM users"
    ] as $k => $sql) {
        $r = $db->query($sql);
        $stats[$k] = (int)$r->fetch_row()[0];
    }
    $r = $db->query("SELECT DATE(created_at) as tgl, COUNT(*) as total FROM cerita WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY tgl ASC");
    $stats['chart'] = [];
    while ($row = $r->fetch_assoc()) $stats['chart'][] = $row;
    $r = $db->query("SELECT c.id,c.judul,c.nama_panggilan,c.perasaan,c.privasi,c.created_at,
        (SELECT COUNT(*) FROM likes l WHERE l.cerita_id=c.id) as likes,
        (SELECT COUNT(*) FROM dukungan d WHERE d.cerita_id=c.id) as dukungan_count
        FROM cerita c ORDER BY c.created_at DESC LIMIT 5");
    $stats['terbaru'] = [];
    while ($row = $r->fetch_assoc()) {
        $row['likes'] = (int)$row['likes'];
        $row['dukungan_count'] = (int)$row['dukungan_count'];
        $stats['terbaru'][] = $row;
    }
    echo json_encode(['success' => true, 'data' => $stats]);
    exit();
}

if ($action === 'get_cerita') {
    $privasi  = $_GET['privasi']  ?? '';
    $perasaan = $_GET['perasaan'] ?? '';
    $search   = $_GET['search']   ?? '';
    $sql = "SELECT c.*,u.email as user_email,
        (SELECT COUNT(*) FROM likes l WHERE l.cerita_id=c.id) as likes,
        (SELECT COUNT(*) FROM dukungan d WHERE d.cerita_id=c.id) as dukungan_count
        FROM cerita c LEFT JOIN users u ON c.user_id=u.id WHERE 1=1";
    $params = []; $types = '';
    if ($privasi)  { $sql .= " AND c.privasi=?"; $params[] = $privasi; $types .= 's'; }
    if ($perasaan) { $sql .= " AND c.perasaan=?"; $params[] = $perasaan; $types .= 's'; }
    if ($search)   { $s = "%$search%"; $sql .= " AND (c.judul LIKE ? OR c.isi LIKE ? OR c.nama_panggilan LIKE ?)"; $params[] = $s; $params[] = $s; $params[] = $s; $types .= 'sss'; }
    $sql .= " ORDER BY c.created_at DESC";
    if ($params) { $stmt = $db->prepare($sql); $stmt->bind_param($types, ...$params); $stmt->execute(); $result = $stmt->get_result(); }
    else { $result = $db->query($sql); }
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $row['likes'] = (int)$row['likes'];
        $row['dukungan_count'] = (int)$row['dukungan_count'];
        $data[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $data]);
    exit();
}

if ($action === 'get_detail') {
    $id   = intval($_GET['id'] ?? 0);
    $stmt = $db->prepare("SELECT c.*,u.email as user_email FROM cerita c LEFT JOIN users u ON c.user_id=u.id WHERE c.id=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $cerita = $stmt->get_result()->fetch_assoc();
    if (!$cerita) { echo json_encode(['success' => false]); exit(); }
    $stmt2 = $db->prepare("SELECT * FROM dukungan WHERE cerita_id=? ORDER BY created_at ASC");
    $stmt2->bind_param('i', $id);
    $stmt2->execute();
    $dukungan = [];
    $res2 = $stmt2->get_result();
    while ($row = $res2->fetch_assoc()) $dukungan[] = $row;
    $ls = $db->prepare("SELECT COUNT(*) as total FROM likes WHERE cerita_id=?");
    $ls->bind_param('i', $id);
    $ls->execute();
    $cerita['likes']    = (int)$ls->get_result()->fetch_assoc()['total'];
    $cerita['dukungan'] = $dukungan;
    echo json_encode(['success' => true, 'data' => $cerita]);
    exit();
}

if ($action === 'hapus_cerita' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? 0);
    $stmt = $db->prepare("DELETE FROM cerita WHERE id=?");
    $stmt->bind_param('i', $id);
    echo json_encode(['success' => $stmt->execute()]);
    exit();
}

if ($action === 'balas' && $method === 'POST') {
    $body      = json_decode(file_get_contents('php://input'), true);
    $cerita_id = intval($body['cerita_id'] ?? 0);
    $isi       = trim($body['isi'] ?? '');
    if (!$cerita_id || !$isi) { echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']); exit(); }
    $nama = 'Admin'; $is_admin = 1;
    $stmt = $db->prepare("INSERT INTO dukungan (cerita_id, isi, nama, is_admin, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->bind_param('issi', $cerita_id, $isi, $nama, $is_admin);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'data' => ['id' => $db->insert_id, 'nama' => 'Admin', 'isi' => $isi, 'is_admin' => 1, 'created_at' => date('Y-m-d H:i:s')]]);
    } else {
        echo json_encode(['success' => false, 'message' => $db->error]);
    }
    exit();
}

// ===== EDIT BALASAN ADMIN =====
if ($action === 'edit_balasan' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? 0);
    $isi  = trim($body['isi'] ?? '');
    if (!$id || !$isi) { echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']); exit(); }
    $stmt = $db->prepare("UPDATE dukungan SET isi = ? WHERE id = ? AND is_admin = 1");
    $stmt->bind_param('si', $isi, $id);
    echo json_encode(['success' => $stmt->execute(), 'isi' => $isi]);
    exit();
}

// ===== GET BALASAN ADMIN =====
if ($action === 'get_balasan_admin') {
    $r = $db->query("SELECT d.*, c.judul as cerita_judul, c.privasi as cerita_privasi, c.nama_panggilan as cerita_penulis
        FROM dukungan d LEFT JOIN cerita c ON d.cerita_id = c.id
        WHERE d.is_admin = 1 ORDER BY d.created_at DESC");
    $data = [];
    while ($row = $r->fetch_assoc()) $data[] = $row;
    echo json_encode(['success' => true, 'data' => $data]);
    exit();
}

if ($action === 'like_admin' && $method === 'POST') {
    $body      = json_decode(file_get_contents('php://input'), true);
    $cerita_id = intval($body['cerita_id'] ?? 0);
    $admin_ip  = 'admin_' . $_SESSION['admin_id'];
    $stmt      = $db->prepare("SELECT id FROM likes WHERE cerita_id=? AND user_ip=?");
    $stmt->bind_param('is', $cerita_id, $admin_ip);
    $stmt->execute();
    $existing = $stmt->get_result()->fetch_assoc();
    if ($existing) {
        $del = $db->prepare("DELETE FROM likes WHERE cerita_id=? AND user_ip=?");
        $del->bind_param('is', $cerita_id, $admin_ip);
        $del->execute();
        $liked = false;
    } else {
        $ins = $db->prepare("INSERT INTO likes (cerita_id, user_ip, created_at) VALUES (?, ?, NOW())");
        $ins->bind_param('is', $cerita_id, $admin_ip);
        $ins->execute();
        $liked = true;
    }
    $cs = $db->prepare("SELECT COUNT(*) as total FROM likes WHERE cerita_id=?");
    $cs->bind_param('i', $cerita_id);
    $cs->execute();
    $total = (int)$cs->get_result()->fetch_assoc()['total'];
    echo json_encode(['success' => true, 'liked' => $liked, 'total' => $total]);
    exit();
}

if ($action === 'get_users') {
    $r = $db->query("SELECT u.id,u.email,u.nama_panggilan,u.created_at,
        (SELECT COUNT(*) FROM cerita c WHERE c.user_id=u.id) as jumlah_cerita
        FROM users u ORDER BY u.created_at DESC");
    $data = [];
    while ($row = $r->fetch_assoc()) {
        $row['jumlah_cerita'] = (int)$row['jumlah_cerita'];
        $data[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $data]);
    exit();
}

if ($action === 'hapus_user' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? 0);
    $stmt = $db->prepare("DELETE FROM users WHERE id=?");
    $stmt->bind_param('i', $id);
    echo json_encode(['success' => $stmt->execute()]);
    exit();
}

if ($action === 'get_dukungan') {
    $r = $db->query("SELECT d.*,c.judul as cerita_judul,c.privasi as cerita_privasi
        FROM dukungan d LEFT JOIN cerita c ON d.cerita_id=c.id ORDER BY d.created_at DESC");
    $data = [];
    while ($row = $r->fetch_assoc()) $data[] = $row;
    echo json_encode(['success' => true, 'data' => $data]);
    exit();
}

if ($action === 'hapus_dukungan' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = intval($body['id'] ?? 0);
    $stmt = $db->prepare("DELETE FROM dukungan WHERE id=?");
    $stmt->bind_param('i', $id);
    echo json_encode(['success' => $stmt->execute()]);
    exit();
}

echo json_encode(['success' => false, 'message' => 'Action tidak dikenal']);
$db->close();