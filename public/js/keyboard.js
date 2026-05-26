const Keyboard = {
  _handlers: {},
  _initialized: false,

  isInputFocused() {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (document.activeElement?.contentEditable === 'true') return true;
    return false;
  },

  pos: {
    selectedIndex: -1,
    onSelectionChange: null,
  },

  init() {
    if (this._initialized) return;
    this._initialized = true;

    document.addEventListener('keydown', (e) => {
      const key = e.key;
      const ctrl = e.ctrlKey;
      const meta = e.metaKey;
      const code = e.code;

      const handlerKey = ctrl ? `Ctrl+${key.toLowerCase()}` : key;
      const handler = this._handlers[handlerKey];

      if (!handler) return;
      if (e.repeat) return;

      if (handler.allowWhenTyping || !this.isInputFocused()) {
        e.preventDefault();
        handler.fn(e);
      }
    });
  },

  register(keyCombo, fn, allowWhenTyping = false) {
    this._handlers[keyCombo] = { fn, allowWhenTyping };
  },

  unregister(keyCombo) {
    delete this._handlers[keyCombo];
  },
};

document.addEventListener('DOMContentLoaded', () => {
  Keyboard.init();

  Keyboard.register('F1', () => { window.location.href = '/app/pos'; });
  Keyboard.register('F7', () => { window.location.href = '/app/dashboard'; });
  Keyboard.register('Ctrl+d', (e) => { Theme.toggle(); });
  Keyboard.register('Ctrl+,', (e) => { window.location.href = '/app/settings'; });
});
