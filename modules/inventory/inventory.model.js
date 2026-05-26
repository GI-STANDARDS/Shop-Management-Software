const { getDatabase } = require('../../config/database');

const inventoryModel = {
  getStock(productId) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM current_stock WHERE product_id = ?').get(productId);
  },

  getAllStock({ page = 1, limit = 20, low_stock, out_of_stock, search }) {
    const db = getDatabase();
    const conditions = [];
    const params = [];

    if (low_stock === 'true') {
      conditions.push('cs.quantity <= p.min_stock_level');
    }
    if (out_of_stock === 'true') {
      conditions.push('COALESCE(cs.quantity, 0) = 0');
    }
    if (search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const count = db.prepare(`SELECT COUNT(*) as total FROM products p LEFT JOIN current_stock cs ON p.id = cs.product_id ${where}`).get(...params);
    const rows = db.prepare(`
      SELECT p.id, p.name, p.sku, p.barcode, p.min_stock_level, p.selling_price, p.cost_price,
             COALESCE(cs.quantity, 0) as quantity,
             (COALESCE(cs.quantity, 0) * p.cost_price) as stock_value
      FROM products p
      LEFT JOIN current_stock cs ON p.id = cs.product_id
      ${where}
      ORDER BY cs.quantity ASC, p.name ASC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    return { rows, total: count.total, page, limit };
  },

  getMovements(productId, { page = 1, limit = 20 }) {
    const db = getDatabase();
    const offset = (page - 1) * limit;
    const count = db.prepare('SELECT COUNT(*) as total FROM inventory WHERE product_id = ?').get(productId);
    const rows = db.prepare(`
      SELECT i.*, u.full_name as created_by_name
      FROM inventory i
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.product_id = ?
      ORDER BY i.created_at DESC LIMIT ? OFFSET ?
    `).all(productId, limit, offset);
    return { rows, total: count.total, page, limit };
  },

  addMovement(productId, quantity, type, notes, userId, referenceId = null) {
    const db = getDatabase();
    return db.prepare(`
      INSERT INTO inventory (product_id, quantity, type, reference_id, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(productId, quantity, type, referenceId, notes || null, userId);
  },

  getProductLowStockCount() {
    const db = getDatabase();
    const r = db.prepare(`
      SELECT COUNT(*) as count FROM products p
      LEFT JOIN current_stock cs ON p.id = cs.product_id
      WHERE p.is_active = 1 AND COALESCE(cs.quantity, 0) <= p.min_stock_level
    `).get();
    return r ? r.count : 0;
  },
};

module.exports = inventoryModel;
