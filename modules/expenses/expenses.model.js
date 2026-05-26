const { getDatabase } = require('../../config/database');

module.exports = {
  findAll({ from, to, category, page = 1, limit = 20 }) {
    const db = getDatabase();
    const conditions = []; const params = [];
    if (from) { conditions.push('e.expense_date >= ?'); params.push(from); }
    if (to) { conditions.push('e.expense_date <= ?'); params.push(to + ' 23:59:59'); }
    if (category) { conditions.push('e.category = ?'); params.push(category); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    const count = db.prepare(`SELECT COUNT(*) as total FROM expenses e ${where}`).get(...params);
    const rows = db.prepare(`
      SELECT e.*, u.full_name as created_by_name
      FROM expenses e LEFT JOIN users u ON e.user_id = u.id
      ${where} ORDER BY e.expense_date DESC LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    return { rows, total: count.total, page, limit };
  },

  create(data) {
    const db = getDatabase();
    const r = db.prepare('INSERT INTO expenses (category, amount, description, paid_to, payment_method, user_id, expense_date) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(data.category, data.amount, data.description || null, data.paid_to || null, data.payment_method || 'cash', data.user_id, data.expense_date || new Date().toISOString());
    return r.lastInsertRowid;
  },

  getCategories() {
    const db = getDatabase();
    return db.prepare('SELECT DISTINCT category FROM expenses ORDER BY category').all();
  },

  getSummary({ from, to }) {
    const db = getDatabase();
    const params = [];
    let where = '';
    if (from) { where += 'AND e.expense_date >= ? '; params.push(from); }
    if (to) { where += 'AND e.expense_date <= ? '; params.push(to + ' 23:59:59'); }
    return db.prepare(`
      SELECT category, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
      FROM expenses e WHERE 1=1 ${where}
      GROUP BY category ORDER BY total DESC
    `).all(...params);
  },
};
