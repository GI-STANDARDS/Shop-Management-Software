const { getDatabase } = require('../../config/database');
const bcrypt = require('bcryptjs');

module.exports = {
  findAll({ search, role_id, is_active, page = 1, limit = 20 }) {
    const db = getDatabase();
    const conditions = []; const params = [];
    if (search) { conditions.push('(u.full_name LIKE ? OR u.username LIKE ?)'); const s = `%${search}%`; params.push(s, s); }
    if (role_id) { conditions.push('u.role_id = ?'); params.push(role_id); }
    if (is_active !== undefined) { conditions.push('u.is_active = ?'); params.push(is_active); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    const count = db.prepare(`SELECT COUNT(*) as total FROM users u ${where}`).get(...params);
    const rows = db.prepare(`
      SELECT u.id, u.username, u.full_name, u.email, u.phone, u.role_id, r.name as role_name,
             u.shift, u.is_active, u.last_login, u.created_at
      FROM users u JOIN roles r ON u.role_id = r.id ${where}
      ORDER BY u.created_at DESC LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    return { rows, total: count.total, page, limit };
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare(`
      SELECT u.id, u.username, u.full_name, u.email, u.phone, u.role_id, r.name as role_name,
             u.shift, u.is_active, u.pin_code, u.last_login, u.created_at
      FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?
    `).get(id);
  },

  async create(data) {
    const db = getDatabase();
    const hash = await bcrypt.hash(data.password || 'password123', 12);
    const r = db.prepare('INSERT INTO users (username, password_hash, full_name, email, phone, role_id, shift, pin_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(data.username, hash, data.full_name, data.email || null, data.phone || null, data.role_id, data.shift || null, data.pin_code || null);
    return r.lastInsertRowid;
  },

  update(id, data) {
    const db = getDatabase();
    const fields = []; const params = [];
    const allowed = ['full_name', 'email', 'phone', 'role_id', 'shift', 'is_active', 'pin_code'];
    for (const k of allowed) {
      if (data[k] !== undefined) { fields.push(`${k} = ?`); params.push(data[k]); }
    }
    fields.push(`updated_at = datetime('now')`);
    if (fields.length > 1) { params.push(id); db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...params); }
  },
};
