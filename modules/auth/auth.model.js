const { getDatabase } = require('../../config/database');

const authModel = {
  findByUsername(username) {
    const db = getDatabase();
    return db.prepare(`
      SELECT u.*, r.name as role_name, r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.username = ? AND u.is_active = 1
    `).get(username);
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare(`
      SELECT u.id, u.username, u.full_name, u.email, u.phone, u.role_id,
             r.name as role_name, u.shift, u.is_active, u.last_login
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `).get(id);
  },

  findByPin(pinCode) {
    const db = getDatabase();
    return db.prepare(`
      SELECT u.*, r.name as role_name, r.permissions
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.pin_code = ? AND u.is_active = 1
    `).get(pinCode);
  },

  updateLastLogin(id) {
    const db = getDatabase();
    db.prepare(`UPDATE users SET last_login = datetime('now') WHERE id = ?`).run(id);
  },

  updatePassword(id, hash) {
    const db = getDatabase();
    db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(hash, id);
  },
};

module.exports = authModel;
