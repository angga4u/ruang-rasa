// ============================================
// Ruang Rasa - Shared Components
// Navbar, Footer, utility functions
// ============================================

// ===== NAVBAR HTML =====
function getBasePath() {
  // Deteksi apakah kita ada di subfolder pages/ atau di root
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../';
  return '';
}

function renderNavbar(activePage = '') {
  const base = getBasePath();
  const pages = [
    { href: base + 'index.html', label: 'Beranda', key: 'beranda' },
    { href: base + 'pages/mulai-curhat.html', label: 'Mulai Curhat', key: 'curhat' },
    { href: base + 'pages/baca-cerita.html', label: 'Baca Cerita', key: 'cerita' },
    { href: base + 'pages/riwayat.html', label: 'Riwayat', key: 'riwayat' },
  ];

  const navLinks = pages.map(p => `
    <a href="${p.href}" class="${p.key === activePage ? 'opacity-100 font-bold underline underline-offset-2' : ''}">
      ${p.label}
    </a>
  `).join('');

  return `
    <header class="navbar sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <!-- Logo -->
        <a href="${base}index.html" class="flex items-center gap-2">
          <img src="../assets/logo.png" alt="Logo" class="w-10 h-10 object-contain" onerror="this.style.display='none'">
          <div class="navbar-brand">
            Ruang<span>Rasa</span>
          </div>
        </a>
        <!-- Avatar -->
        <div class="avatar-circle cursor-pointer" onclick="toggleUserMenu()" title="Profil">
          <span id="avatarInitial">A</span>
        </div>
      </div>
      <!-- Nav Menu -->
      <nav class="nav-menu">
        <div class="max-w-5xl mx-auto px-4 flex items-center justify-center gap-2 flex-wrap">
          ${navLinks}
        </div>
      </nav>
    </header>
  `;
}

// ===== FOOTER HTML =====
function renderFooter() {
  const base = getBasePath();
  return `
    <footer class="footer mt-auto">
      <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4>Ruang Rasa</h4>
          <p>Platform dukungan emosional yang aman dan nyaman. Kami percaya setiap cerita berharga dan setiap perasaan valid.</p>
        </div>
        <div>
          <h4>Tautan Cepat</h4>
          <a href="${base}index.html">Beranda</a>
          <a href="${base}pages/mulai-curhat.html">Mulai Curhat</a>
          <a href="${base}pages/baca-cerita.html">Baca Cerita</a>
          <a href="${base}pages/riwayat.html">Riwayat</a>
        </div>
        <div class="flex flex-col items-center md:items-start">
          <h4>Ikuti Kami</h4>
          <a href="#" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  `;
}

// ===== INJECT NAVBAR & FOOTER =====
function initPage(activePage = '') {
  const navContainer = document.getElementById('navbar-container');
  const footerContainer = document.getElementById('footer-container');
  if (navContainer) navContainer.innerHTML = renderNavbar(activePage);
  if (footerContainer) footerContainer.innerHTML = renderFooter();
}

// ===== LOCAL STORAGE HELPERS (simulasi database di frontend) =====
const DB = {
  getStories() {
    const data = localStorage.getItem('rr_cerita');
    if (!data) {
      // Default sample data
      const samples = [
        { id: 1, judul: 'Hari yang berat', isi: 'Hari ini rasanya dunia runtuh. Deadline tugas yang menumpuk ditambah lagi kabar buruk yang datang bertubi-tubi. Saya merasa lelah, bukan secara fisik, tapi lebih ke emosional. Rasanya ingin saja menghilangkan sejenak dari dunia ini, tapi aku tahu itu bukan solusi.\n\nSetiap inci dari tubuhku rasanya berat untuk digerakkan. Tapi di tengah keputusasaan ini, aku mencoba mengingat bahwa badai pasti berlalu. Aku hanya butuh waktu untuk memproses semua ini. Semoga besok matahari bersinar lebih cerah untukku.', nama_panggilan: 'Anonim', perasaan: 'sedih', status: 'diterbitkan', created_at: new Date(Date.now() - 2*60*60*1000).toISOString(), likes: 3, dukungan: [] },
        { id: 2, judul: 'Bersyukur Selalu', isi: 'Walau kecil, hal hari ini membuatku senang. Nemu tempat makan enak yang harganya pas di kantong, ketemu teman lama yang sudah lama tidak jumpa, dan langit sore ini sangat indah.\n\nAku ingin terus belajar untuk bersyukur setiap hari, sekecil apapun nikmat itu.', nama_panggilan: 'Teman baik', perasaan: 'senang', status: 'diterbitkan', created_at: new Date(Date.now() - 5*60*60*1000).toISOString(), likes: 2, dukungan: [] },
        { id: 3, judul: 'Pikiran kacau', isi: 'Suka duka hidup memang tidak bisa dipisahkan. Lagi mikirin masa depan, mau kerja apa ya? Rasanya semua jalan terlihat panjang dan melelahkan. Tapi mungkin itu memang prosesnya.\n\nAku percaya setiap orang punya waktunya masing-masing.', nama_panggilan: 'Pemimpi', perasaan: 'kesal', status: 'diterbitkan', created_at: new Date(Date.now() - 24*60*60*1000).toISOString(), likes: 2, dukungan: [] },
        { id: 4, judul: 'Kehilangan arah', isi: 'gatau harus kemana eugg. rasanya semua yang aku rencanakan berantakan. udah usaha keras tapi hasilnya ga sesuai ekspektasi. cape banget.\n\nmungkin aku butuh istirahat sebentar dan mulai lagi dengan kepala yang lebih jernih.', nama_panggilan: 'senjamanis', perasaan: 'sedih', status: 'diterbitkan', created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString(), likes: 3, dukungan: [] },
      ];
      localStorage.setItem('rr_cerita', JSON.stringify(samples));
      return samples;
    }
    return JSON.parse(data);
  },

  saveStory(story) {
    const stories = this.getStories();
    story.id = Date.now();
    story.created_at = new Date().toISOString();
    story.status = 'terkirim';
    story.likes = 0;
    story.dukungan = [];
    stories.unshift(story);
    localStorage.setItem('rr_cerita', JSON.stringify(stories));
    return story;
  },

  getStoryById(id) {
    return this.getStories().find(s => s.id == id);
  },

  addDukungan(storyId, isi) {
    const stories = this.getStories();
    const story = stories.find(s => s.id == storyId);
    if (story) {
      if (!story.dukungan) story.dukungan = [];
      story.dukungan.push({ id: Date.now(), isi, created_at: new Date().toISOString(), nama: 'Anonim' });
      localStorage.setItem('rr_cerita', JSON.stringify(stories));
    }
  },

  toggleLike(storyId) {
    const stories = this.getStories();
    const story = stories.find(s => s.id == storyId);
    if (story) {
      const likedKey = 'rr_liked_' + storyId;
      const isLiked = localStorage.getItem(likedKey);
      if (isLiked) {
        story.likes = Math.max(0, (story.likes || 0) - 1);
        localStorage.removeItem(likedKey);
      } else {
        story.likes = (story.likes || 0) + 1;
        localStorage.setItem(likedKey, '1');
      }
      localStorage.setItem('rr_cerita', JSON.stringify(stories));
      return !isLiked;
    }
  },

  isLiked(storyId) {
    return !!localStorage.getItem('rr_liked_' + storyId);
  },

  getMyStories() {
    return this.getStories().filter(s => s.is_mine);
  }
};

// ===== TIME AGO HELPER =====
function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return Math.floor(diff/60) + ' menit yang lalu';
  if (diff < 86400) return Math.floor(diff/3600) + ' jam yang lalu';
  if (diff < 604800) return Math.floor(diff/86400) + ' hari yang lalu';
  return Math.floor(diff/604800) + ' minggu yang lalu';
}

// ===== USER MENU TOGGLE =====
function toggleUserMenu() {
  alert('Fitur profil akan segera tersedia!');
}


// ============================================
// LOGIN PAGE — fungsi JS
// ============================================

async function handleLogin() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errEl    = document.getElementById('loginError');

  if (!email || !password) {
    errEl.style.display = 'block';
    errEl.textContent   = 'Email dan password wajib diisi!';
    return;
  }
  errEl.style.display = 'none';

  try {
    const res  = await fetch(getApiBase() + 'auth.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'login', email, password })
    });
    const json = await res.json();

    if (json.success) {
      localStorage.setItem('rr_user', JSON.stringify(json.user));
      window.location.href = getBasePath() + 'index.html';
    } else {
      errEl.style.display = 'block';
      errEl.textContent   = json.message || 'Email atau password salah';
    }
  } catch(e) {
    errEl.style.display = 'block';
    errEl.textContent   = 'Gagal menghubungi server. Pastikan Laragon menyala.';
  }
}

async function handleRegister() {
  const email  = document.getElementById('regEmail').value.trim();
  const nama   = document.getElementById('regNama').value.trim() || 'Anonim';
  const pass   = document.getElementById('regPass').value;
  const errEl  = document.getElementById('regError');

  if (!email || !pass) {
    errEl.style.display = 'block';
    errEl.textContent   = 'Email dan password wajib diisi!';
    return;
  }
  errEl.style.display = 'none';

  try {
    const res  = await fetch(getApiBase() + 'auth.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'register', email, nama_panggilan: nama, password: pass })
    });
    const json = await res.json();

    if (json.success) {
      localStorage.setItem('rr_user', JSON.stringify(json.user));
      window.location.href = getBasePath() + 'index.html';
    } else {
      errEl.style.display = 'block';
      errEl.textContent   = json.message || 'Gagal mendaftar';
    }
  } catch(e) {
    errEl.style.display = 'block';
    errEl.textContent   = 'Gagal menghubungi server. Pastikan Laragon menyala.';
  }
}

function showRegisterForm() {
  document.getElementById('loginForm').style.display    = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display    = 'block';
}

function initLoginPage() {
  // Redirect kalau sudah login
  if (localStorage.getItem('rr_user')) {
    window.location.href = getBasePath() + 'index.html';
    return;
  }
  // Enter key support
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const loginFormVisible = document.getElementById('loginForm').style.display !== 'none';
    if (loginFormVisible) handleLogin();
    else handleRegister();
  });
}