# 🌸 Ruang Rasa – Website Platform Emosional

Platform dukungan emosional yang aman dan nyaman untuk bercerita, berbagi, dan tumbuh bersama.

---

## 📁 Struktur Folder

```
ruang-rasa/
│
├── index.html              ← Halaman Beranda (Homepage)
├── database.sql            ← File database MySQL
├── README.md               ← Dokumentasi ini
│
├── css/
│   └── style.css           ← Custom styles (colors, components, etc.)
│
├── js/
│   └── components.js       ← Navbar, Footer, DB helpers (localStorage)
│
├── pages/
│   ├── login.html          ← Halaman Login & Register
│   ├── mulai-curhat.html   ← Form tulis cerita
│   ├── baca-cerita.html    ← Daftar cerita publik
│   ├── detail-cerita.html  ← Detail cerita + dukungan
│   └── riwayat.html        ← Riwayat cerita milik user
│
└── assets/
    └── images/             ← Folder gambar (logo, ilustrasi)
```

---

## 🛠️ Teknologi

- **HTML5** – Struktur halaman
- **Tailwind CSS** (CDN) – Utility-first styling, responsive
- **CSS Custom** – Variabel warna, komponen kustom
- **Vanilla JavaScript** – Interaksi tanpa framework
- **localStorage** – Simulasi database di sisi browser (frontend demo)
- **MySQL** – Database untuk implementasi backend (lihat `database.sql`)

---

## 🗄️ Setup Database (MySQL)

```sql
-- 1. Import file database.sql ke MySQL:
mysql -u root -p < database.sql

-- atau buka di phpMyAdmin:
-- Import > pilih file database.sql
```

Database memiliki tabel:
- `users` – Data pengguna (email, password, nama panggilan)
- `cerita` – Cerita yang ditulis user
- `dukungan` – Komentar/dukungan pada cerita
- `likes` – Reaksi "Beri Dukungan" pada cerita

---

## 🚀 Cara Menjalankan

### Frontend Only (demo langsung)
Cukup buka `index.html` di browser. Semua data disimpan di `localStorage`.

### Dengan Backend (PHP + MySQL)
1. Import `database.sql` ke MySQL
2. Taruh folder di `htdocs` (XAMPP) atau `www` (WAMP)
3. Buat koneksi PHP ke database
4. Ganti fungsi `DB.*` di `js/components.js` dengan fetch API ke endpoint PHP

---

## 📱 Responsive

Website mendukung semua ukuran layar:
- 📱 Mobile (< 640px)
- 💻 Tablet (640px – 1024px)  
- 🖥️ Desktop (> 1024px)

---

## 🎨 Warna Tema

| Nama | Hex | Penggunaan |
|------|-----|-----------|
| Pink Primary | `#C2185B` | Tombol, judul, aksen |
| Pink Dark | `#880E4F` | Hover, navbar |
| Pink Medium | `#E91E8C` | Teks aksen |
| Pink Light | `#F48FB1` | Border, badge |
| Pink Pale | `#FCE4EC` | Background card |
| Cream | `#FAF7F0` | Background utama |
| Gold | `#D4A017` | Logo aksen |

---

## 📄 Halaman

| Halaman | File | Deskripsi |
|---------|------|-----------|
| Beranda | `index.html` | Hero, fitur, kenapa Ruang Rasa |
| Login | `pages/login.html` | Login & Register |
| Mulai Curhat | `pages/mulai-curhat.html` | Form tulis cerita |
| Baca Cerita | `pages/baca-cerita.html` | Daftar cerita + filter |
| Detail Cerita | `pages/detail-cerita.html` | Isi cerita + dukungan |
| Riwayat | `pages/riwayat.html` | Cerita milik user |
