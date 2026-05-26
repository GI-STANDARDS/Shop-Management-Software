const { getDatabase } = require('../../config/database');

module.exports = {
  dailySales(from, to) {
    const db = getDatabase();
    return db.prepare(`
      SELECT date(s.created_at) as date,
             COUNT(*) as order_count,
             COALESCE(SUM(s.grand_total), 0) as total_sales,
             COALESCE(SUM(s.tax_total), 0) as total_tax,
             COALESCE(SUM(s.discount_total), 0) as total_discount,
             COALESCE(SUM(si.cost_price * si.quantity), 0) as total_cost,
             COALESCE(SUM(si.total - si.cost_price * si.quantity), 0) as gross_profit
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      WHERE s.status = 'completed' AND date(s.created_at) BETWEEN ? AND ?
      GROUP BY date(s.created_at)
      ORDER BY date(s.created_at) ASC
    `).all(from, to);
  },

  profitLoss(from, to) {
    const db = getDatabase();
    const sales = db.prepare(`
      SELECT COALESCE(SUM(s.grand_total), 0) as total_revenue,
             COALESCE(SUM(si.cost_price * si.quantity), 0) as total_cost,
             COALESCE(SUM(si.total - si.cost_price * si.quantity), 0) as gross_profit,
             COALESCE(SUM(s.tax_total), 0) as total_tax_collected
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      WHERE s.status = 'completed' AND date(s.created_at) BETWEEN ? AND ?
    `).get(from, to);

    const expenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total_expenses
      FROM expenses
      WHERE date(expense_date) BETWEEN ? AND ?
    `).get(from, to);

    const purchaseCost = db.prepare(`
      SELECT COALESCE(SUM(grand_total), 0) as total_purchases
      FROM purchases
      WHERE date(created_at) BETWEEN ? AND ?
    `).get(from, to);

    return {
      ...sales,
      total_expenses: expenses.total_expenses,
      total_purchases: purchaseCost.total_purchases,
      net_profit: sales.gross_profit - expenses.total_expenses,
    };
  },

  topProducts(from, to, limit = 10) {
    const db = getDatabase();
    return db.prepare(`
      SELECT p.id, p.name, p.sku,
             SUM(si.quantity) as total_quantity,
             SUM(si.total) as total_revenue,
             SUM(si.total - si.cost_price * si.quantity) as total_profit
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed' AND date(s.created_at) BETWEEN ? AND ?
      GROUP BY p.id ORDER BY total_quantity DESC LIMIT ?
    `).all(from, to, limit);
  },

  expensesSummary(from, to) {
    const db = getDatabase();
    return db.prepare(`
      SELECT category, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE date(expense_date) BETWEEN ? AND ?
      GROUP BY category ORDER BY total DESC
    `).all(from, to);
  },
};
