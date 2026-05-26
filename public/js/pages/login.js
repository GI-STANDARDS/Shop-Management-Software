document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('auth_token');
  if (token) window.location.href = '/app/dashboard';

  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      errorEl.textContent = 'Please fill in all fields';
      errorEl.style.display = 'block';
      return;
    }

    try {
      const data = await API.post('/auth/login', { username, password });
      const token = data.token;
      const user = data.user;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set cookie for server-side page auth (7 day expiry)
      document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Strict`;

      // Redirect based on role
      const role = user.role_name || user.role || 'cashier';
      if (role === 'cashier') {
        window.location.href = '/app/pos';
      } else {
        window.location.href = '/app/dashboard';
      }
    } catch (err) {
      errorEl.textContent = err.message || 'Login failed';
      errorEl.style.display = 'block';
    }
  });

  document.querySelectorAll('#loginForm input').forEach(el => {
    el.addEventListener('input', () => { errorEl.style.display = 'none'; });
  });
});
