const { getDatabase } = require('../../config/database');

const salesModel = {
  findAll({ search, from, to, user_id, customer_id, status, page = 1, limit = 20 }) {
    const db = getDatabase();
    const conditions = []; const params = [];
    if (from) { conditions.push('s.created_at >= ?'); params.push(from); }
    if (to) { conditions.push('s.created_at <= ?'); params.push(to + ' 23:59:59'); }
    if (user_id) { conditions.push('s.user_id = ?'); params.push(user_id); }
    if (customer_id) { conditions.push('s.customer_id = ?'); params.push(customer_id); }
    if (status) { conditions.push('s.status = ?'); params.push(status); }
    if (search) { conditions.push('s.invoice_number LIKE ?'); params.push(`%${search}%`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    const count = db.prepare(`SELECT COUNT(*) as total FROM sales s ${where}`).get(...params);
    const rows = db.prepare(`
      SELECT s.*, u.full_name as user_name, c.name as customer_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      ${where} ORDER BY s.created_at DESC LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    return { rows, total: count.total, page, limit };
  },

  findById(id) {
    const db = getDatabase();
    const sale = db.prepare(`
      SELECT s.*, u.full_name as user_name, c.name as customer_name, c.phone as customer_phone
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `).get(id);
    if (sale) {
      sale.items = db.prepare(`
        SELECT si.*, p.name as product_name, p.sku as product_sku, p.barcode
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
      `).all(id);
    }
    return sale;
  },

  getLastInvoiceNumber() {
    const db = getDatabase();
    const row = db.prepare("SELECT invoice_number FROM sales ORDER BY id DESC LIMIT 1").get();
    return row ? row.invoice_number : null;
  },

  create(saleData, items) {
    const db = getDatabase();
    const insertSale = db.prepare(`
      INSERT INTO sales (invoice_number, customer_id, user_id, subtotal, tax_total,
                         discount_total, grand_total, amount_paid, change_amount,
                         payment_method, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertItem = db.prepare(`
      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, cost_price,
                              tax_amount, discount_amount, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertInventory = db.prepare(`
      INSERT INTO inventory (product_id, quantity, type, reference_id, created_by)
      VALUES (?, ?, 'sale', ?, ?)
    `);
    const updateCustomer = db.prepare(`
      UPDATE customers SET total_purchases = total_purchases + ?, loyalty_points = loyalty_points + ?
      WHERE id = ?
    `);

    const saleId = db.transaction(() => {
      const result = insertSale.run(
        saleData.invoice_number, saleData.customer_id || null, saleData.user_id,
        saleData.subtotal, saleData.tax_total, saleData.discount_total,
        saleData.grand_total, saleData.amount_paid, saleData.change_amount,
        saleData.payment_method, saleData.status || 'completed', saleData.notes || null
      );
      const newSaleId = result.lastInsertRowid;

      for (const item of items) {
        insertItem.run(newSaleId, item.product_id, item.quantity, item.unit_price,
          item.cost_price, item.tax_amount || 0, item.discount_amount || 0, item.total);
        insertInventory.run(item.product_id, item.quantity, newSaleId, saleData.user_id);
      }

      if (saleData.customer_id) {
        updateCustomer.run(saleData.grand_total, Math.floor(saleData.grand_total / 100),
          saleData.customer_id);
      }

      return newSaleId;
    })();

    return this.findById(saleId);
  },

  refund(saleId) {
    const db = getDatabase();
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId);
    if (!sale) return null;
    if (sale.status === 'refunded') return null;

    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleId);
    const restoreInventory = db.prepare(`
      INSERT INTO inventory (product_id, quantity, type, reference_id, created_by)
      VALUES (?, ?, 'return', ?, ?)
    `);

    db.transaction(() => {
      db.prepare("UPDATE sales SET status = 'refunded' WHERE id = ?").run(saleId);
      for (const item of items) {
        restoreInventory.run(item.product_id, item.quantity, saleId, sale.user_id);
      }
    })();

    return this.findById(saleId);
  },

  getTodaySummary() {
    const db = getDatabase();
    return db.prepare(`
      SELECT COUNT(*) as order_count,
             COALESCE(SUM(grand_total), 0) as total_sales,
             COALESCE(SUM(amount_paid - change_amount), 0) as total_collected,
             COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN amount_paid - change_amount ELSE 0 END), 0) as cash_collected,
             COALESCE(SUM(CASE WHEN payment_method = 'card' THEN amount_paid - change_amount ELSE 0 END), 0) as card_collected,
             COALESCE(SUM(CASE WHEN payment_method = 'upi' THEN amount_paid - change_amount ELSE 0 END), 0) as upi_collected
      FROM sales
      WHERE date(created_at) = date('now') AND status = 'completed'
    `).get();
  },

  getSalesByDateRange(from, to) {
    const db = getDatabase();
    return db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as order_count,
             COALESCE(SUM(grand_total), 0) as total_sales,
             COALESCE(SUM(amount_paid - change_amount), 0) as total_collected
      FROM sales
      WHERE date(created_at) BETWEEN ? AND ? AND status = 'completed'
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `).all(from, to);
  },
};

module.exports = salesModel;
