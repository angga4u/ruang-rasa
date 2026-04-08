-- ============================================
-- DATABASE: Ruang Rasa
-- Platform dukungan emosional berbasis cerita
-- ============================================

CREATE DATABASE IF NOT EXISTS ruang_rasa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ruang_rasa;

-- =====================
-- TABLE: users
-- =====================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nama_panggilan VARCHAR(100) DEFAULT 'Anonim',
    avatar VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================
-- TABLE: cerita
-- =====================
CREATE TABLE cerita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    judul VARCHAR(255) DEFAULT NULL,
    isi TEXT NOT NULL,
    nama_panggilan VARCHAR(100) DEFAULT 'Anonim',
    perasaan ENUM('sedih', 'senang', 'kesal', 'cemas', 'bingung', 'lelah') NOT NULL DEFAULT 'sedih',
    status ENUM('terkirim', 'dimoderasi', 'diterbitkan') DEFAULT 'terkirim',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================
-- TABLE: dukungan (komentar/support)
-- =====================
CREATE TABLE dukungan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cerita_id INT NOT NULL,
    user_id INT NOT NULL,
    isi TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cerita_id) REFERENCES cerita(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================
-- TABLE: likes (beri dukungan / reactions)
-- =====================
CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cerita_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (cerita_id, user_id),
    FOREIGN KEY (cerita_id) REFERENCES cerita(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================
-- SAMPLE DATA
-- =====================

-- Sample Users (password: 'password123' - hashed with bcrypt)
INSERT INTO users (email, password, nama_panggilan) VALUES
('anonim@ruangrasa.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Anonim'),
('teman@ruangrasa.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Teman baik'),
('pemimpi@ruangrasa.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pemimpi'),
('senja@ruangrasa.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'senjamanis');

-- Sample Cerita
INSERT INTO cerita (user_id, judul, isi, nama_panggilan, perasaan, status) VALUES
(1, 'Hari yang berat', 'Hari ini rasanya dunia runtuh. Deadline tugas yang menumpuk ditambah lagi kabar buruk yang datang bertubi-tubi. Saya merasa lelah, bukan secara fisik, tapi lebih ke emosional. Rasanya ingin saja menghilangkan sejenak dari dunia ini, tapi aku tahu itu bukan solusi.\n\nSetiap inci dari tubuhku rasanya berat untuk digerakkan. Tapi di tengah keputusasaan ini, aku mencoba mengingat bahwa badai pasti berlalu. Aku hanya butuh waktu untuk memproses semua ini. Semoga besok matahari bersinar lebih cerah untukku.', 'Anonim', 'sedih', 'diterbitkan'),
(2, 'Bersyukur Selalu', 'Walau kecil, hal hari ini membuatku senang. Nemu tempat makan enak yang harganya pas di kantong, ketemu teman lama yang sudah lama tidak jumpa, dan langit sore ini sangat indah. Kadang kebahagiaan memang ada di hal-hal kecil yang sering kita lewatkan.\n\nAku ingin terus belajar untuk bersyukur setiap hari, sekecil apapun nikmat itu.', 'Teman baik', 'senang', 'diterbitkan'),
(3, 'Pikiran kacau', 'Suka duka hidup memang tidak bisa dipisahkan. Lagi mikirin masa depan, mau kerja apa ya? Rasanya semua jalan terlihat panjang dan melelahkan. Tapi mungkin itu memang prosesnya.\n\nAku percaya setiap orang punya waktunya masing-masing. Semoga aku bisa menemukan jalanku sendiri.', 'Pemimpi', 'kesal', 'diterbitkan'),
(4, 'Kehilangan arah', 'gatau harus kemana eugg. rasanya semua yang aku rencanakan berantakan. udah usaha keras tapi hasilnya ga sesuai ekspektasi. cape banget.\n\nmungkin aku butuh istirahat sebentar dan mulai lagi dengan kepala yang lebih jernih.', 'senjamanis', 'sedih', 'diterbitkan');

-- Sample Dukungan
INSERT INTO dukungan (cerita_id, user_id, isi) VALUES
(1, 2, 'Semangat ya! Badai pasti berlalu. Kamu tidak sendiri dalam perjuangan ini 💗'),
(1, 3, 'Aku pernah merasakan hal yang sama. Pelan-pelan pasti bisa melewatinya. Stay strong!'),
(2, 1, 'Ini menginspirasi sekali! Makasih sudah berbagi, jadi ikut semangat juga nih 😊'),
(3, 4, 'Kamu ga sendiri! Banyak dari kita yang juga masih mencari jalan. Semangat terus ya!');

-- Sample Likes
INSERT INTO likes (cerita_id, user_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 3),
(3, 1), (3, 2),
(4, 1), (4, 2), (4, 3);

-- =====================
-- INDEXES untuk performa
-- =====================
CREATE INDEX idx_cerita_status ON cerita(status);
CREATE INDEX idx_cerita_user ON cerita(user_id);
CREATE INDEX idx_dukungan_cerita ON dukungan(cerita_id);
CREATE INDEX idx_likes_cerita ON likes(cerita_id);
