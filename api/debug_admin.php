<?php
require_once __DIR__ . '/config.php';
$db = getDB();

$email    = 'Admin@ruangrasa.com';
$password = 'ruangrasa';

// Cek data admin di DB
$stmt = $db->prepare("SELECT * FROM admins WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$admin = $stmt->get_result()->fetch_assoc();

$hash_check = $admin ? password_verify($password, $admin['password']) : false;
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Debug Admin</title>
  <style>
    body{font-family:sans-serif;padding:30px;background:#1a0010;color:#fff}
    .box{background:#fff;color:#333;border-radius:16px;padding:30px;max-width:600px;margin:auto}
    h2{color:#880e4f}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    td{padding:10px;border-bottom:1px solid #eee;font-size:0.9rem}
    td:first-child{font-weight:700;color:#880e4f;width:40%}
    .ok{color:green;font-weight:700}
    .fail{color:red;font-weight:700}
    code{background:#f5f5f5;padding:4px 8px;border-radius:4px;font-size:0.8rem;word-break:break-all}
    .btn{display:inline-block;margin-top:20px;background:#880e4f;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;border:none;cursor:pointer;font-size:1rem}
  </style>
</head>
<body>
<div class="box">
  <h2>🔍 Debug Admin Login</h2>
  <table>
    <tr>
      <td>Email dicari</td>
      <td><code><?= htmlspecialchars($email) ?></code></td>
    </tr>
    <tr>
      <td>Admin ditemukan di DB?</td>
      <td><?= $admin ? '<span class="ok">✅ Ya</span>' : '<span class="fail">❌ Tidak ditemukan</span>' ?></td>
    </tr>
    <?php if ($admin): ?>
    <tr>
      <td>Email di DB</td>
      <td><code><?= htmlspecialchars($admin['email']) ?></code></td>
    </tr>
    <tr>
      <td>Hash di DB</td>
      <td><code><?= htmlspecialchars($admin['password']) ?></code></td>
    </tr>
    <tr>
      <td>password_verify()</td>
      <td><?= $hash_check ? '<span class="ok">✅ Password COCOK</span>' : '<span class="fail">❌ Password TIDAK cocok</span>' ?></td>
    </tr>
    <?php endif; ?>
    <tr>
      <td>PHP Version</td>
      <td><code><?= phpversion() ?></code></td>
    </tr>
  </table>

  <?php if ($admin && !$hash_check): ?>
  <hr style="margin:20px 0">
  <p><strong>🔧 Fix otomatis:</strong> Klik tombol untuk reset password sekarang.</p>
  <form method="POST">
    <button class="btn" name="fix" value="1">Reset Password Sekarang</button>
  </form>
  <?php endif; ?>

  <?php if (isset($_POST['fix'])): 
    $new_hash = password_hash($password, PASSWORD_DEFAULT);
    $upd = $db->prepare("UPDATE admins SET password = ? WHERE email = ?");
    $upd->bind_param('ss', $new_hash, $email);
    $ok = $upd->execute();
  ?>
  <p style="margin-top:16px" class="<?= $ok ? 'ok' : 'fail' ?>">
    <?= $ok ? '✅ Password berhasil direset! Silakan login.' : '❌ Gagal: ' . $db->error ?>
  </p>
  <?php endif; ?>

  <a class="btn" href="/ruang-rasa/admin/login.html" style="margin-top:16px;display:inline-block">→ Ke Login</a>
</div>
</body>
</html>