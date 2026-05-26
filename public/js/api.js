const API = {
  baseUrl: '/api/v1',

  getToken() {
    return localStorage.getItem('auth_token');
  },

  async request(method, path, data = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (data) opts.body = JSON.stringify(data);

    const res = await fetch(`${this.baseUrl}${path}`, opts);
    const json = await res.json();

    if (!res.ok) {
      const msg = json?.error?.message || 'Request failed';
      throw new Error(msg);
    }

    return json.data;
  },

  get(path, params = {}) {
    const qs = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    return this.request('GET', path + (qs ? `?${qs}` : ''));
  },

  post(path, data) { return this.request('POST', path, data); },
  put(path, data) { return this.request('PUT', path, data); },
  delete(path) { return this.request('DELETE', path); },
};
