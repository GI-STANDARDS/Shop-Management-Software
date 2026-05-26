const { getDatabase } = require('../../config/database');

module.exports = {
  getSummary() {
    const db = getDatabase();
    const today = db.prepare(`
      SELECT COUNT(*) as orders, COALESCE(SUM(grand_total), 0) as revenue,
             COALESCE(SUM(amount_paid - change_amount), 0) as collected
      FROM sales WHERE date(created_at) = date('now') AND status = 'completed'
    `).get();

    const lowStock = db.prepare(`
      SELECT COUNT(*) as count FROM products p
      LEFT JOIN current_stock cs ON p.id = cs.product_id
      WHERE p.is_active = 1 AND COALESCE(cs.quantity, 0) <= p.min_stock_level
    `).get();

    const activeUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_active = 1").get();
    const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE is_active = 1").get();

    return {
      today_orders: today.orders,
      today_revenue: today.revenue,
      today_collected: today.collected,
      low_stock_count: lowStock.count,
      active_users: activeUsers.count,
      total_products: totalProducts.count,
    };
  },

  getChartData(days = 7) {
    const db = getDatabase();
    return db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as orders,
             COALESCE(SUM(grand_total), 0) as revenue
      FROM sales
      WHERE date(created_at) >= date('now', ?) AND status = 'completed'
      GROUP BY date(created_at) ORDER BY date ASC
    `).all(`-${days} days`);
  },

  getRecentSales(limit = 10) {
    const db = getDatabase();
    return db.prepare(`
      SELECT s.id, s.invoice_number, s.grand_total, s.created_at,
             u.full_name as user_name, c.name as customer_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.created_at DESC LIMIT ?
    `).all(limit);
  },
};
