function formatCurrency(amount) {
  const settings = Store.get('settings');
  const symbol = settings.currency_symbol || '$';
  return symbol + parseFloat(amount || 0).toFixed(2);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showToast(message, type = 'info') {
  const container = document.querySelector('.toast-container') || (() => {
    const el = document.createElement('div');
    el.className = 'toast-container';
    document.body.appendChild(el);
    return el;
  })();

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;

  const icons = { success: 'check-circle', error: 'alert-circle', warning: 'alert-triangle', info: 'info' };
  const iconName = icons[type] || 'info';

  toast.innerHTML = '<svg data-lucide="' + iconName + '" style="width:18px;height:18px;flex-shrink:0"></svg><span>' + escapeHtml(message) + '</span>';
  container.appendChild(toast);

  if (typeof lucide !== 'undefined') lucide.createIcons();

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function getQueryParams() {
  const params = {};
  new URLSearchParams(window.location.search).forEach((v, k) => params[k] = v);
  return params;
}

function setQueryParams(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  const newUrl = window.location.pathname + (qs.toString() ? '?' + qs : '');
  window.history.replaceState({}, '', newUrl);
}
