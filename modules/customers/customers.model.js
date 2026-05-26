const { getDatabase } = require('../../config/database');

const customersModel = {
  findAll({ search, page = 1, limit = 20 }) {
    const db = getDatabase();
    let where = ''; const params = [];
    if (search) { where = 'WHERE (c.name LIKE ? OR c.phone LIKE ?)'; const s = `%${search}%`; params.push(s, s); }
    const offset = (page - 1) * limit;
    const count = db.prepare(`SELECT COUNT(*) as total FROM customers c ${where}`).get(...params);
    const rows = db.prepare(`SELECT c.* FROM customers c ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
    return { rows, total: count.total, page, limit };
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  },

  findByPhone(phone) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone);
  },

  create(data) {
    const db = getDatabase();
    const r = db.prepare('INSERT INTO customers (name, phone, email, address, gst_number, credit_limit) VALUES (?, ?, ?, ?, ?, ?)')
      .run(data.name, data.phone || null, data.email || null, data.address || null, data.gst_number || null, data.credit_limit || 0);
    return r.lastInsertRowid;
  },

  update(id, data) {
    const db = getDatabase();
    const fields = []; const params = [];
    for (const k of ['name', 'phone', 'email', 'address', 'gst_number', 'credit_limit', 'is_active']) {
      if (data[k] !== undefined) { fields.push(`${k} = ?`); params.push(data[k]); }
    }
    if (data.total_purchases !== undefined) { fields.push('total_purchases = total_purchases + ?'); params.push(data.total_purchases); }
    if (data.loyalty_points !== undefined) { fields.push('loyalty_points = loyalty_points + ?'); params.push(data.loyalty_points); }
    if (fields.length) { params.push(id); db.prepare(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`).run(...params); }
  },

  getPurchaseHistory(id, { page = 1, limit = 10 }) {
    const db = getDatabase();
    const offset = (page - 1) * limit;
    const count = db.prepare('SELECT COUNT(*) as total FROM sales WHERE customer_id = ?').get(id);
    const rows = db.prepare('SELECT * FROM sales WHERE customer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(id, limit, offset);
    return { rows, total: count.total, page, limit };
  },
};

module.exports = customersModel;
