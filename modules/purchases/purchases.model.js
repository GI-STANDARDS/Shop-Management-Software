const { getDatabase } = require('../../config/database');

const purchasesModel = {
  findAll({ search, from, to, supplier_id, status, page = 1, limit = 20 }) {
    const db = getDatabase();
    const conditions = []; const params = [];
    if (from) { conditions.push('p.created_at >= ?'); params.push(from); }
    if (to) { conditions.push('p.created_at <= ?'); params.push(to + ' 23:59:59'); }
    if (supplier_id) { conditions.push('p.supplier_id = ?'); params.push(supplier_id); }
    if (status) { conditions.push('p.status = ?'); params.push(status); }
    if (search) { conditions.push('p.purchase_number LIKE ?'); params.push(`%${search}%`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    const count = db.prepare(`SELECT COUNT(*) as total FROM purchases p ${where}`).get(...params);
    const rows = db.prepare(`
      SELECT p.*, u.full_name as user_name, s.name as supplier_name
      FROM purchases p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN suppliers s ON p.supplier_id = s.id
      ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    return { rows, total: count.total, page, limit };
  },

  findById(id) {
    const db = getDatabase();
    const p = db.prepare(`SELECT p.*, u.full_name as user_name, s.name as supplier_name FROM purchases p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?`).get(id);
    if (p) {
      p.items = db.prepare(`SELECT pi.*, pr.name as product_name, pr.sku FROM purchase_items pi JOIN products pr ON pi.product_id = pr.id WHERE pi.purchase_id = ?`).all(id);
    }
    return p;
  },

  create(data, items) {
    const db = getDatabase();
    const insertPurchase = db.prepare(`INSERT INTO purchases (purchase_number, supplier_id, user_id, subtotal, tax_total, grand_total, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    const insertItem = db.prepare(`INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_cost, total) VALUES (?, ?, ?, ?, ?)`);
    const insertInventory = db.prepare(`INSERT INTO inventory (product_id, quantity, type, reference_id, created_by) VALUES (?, ?, 'purchase', ?, ?)`);

    const id = db.transaction(() => {
      const r = insertPurchase.run(data.purchase_number, data.supplier_id || null, data.user_id, data.subtotal, data.tax_total, data.grand_total, data.status || 'received', data.notes || null);
      const newId = r.lastInsertRowid;
      for (const item of items) {
        insertItem.run(newId, item.product_id, item.quantity, item.unit_cost, item.total);
        insertInventory.run(item.product_id, item.quantity, newId, data.user_id);
      }
      return newId;
    })();

    return this.findById(id);
  },
};

module.exports = purchasesModel;
