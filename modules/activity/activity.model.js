const { getDatabase } = require('../../config/database');

module.exports = {
  findAll({ user_id, action, from, to, page = 1, limit = 50 }) {
    const db = getDatabase();
    const conditions = []; const params = [];
    if (user_id) { conditions.push('a.user_id = ?'); params.push(user_id); }
    if (action) { conditions.push('a.action = ?'); params.push(action); }
    if (from) { conditions.push('a.created_at >= ?'); params.push(from); }
    if (to) { conditions.push('a.created_at <= ?'); params.push(to + ' 23:59:59'); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    const count = db.prepare(`SELECT COUNT(*) as total FROM activity_log a ${where}`).get(...params);
    const rows = db.prepare(`
      SELECT a.*, u.full_name as user_name
      FROM activity_log a LEFT JOIN users u ON a.user_id = u.id
      ${where} ORDER BY a.created_at DESC LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    return { rows, total: count.total, page, limit };
  },
};
