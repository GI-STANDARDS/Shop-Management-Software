const { getDatabase } = require('../../config/database');

const suppliersModel = {
  findAll({ search, page = 1, limit = 20 }) {
    const db = getDatabase();
    let where = '';
    const params = [];
    if (search) {
      where = 'WHERE (s.name LIKE ? OR s.contact_person LIKE ? OR s.phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    const offset = (page - 1) * limit;
    const count = db.prepare(`SELECT COUNT(*) as total FROM suppliers s ${where}`).get(...params);
    const rows = db.prepare(`SELECT s.* FROM suppliers s ${where} ORDER BY s.name ASC LIMIT ? OFFSET ?`).all(...params, limit, offset);
    return { rows, total: count.total, page, limit };
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  },

  create(data) {
    const db = getDatabase();
    const r = db.prepare('INSERT INTO suppliers (name, contact_person, phone, email, address, gst_number, payment_terms) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(data.name, data.contact_person || null, data.phone || null, data.email || null, data.address || null, data.gst_number || null, data.payment_terms || null);
    return r.lastInsertRowid;
  },

  update(id, data) {
    const db = getDatabase();
    const fields = []; const params = [];
    for (const k of ['name', 'contact_person', 'phone', 'email', 'address', 'gst_number', 'payment_terms', 'is_active']) {
      if (data[k] !== undefined) { fields.push(`${k} = ?`); params.push(data[k]); }
    }
    if (fields.length) { params.push(id); db.prepare(`UPDATE suppliers SET ${fields.join(', ')} WHERE id = ?`).run(...params); }
  },

  delete(id) {
    const db = getDatabase();
    db.prepare('UPDATE suppliers SET is_active = 0 WHERE id = ?').run(id);
  },
};

module.exports = suppliersModel;
