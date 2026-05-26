const { getDatabase } = require('../../config/database');

const productsModel = {
  findAll({ search, category_id, supplier_id, is_active, page = 1, limit = 20 }) {
    const db = getDatabase();
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (category_id) {
      conditions.push('p.category_id = ?');
      params.push(category_id);
    }
    if (supplier_id) {
      conditions.push('p.supplier_id = ?');
      params.push(supplier_id);
    }
    if (is_active !== undefined) {
      conditions.push('p.is_active = ?');
      params.push(is_active);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const count = db.prepare(`SELECT COUNT(*) as total FROM products p ${where}`).get(...params);
    const rows = db.prepare(`
      SELECT p.*, c.name as category_name, s.name as supplier_name,
             COALESCE(cs.quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN current_stock cs ON p.id = cs.product_id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return { rows, total: count.total, page, limit };
  },

  findById(id) {
    const db = getDatabase();
    return db.prepare(`
      SELECT p.*, c.name as category_name, s.name as supplier_name,
             COALESCE(cs.quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN current_stock cs ON p.id = cs.product_id
      WHERE p.id = ?
    `).get(id);
  },

  findByBarcode(barcode) {
    const db = getDatabase();
    return db.prepare(`
      SELECT p.*, COALESCE(cs.quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN current_stock cs ON p.id = cs.product_id
      WHERE p.barcode = ? AND p.is_active = 1
    `).get(barcode);
  },

  create(data) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO products (name, sku, barcode, description, category_id, supplier_id,
                            cost_price, selling_price, tax_rate, discount_rate, unit,
                            min_stock_level, is_active, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.name, data.sku, data.barcode || null, data.description || null,
      data.category_id || null, data.supplier_id || null,
      data.cost_price || 0, data.selling_price || 0,
      data.tax_rate || 0, data.discount_rate || 0,
      data.unit || 'pcs', data.min_stock_level || 0,
      data.is_active !== undefined ? data.is_active : 1,
      data.image_url || null
    );
    return result.lastInsertRowid;
  },

  update(id, data) {
    const db = getDatabase();
    const fields = [];
    const params = [];

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        params.push(value);
      }
    }
    fields.push(`updated_at = datetime('now')`);
    params.push(id);

    db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  },

  delete(id) {
    const db = getDatabase();
    db.prepare(`UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ?`).run(id);
  },

  getLowStock() {
    const db = getDatabase();
    return db.prepare(`
      SELECT p.*, COALESCE(cs.quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN current_stock cs ON p.id = cs.product_id
      WHERE p.is_active = 1 AND COALESCE(cs.quantity, 0) <= p.min_stock_level
      ORDER BY cs.quantity ASC
      LIMIT 50
    `).all();
  },
};

module.exports = productsModel;
