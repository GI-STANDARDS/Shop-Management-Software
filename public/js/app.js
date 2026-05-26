document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('auth_token');
  if (!token && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
    return;
  }

  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      Store.set('user', user);
      const avatar = document.getElementById('userAvatar');
      const nameEl = document.getElementById('userName');
      const roleEl = document.getElementById('userRole');
      if (avatar) avatar.textContent = (user.full_name || user.username)[0].toUpperCase();
      if (nameEl) nameEl.textContent = user.full_name || user.username;
      if (roleEl) roleEl.textContent = user.role_name || user.role;

      // Set cookie if not already set (for server-side page auth)
      const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('auth_token='));
      if (!hasCookie && token) {
        document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Strict`;
      }
    } catch (e) { /* ignore */ }
  }

  try {
    const settings = await API.get('/settings');
    Store.set('settings', settings);
  } catch (e) { /* ignore */ }

  // Load dashboard summary and low stock badge
  try {
    const summary = await API.get('/dashboard/summary');
    const badge = document.getElementById('lowStockBadge');
    if (badge && summary.low_stock_count > 0) {
      badge.textContent = summary.low_stock_count;
      badge.style.display = 'inline';
    }
  } catch (e) { /* ignore */ }

  // Sidebar toggle with overlay support
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
      });
    }
  }

  // Clock
  function updateClock() {
    const el = document.getElementById('navbarDatetime');
    if (el) el.textContent = new Date().toLocaleString();
  }
  updateClock();
  setInterval(updateClock, 10000);

  // Sidebar collapse on double-click brand
  const brand = document.querySelector('.sidebar-brand');
  if (brand && window.innerWidth > 768) {
    brand.addEventListener('dblclick', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  // Set chart canvas backgrounds to match theme (prevents black boxes)
  function setChartCanvasBg(theme) {
    document.querySelectorAll('.chart-card canvas').forEach(c => {
      c.style.backgroundColor = theme === 'dark' ? '#141d33' : '#ffffff';
    });
  }
  setChartCanvasBg(localStorage.getItem('theme') || 'light');

  document.addEventListener('themechange', (e) => {
    setChartCanvasBg(e.detail?.theme || 'light');
  });
});
