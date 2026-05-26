const Store = {
  _state: {
    user: null,
    cart: [],
    theme: localStorage.getItem('theme') || 'light',
    settings: {},
    notifications: [],
  },

  _listeners: {},

  get(key) {
    return this._state[key];
  },

  set(key, value) {
    this._state[key] = value;
    this._notify(key, value);
  },

  on(key, fn) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
  },

  off(key, fn) {
    if (!this._listeners[key]) return;
    this._listeners[key] = this._listeners[key].filter(f => f !== fn);
  },

  _notify(key, value) {
    (this._listeners[key] || []).forEach(fn => fn(value));
  },
};
