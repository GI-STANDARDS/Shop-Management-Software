const { getDatabase } = require('../../config/database');
const bcrypt = require('bcryptjs');

async function seedTestData() {
  const db = getDatabase();

  db.prepare("INSERT OR IGNORE INTO roles (id, name, description, permissions) VALUES (1, 'admin', 'Admin', '[\"*\"]')").run();
  db.prepare("INSERT OR IGNORE INTO roles (id, name, description, permissions) VALUES (2, 'manager', 'Manager', '[\"products.*\",\"sales.*\"]')").run();
  db.prepare("INSERT OR IGNORE INTO roles (id, name, description, permissions) VALUES (3, 'cashier', 'Cashier', '[\"sales.create\"]')").run();

  const hash = await bcrypt.hash('test123', 10);
  db.prepare("INSERT OR IGNORE INTO users (id, username, password_hash, full_name, role_id) VALUES (1, 'admin', ?, 'Test Admin', 1)").run(hash);
  db.prepare("INSERT OR IGNORE INTO users (id, username, password_hash, full_name, role_id) VALUES (2, 'cashier', ?, 'Test Cashier', 3)").run(hash);

  db.prepare("INSERT OR IGNORE INTO categories (id, name) VALUES (1, 'Test Category')").run();

  db.prepare("INSERT OR IGNORE INTO products (id, name, sku, barcode, category_id, cost_price, selling_price, unit) VALUES (1, 'Test Product', 'TST001', '123456789', 1, 50, 100, 'pcs')").run();

  db.prepare("INSERT OR IGNORE INTO inventory (product_id, quantity, type, notes, created_by) VALUES (1, 100, 'purchase', 'Initial', 1)").run();
}

module.exports = { seedTestData };
