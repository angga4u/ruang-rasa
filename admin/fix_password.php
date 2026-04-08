<?php
require_once __DIR__ . '/../api/config.php';
$db = getDB();

$email    = 'Admin@ruangrasa.com';
$password = 'ruangrasa';
$hash     = password_hash($password, PASSWORD_DEFAULT);

// Update password dengan hash baru
$stmt = $db->prepare("UPDATE admins SET password = ? WHERE email = ?");
$stmt->bind_param('ss', $hash, $email);
$ok = $stmt->execute();
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Fix Admin Password</title>
  <style>
    body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#1a0010;margin:0}
    .box{background:#fff;border-radius:16px;padding:40px;max-width:480px;width:100%;text-align:center}
    h2{color:#880e4f;margin-bottom:16px}
    code{display:block;background:#f5f5f5;padding:10px;border-radius:8px;font-size:0.8rem;word-break:break-all;margin:12px 0;text-align:left}
    .ok{color:green;font-weight:700;font-size:1.1rem}
    .fail{color:red;font-weight:700}
    a{display:inline-block;margin-top:20px;background:#880e4f;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none}
  </style>
</head>
<body>
<div class="box">
  <h2>🔧 Fix Admin Password</h2>
  <?php if ($ok): ?>
    <p class="ok">✅ Password berhasil diperbarui!</p>
    <p style="margin-top:12px;color:#555">Login dengan:</p>
    <code>Email: <?= $email ?><br>Password: <?= $password ?><br>Hash: <?= $hash ?></code>
    <p style="color:#c00;font-size:0.8rem;margin-top:8px">⚠️ Hapus file ini setelah login!</p>
    <a href="/ruang-rasa/admin/login.html">→ Ke Halaman Login</a>
  <?php else: ?>
    <p class="fail">❌ Gagal update. Email tidak ditemukan di database.</p>
    <code><?= $db->error ?></code>
    <p style="margin-top:12px;font-size:0.85rem">Coba jalankan INSERT:</p>
    <code>INSERT INTO admins (email, password, nama) VALUES ('<?= $email ?>', '<?= $hash ?>', 'Admin Ruang Rasa');</code>
  <?php endif; ?>
</div>
</body>
</html>