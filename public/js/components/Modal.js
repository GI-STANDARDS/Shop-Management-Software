class Modal {
  constructor(options = {}) {
    this.options = { title: '', size: '', ...options };
    this.overlay = null;
    this.modal = null;
    this._resolve = null;
    this._reject = null;
  }

  open(content) {
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;

      this.overlay = document.createElement('div');
      this.overlay.className = 'modal-overlay';
      const sizeClass = this.options.size === 'lg' ? ' modal-lg' : this.options.size === 'xl' ? ' modal-xl' : this.options.size === 'sm' ? ' modal-sm' : '';
      this.overlay.innerHTML = '<div class="modal' + sizeClass + '">' +
        '<div class="modal-header"><h3>' + escapeHtml(this.options.title) + '</h3><button class="modal-close" data-close aria-label="Close"><svg data-lucide="x" style="width:18px;height:18px"></svg></button></div>' +
        '<div class="modal-body">' + content + '</div>' +
        '<div class="modal-footer" data-footer></div></div>';
      document.body.appendChild(this.overlay);

      const closeBtn = this.overlay.querySelector('[data-close]');
      if (closeBtn) closeBtn.addEventListener('click', () => this.close());

      this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });

      this._keyHandler = (e) => { if (e.key === 'Escape') this.close(); };
      document.addEventListener('keydown', this._keyHandler);

      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  setFooter(html) {
    if (this.overlay) {
      this.overlay.querySelector('[data-footer]').innerHTML = html;
    }
  }

  close(result = null) {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
      if (this._resolve) this._resolve(result);
    }
  }
}
