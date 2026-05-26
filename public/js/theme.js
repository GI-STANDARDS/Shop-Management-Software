const Theme = {
  init() {
    const saved = localStorage.getItem('theme') || 'light';
    this.set(saved);
  },

  getCurrent() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    Store.set('theme', theme);
    this._updateIcon(theme);
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  },

  toggle() {
    const current = this.getCurrent();
    this.set(current === 'light' ? 'dark' : 'light');
  },

  _updateIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
      const isDark = theme === 'dark';
      icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  },
};

document.addEventListener('DOMContentLoaded', () => Theme.init());
