// ============================================
// Ruang Rasa - Shared Components
// ============================================

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../';
  return '';
}

function getApiBase() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../api/';
  return 'api/';
}

// ===== NAVBAR =====
function renderNavbar(activePage = '') {
  const base = getBasePath();
  const pages = [
    { href: base + 'index.html',              label: 'Beranda',      key: 'beranda' },
    { href: base + 'pages/mulai-curhat.html', label: 'Mulai Curhat', key: 'curhat'  },
    { href: base + 'pages/baca-cerita.html',  label: 'Baca Cerita',  key: 'cerita'  },
    { href: base + 'pages/riwayat.html',      label: 'Riwayat',      key: 'riwayat' },
  ];
  const navLinks = pages.map(p => `
    <a href="${p.href}" class="${p.key === activePage ? 'opacity-100 font-bold underline underline-offset-2' : ''}">
      ${p.label}
    </a>
  `).join('');
  return `
    <header class="navbar sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="${base}index.html" class="flex items-center gap-2">
          <img src="../assets/remove.png" alt="Logo" class="w-10 h-10 object-contain" onerror="this.style.display='none'">
          <div class="navbar-brand">Ruang<span>Rasa</span></div>
        </a>
        <div class="avatar-circle cursor-pointer" onclick="toggleUserMenu()" title="Profil">
          <span id="avatarInitial">A</span>
        </div>
      </div>
      <nav class="nav-menu">
        <div class="max-w-5xl mx-auto px-4 flex items-center justify-center gap-2 flex-wrap">
          ${navLinks}
        </div>
      </nav>
    </header>
  `;
}

// ===== FOOTER =====
function renderFooter() {
  const base = getBasePath();
  return `
    <footer class="footer mt-auto">
      <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4>Ruang Rasa</h4>
          <p>Platform dukungan emosional yang aman dan nyaman.</p>
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

function initPage(activePage = '') {
  const navContainer    = document.getElementById('navbar-container');
  const footerContainer = document.getElementById('footer-container');
  if (navContainer)    navContainer.innerHTML    = renderNavbar(activePage);
  if (footerContainer) footerContainer.innerHTML = renderFooter();
}

// ===== DATABASE API =====
const DB = {

  async getStories(params = {}) {
    try {
      let url = getApiBase() + 'cerita.php';
      const query = new URLSearchParams();
      if (params.perasaan) query.set('perasaan', params.perasaan);
      if (params.search)   query.set('search',   params.search);
      if (query.toString()) url += '?' + query.toString();
      const res  = await fetch(url);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (e) {
      console.error('getStories error:', e);
      return [];
    }
  },

  async saveStory(story) {
    try {
      const user = JSON.parse(localStorage.getItem('rr_user') || '{}');
      if (user.id) story.user_id = user.id;
      const res  = await fetch(getApiBase() + 'cerita.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(story)
      });
      const json = await res.json();
      return json;
    } catch (e) {
      console.error('saveStory error:', e);
      return { success: false, message: 'Gagal menghubungi server.' };
    }
  },

  async getStoryById(id) {
    try {
      const res  = await fetch(getApiBase() + 'cerita.php?id=' + id);
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (e) {
      return null;
    }
  },

  async getMyStories() {
    try {
      const user = JSON.parse(localStorage.getItem('rr_user') || '{}');
      if (!user.id) return [];
      const res  = await fetch(getApiBase() + 'cerita.php?user_id=' + user.id);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (e) {
      return [];
    }
  },

  async toggleLike(storyId) {
    try {
      const res  = await fetch(getApiBase() + 'likes.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cerita_id: storyId })
      });
      const json = await res.json();
      if (json.success) {
        if (json.liked) localStorage.setItem('rr_liked_' + storyId, '1');
        else            localStorage.removeItem('rr_liked_' + storyId);
      }
      return json;
    } catch (e) {
      return { success: false };
    }
  },

  async isLiked(storyId) {
    try {
      const res  = await fetch(getApiBase() + 'likes.php?cerita_id=' + storyId);
      const json = await res.json();
      return json.liked || false;
    } catch (e) {
      return !!localStorage.getItem('rr_liked_' + storyId);
    }
  },

  async getDukungan(storyId) {
    try {
      const res  = await fetch(getApiBase() + 'dukungan.php?cerita_id=' + storyId);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (e) {
      console.error('getDukungan error:', e);
      return [];
    }
  },

  async addDukungan(storyId, isi, nama = 'Anonim') {
    try {
      const res  = await fetch(getApiBase() + 'dukungan.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cerita_id: storyId, isi, nama })
      });
      const json = await res.json();
      return json;
    } catch (e) {
      return { success: false };
    }
  }
};

// ===== TIME AGO =====
function timeAgo(dateStr) {
  const now  = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)     return 'baru saja';
  if (diff < 3600)   return Math.floor(diff / 60) + ' menit yang lalu';
  if (diff < 86400)  return Math.floor(diff / 3600) + ' jam yang lalu';
  if (diff < 604800) return Math.floor(diff / 86400) + ' hari yang lalu';
  return Math.floor(diff / 604800) + ' minggu yang lalu';
}

function toggleUserMenu() {
  alert('Fitur profil akan segera tersedia!');
}

// ============================================
// LOGIN PAGE
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
  if (localStorage.getItem('rr_user')) {
    window.location.href = getBasePath() + 'index.html';
    return;
  }
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const loginFormVisible = document.getElementById('loginForm').style.display !== 'none';
    if (loginFormVisible) handleLogin();
    else handleRegister();
  });
}


// ============================================
// ADMIN DASHBOARD
// ============================================

const API = '../api/admin.php';
const adminData = JSON.parse(sessionStorage.getItem('rr_admin') || '{}');

function initAdminDashboard() {
  if (!sessionStorage.getItem('rr_admin')) {
    location.href = 'login.html';
    return;
  }

  document.getElementById('adminName').textContent = adminData.nama || 'Admin';
  document.getElementById('adminAv').textContent   = (adminData.nama || 'A')[0].toUpperCase();

  loadDashboard();
}

let currentCeritaId = null;
let editBalasanId   = null;
const titles = {
  dashboard: 'Dashboard',
  cerita:    'Kelola Cerita',
  dukungan:  'Kelola Dukungan',
  balasan:   'Balasan Admin',
  users:     'Kelola User'
};

async function apiFetch(url, options = {}) {
  options.headers = options.headers || {};
  options.headers['Content-Type']  = 'application/json';
  options.headers['X-Admin-Auth']  = adminData.id || '';
  return fetch(url, options);
}

function go(page, el) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (el) el.classList.add('active');
  document.getElementById('pageTitle').textContent = titles[page] || page;
  closeSidebar();
  if      (page === 'dashboard') loadDashboard();
  else if (page === 'cerita')    loadCerita();
  else if (page === 'dukungan')  loadDukungan();
  else if (page === 'balasan')   loadBalasan();
  else if (page === 'users')     loadUsers();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sbOverlay').classList.toggle('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sbOverlay').classList.remove('show');
}

function esc(s) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(s || ''));
  return d.innerHTML;
}

function ago(d) {
  const diff = Math.floor((new Date() - new Date(d)) / 1000);
  if (diff < 60)    return 'baru saja';
  if (diff < 3600)  return Math.floor(diff / 60) + ' mnt lalu';
  if (diff < 86400) return Math.floor(diff / 3600) + ' jam lalu';
  return Math.floor(diff / 86400) + ' hari lalu';
}

function badgeP(p)  { return `<span class="badge b-${p}">${p}</span>`; }
function badgePr(p) {
  return p === 'publik'
    ? '<span class="badge b-publik">🌍 Publik</span>'
    : '<span class="badge b-anonim">🔒 Anonim</span>';
}

// ===== DASHBOARD =====
async function loadDashboard() {
  const r = await apiFetch(API + '?action=stats');
  const j = await r.json();
  if (!j.success) return;
  const d = j.data;
  document.getElementById('s-cerita').textContent   = d.total_cerita;
  document.getElementById('s-publik').textContent   = d.cerita_publik;
  document.getElementById('s-anonim').textContent   = d.cerita_anonim;
  document.getElementById('s-dukungan').textContent = d.total_dukungan;
  document.getElementById('s-likes').textContent    = d.total_likes;
  document.getElementById('s-users').textContent    = d.total_users;

  const cb = document.getElementById('chartBars');
  if (d.chart && d.chart.length) {
    const mx = Math.max(...d.chart.map(c => parseInt(c.total)), 1);
    cb.innerHTML = d.chart.map(c => {
      const h = Math.max(6, Math.round(parseInt(c.total) / mx * 80));
      return `<div class="chart-col">
        <div class="chart-bar" style="height:${h}px" title="${c.total} cerita"></div>
        <div class="chart-lbl">${c.tgl.slice(5)}</div>
      </div>`;
    }).join('');
  } else {
    cb.innerHTML = '<span style="color:#ddd;font-size:0.82rem">Belum ada data minggu ini</span>';
  }

  const tb = document.getElementById('tb-recent');
  if (!d.terbaru.length) {
    tb.innerHTML = '<tr class="empty-row"><td colspan="6">Belum ada cerita</td></tr>';
    return;
  }
  tb.innerHTML = d.terbaru.map(c => `<tr>
    <td><strong style="color:#880e4f">${esc(c.judul || '(tanpa judul)')}</strong></td>
    <td>${esc(c.nama_panggilan)}</td>
    <td>${badgeP(c.perasaan)}</td>
    <td>${badgePr(c.privasi)}</td>
    <td style="color:#bbb;font-size:0.8rem">${ago(c.created_at)}</td>
    <td><button class="btn-xs btn-view" onclick="bukaDetail(${c.id})">👁 Lihat</button></td>
  </tr>`).join('');
}

// ===== CERITA =====
async function loadCerita() {
  const search   = document.getElementById('srCerita')?.value  || '';
  const privasi  = document.getElementById('flPrivasi')?.value  || '';
  const perasaan = document.getElementById('flPerasaan')?.value || '';
  const r  = await apiFetch(`${API}?action=get_cerita&search=${encodeURIComponent(search)}&privasi=${privasi}&perasaan=${perasaan}`);
  const j  = await r.json();
  const tb = document.getElementById('tb-cerita');
  if (!j.success || !j.data.length) {
    tb.innerHTML = '<tr class="empty-row"><td colspan="10">Tidak ada cerita ditemukan</td></tr>';
    return;
  }
  tb.innerHTML = j.data.map((c, i) => `<tr>
    <td style="color:#ddd">${i + 1}</td>
    <td><strong style="color:#3d0020;font-size:0.85rem">${esc(c.judul || '(tanpa judul)')}</strong></td>
    <td>${esc(c.nama_panggilan)}</td>
    <td style="color:#bbb;font-size:0.75rem">${esc(c.user_email || '–')}</td>
    <td>${badgeP(c.perasaan)}</td>
    <td>${badgePr(c.privasi)}</td>
    <td>${c.likes}</td>
    <td>${c.dukungan_count}</td>
    <td style="color:#bbb;font-size:0.78rem;white-space:nowrap">${ago(c.created_at)}</td>
    <td style="white-space:nowrap">
      <button class="btn-xs btn-view" onclick="bukaDetail(${c.id})">👁</button>
      <button class="btn-xs btn-del" onclick="hapusCerita(${c.id},this)" style="margin-left:4px">🗑</button>
    </td>
  </tr>`).join('');
}

// ===== DUKUNGAN =====
async function loadDukungan() {
  const r  = await apiFetch(API + '?action=get_dukungan');
  const j  = await r.json();
  const tb = document.getElementById('tb-dukungan');
  if (!j.success || !j.data.length) {
    tb.innerHTML = '<tr class="empty-row"><td colspan="7">Belum ada dukungan</td></tr>';
    return;
  }
  tb.innerHTML = j.data.map((d, i) => `<tr>
    <td style="color:#ddd">${i + 1}</td>
    <td><strong>${esc(d.nama || 'Anonim')}</strong></td>
    <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(d.isi)}</td>
    <td style="color:#880e4f;font-size:0.78rem">${esc(d.cerita_judul || '–')}</td>
    <td>${d.is_admin == 1 ? '<span class="badge b-admin">👑 Admin</span>' : '<span class="badge b-anonim">User</span>'}</td>
    <td style="color:#bbb;font-size:0.78rem">${ago(d.created_at)}</td>
    <td><button class="btn-xs btn-del" onclick="hapusDukungan(${d.id},this)">🗑</button></td>
  </tr>`).join('');
}

// ===== BALASAN ADMIN =====
async function loadBalasan() {
  const grid  = document.getElementById('balasanGrid');
  const empty = document.getElementById('balasan-empty');
  const count = document.getElementById('balasan-count');
  grid.innerHTML = '<p style="color:#ddd;font-size:0.85rem;text-align:center;padding:24px">Memuat...</p>';
  empty.classList.add('hidden');

  const r = await apiFetch(API + '?action=get_balasan_admin');
  const j = await r.json();

  if (!j.success || !j.data.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    count.textContent = '0 balasan';
    return;
  }

  count.textContent = j.data.length + ' balasan';
  grid.innerHTML = j.data.map(d => `
    <div class="balasan-card" id="balasan-card-${d.id}">
      <div class="balasan-card-header">
        <div class="balasan-card-title" title="${esc(d.cerita_judul || '(tanpa judul)')}">
          📝 ${esc(d.cerita_judul || '(tanpa judul)')}
        </div>
        <div class="balasan-card-actions">
          <button class="btn-xs btn-edit" onclick="bukaEdit(${d.id}, \`${esc(d.isi).replace(/\`/g, '\\`')}\`)">✏️</button>
          <button class="btn-xs btn-del" onclick="hapusBalasan(${d.id})">🗑</button>
        </div>
      </div>
      <div class="balasan-card-penulis">
        Untuk cerita oleh: <strong>${esc(d.cerita_penulis || 'Anonim')}</strong>
        ${badgePr(d.cerita_privasi || 'publik')}
      </div>
      <div class="balasan-card-isi" id="balasan-isi-${d.id}">${esc(d.isi)}</div>
      <div class="balasan-card-time">👑 Admin • ${ago(d.created_at)}</div>
    </div>
  `).join('');
}

function bukaEdit(id, isi) {
  editBalasanId = id;
  document.getElementById('editTa').value = isi;
  document.getElementById('editModalBg').classList.add('open');
  setTimeout(() => document.getElementById('editTa').focus(), 100);
}

function closeEditModal(e) {
  if (!e || e.target === document.getElementById('editModalBg')) {
    document.getElementById('editModalBg').classList.remove('open');
    editBalasanId = null;
  }
}

async function simpanEdit() {
  const isi = document.getElementById('editTa').value.trim();
  if (!isi) { alert('Isi balasan tidak boleh kosong!'); return; }
  const btn = document.getElementById('btnSimpanEdit');
  btn.disabled = true; btn.textContent = 'Menyimpan...';

  const r = await apiFetch(API + '?action=edit_balasan', {
    method: 'POST',
    body: JSON.stringify({ id: editBalasanId, isi })
  });
  const j = await r.json();
  btn.disabled = false; btn.textContent = 'Simpan';

  if (j.success) {
    const isiEl = document.getElementById('balasan-isi-' + editBalasanId);
    if (isiEl) isiEl.textContent = isi;
    document.getElementById('editModalBg').classList.remove('open');
    editBalasanId = null;
  } else {
    alert('Gagal menyimpan: ' + (j.message || 'Error'));
  }
}

async function hapusBalasan(id) {
  if (!confirm('Hapus balasan ini?')) return;
  const r = await apiFetch(API + '?action=hapus_dukungan', { method: 'POST', body: JSON.stringify({ id }) });
  const j = await r.json();
  if (j.success) {
    const card = document.getElementById('balasan-card-' + id);
    if (card) card.remove();
    const remaining = document.querySelectorAll('.balasan-card').length;
    document.getElementById('balasan-count').textContent = remaining + ' balasan';
    if (remaining === 0) document.getElementById('balasan-empty').classList.remove('hidden');
  } else {
    alert('Gagal menghapus');
  }
}

// ===== USERS =====
async function loadUsers() {
  const r  = await apiFetch(API + '?action=get_users');
  const j  = await r.json();
  const tb = document.getElementById('tb-users');
  if (!j.success || !j.data.length) {
    tb.innerHTML = '<tr class="empty-row"><td colspan="6">Belum ada user</td></tr>';
    return;
  }
  tb.innerHTML = j.data.map((u, i) => `<tr>
    <td style="color:#ddd">${i + 1}</td>
    <td><strong style="color:#3d0020">${esc(u.nama_panggilan || 'Anonim')}</strong></td>
    <td style="color:#bbb;font-size:0.82rem">${esc(u.email)}</td>
    <td><span class="badge b-publik">${u.jumlah_cerita} cerita</span></td>
    <td style="color:#bbb;font-size:0.78rem">${ago(u.created_at)}</td>
    <td><button class="btn-xs btn-del" onclick="hapusUser(${u.id},this)">🗑</button></td>
  </tr>`).join('');
}

// ===== DETAIL CERITA =====
async function bukaDetail(id) {
  currentCeritaId = id;
  document.getElementById('modalTitle').textContent = 'Memuat...';
  document.getElementById('modalMeta').innerHTML    = '';
  document.getElementById('modalIsi').innerHTML     = '<span style="color:#ddd">Memuat cerita...</span>';
  document.getElementById('dukList').innerHTML      = '';
  document.getElementById('replyTa').value          = '';
  document.getElementById('modalBg').classList.add('open');

  const r = await apiFetch(API + '?action=get_detail&id=' + id);
  const j = await r.json();
  if (!j.success) { document.getElementById('modalIsi').textContent = 'Gagal memuat.'; return; }
  const c = j.data;

  document.getElementById('modalTitle').textContent = c.judul || '(Tanpa Judul)';
  document.getElementById('modalMeta').innerHTML    = `${badgeP(c.perasaan)} ${badgePr(c.privasi)} <span style="color:#bbb;font-size:0.8rem">oleh <strong>${esc(c.nama_panggilan)}</strong></span>`;
  document.getElementById('modalIsi').textContent   = c.isi;
  document.getElementById('modalStats').innerHTML   = `<span>❤️ ${c.likes} suka</span><span>💬 ${c.dukungan.length} dukungan</span><span style="color:#bbb">📧 ${esc(c.user_email || '–')}</span>`;

  const dl = document.getElementById('dukList');
  if (!c.dukungan.length) {
    dl.innerHTML = '<p style="color:#ddd;font-size:0.82rem;text-align:center;padding:8px 0">Belum ada dukungan</p>';
  } else {
    dl.innerHTML = c.dukungan.map(d => {
      const isA = d.is_admin == 1;
      return `<div class="duk-item">
        <div class="duk-av ${isA ? 'admin-av-d' : 'user-av-d'}">${isA ? '👑' : (d.nama || 'A')[0].toUpperCase()}</div>
        <div class="duk-bubble ${isA ? 'admin-bubble' : ''}">
          <div class="duk-name">${esc(d.nama || 'Anonim')}${isA ? ' <span class="badge b-admin" style="font-size:0.6rem">Admin</span>' : ''}</div>
          <div class="duk-text">${esc(d.isi)}</div>
          <div class="duk-time">${ago(d.created_at)}</div>
        </div>
      </div>`;
    }).join('');
  }
}

async function kirimBalasan() {
  const isi = document.getElementById('replyTa').value.trim();
  if (!isi) { alert('Tulis balasan dulu!'); return; }
  const btn = document.getElementById('btnKirim');
  btn.disabled = true; btn.textContent = 'Mengirim...';

  const r = await apiFetch(API + '?action=balas', {
    method: 'POST',
    body: JSON.stringify({ cerita_id: currentCeritaId, isi })
  });
  const j = await r.json();
  btn.disabled = false; btn.textContent = 'Kirim Balasan';

  if (j.success) {
    document.getElementById('replyTa').value = '';
    const dl    = document.getElementById('dukList');
    const d     = j.data;
    const newEl = document.createElement('div');
    newEl.className = 'duk-item';
    newEl.innerHTML = `<div class="duk-av admin-av-d">👑</div>
      <div class="duk-bubble admin-bubble">
        <div class="duk-name">Admin <span class="badge b-admin" style="font-size:0.6rem">Admin</span></div>
        <div class="duk-text">${esc(d.isi)}</div>
        <div class="duk-time">baru saja</div>
      </div>`;
    const emptyMsg = dl.querySelector('p');
    if (emptyMsg) emptyMsg.remove();
    dl.appendChild(newEl);
    const statsEl = document.getElementById('modalStats');
    if (statsEl) {
      const match = statsEl.innerHTML.match(/💬 (\d+)/);
      if (match) statsEl.innerHTML = statsEl.innerHTML.replace(/💬 \d+/, '💬 ' + (parseInt(match[1]) + 1));
    }
  } else {
    alert('Gagal kirim: ' + (j.message || 'Error'));
  }
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modalBg')) {
    document.getElementById('modalBg').classList.remove('open');
  }
}

// ===== HAPUS =====
async function hapusCerita(id, btn) {
  if (!confirm('Hapus cerita ini secara permanen?')) return;
  const r = await apiFetch(API + '?action=hapus_cerita', { method: 'POST', body: JSON.stringify({ id }) });
  const j = await r.json();
  if (j.success) btn.closest('tr').remove(); else alert('Gagal menghapus');
}

async function hapusUser(id, btn) {
  if (!confirm('Hapus user ini?')) return;
  const r = await apiFetch(API + '?action=hapus_user', { method: 'POST', body: JSON.stringify({ id }) });
  const j = await r.json();
  if (j.success) btn.closest('tr').remove(); else alert('Gagal menghapus');
}

async function hapusDukungan(id, btn) {
  if (!confirm('Hapus dukungan ini?')) return;
  const r = await apiFetch(API + '?action=hapus_dukungan', { method: 'POST', body: JSON.stringify({ id }) });
  const j = await r.json();
  if (j.success) btn.closest('tr').remove(); else alert('Gagal menghapus');
}

// ===== LOGOUT =====
async function doLogout() {
  if (!confirm('Yakin ingin logout?')) return;
  await apiFetch(API + '?action=logout');
  sessionStorage.removeItem('rr_admin');
  location.href = 'login.html';
}