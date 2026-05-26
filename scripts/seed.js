const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');
const { DEFAULT_ROLE_PERMISSIONS, ROLES } = require('../config/constants');

async function seed() {
  const db = getDatabase();

  logger.info('Seeding database...');

  // Roles with proper permission matrix
  const roles = [
    { id: 1, name: ROLES.ADMIN, description: 'Full system access', permissions: JSON.stringify(DEFAULT_ROLE_PERMISSIONS[ROLES.ADMIN]) },
    { id: 2, name: ROLES.MANAGER, description: 'Management and operational access', permissions: JSON.stringify(DEFAULT_ROLE_PERMISSIONS[ROLES.MANAGER]) },
    { id: 3, name: ROLES.CASHIER, description: 'POS and basic operations', permissions: JSON.stringify(DEFAULT_ROLE_PERMISSIONS[ROLES.CASHIER]) },
  ];

  const insertRole = db.prepare('INSERT OR IGNORE INTO roles (id, name, description, permissions) VALUES (?, ?, ?, ?)');
  for (const r of roles) insertRole.run(r.id, r.name, r.description, r.permissions);

  // Update existing roles if they already exist
  const updateRole = db.prepare('UPDATE roles SET permissions = ?, description = ? WHERE id = ?');
  for (const r of roles) updateRole.run(r.permissions, r.description, r.id);

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 12);
  db.prepare(`INSERT OR IGNORE INTO users (id, username, password_hash, full_name, email, role_id, pin_code)
    VALUES (1, 'admin', ?, 'Administrator', 'admin@store.com', 1, '1234')`).run(adminHash);

  // Demo users
  const cashierHash = await bcrypt.hash('cashier123', 12);
  db.prepare(`INSERT OR IGNORE INTO users (id, username, password_hash, full_name, email, role_id, pin_code)
    VALUES (2, 'cashier', ?, 'Demo Cashier', 'cashier@store.com', 3, '5678')`).run(cashierHash);

  const managerHash = await bcrypt.hash('manager123', 12);
  db.prepare(`INSERT OR IGNORE INTO users (id, username, password_hash, full_name, email, role_id, pin_code)
    VALUES (3, 'manager', ?, 'Demo Manager', 'manager@store.com', 2, '9012')`).run(managerHash);

  // Categories
  const categories = [
    { name: 'Beverages', description: 'Drinks and beverages' },
    { name: 'Snacks', description: 'Snack items' },
    { name: 'Groceries', description: 'Daily grocery items' },
    { name: 'Electronics', description: 'Electronic items' },
    { name: 'Stationery', description: 'Office and school supplies' },
  ];
  const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)');
  for (const c of categories) insertCat.run(c.name, c.description);

  // Demo Products
  const products = [
    { name: 'Coca Cola 500ml', sku: 'BEV001', barcode: '8901234567890', category_id: 1, cost_price: 25, selling_price: 40, unit: 'pcs', min_stock_level: 10 },
    { name: 'Pepsi 500ml', sku: 'BEV002', barcode: '8901234567891', category_id: 1, cost_price: 25, selling_price: 40, unit: 'pcs', min_stock_level: 10 },
    { name: 'Lays Classic Chips', sku: 'SNK001', barcode: '8901234567892', category_id: 2, cost_price: 15, selling_price: 25, unit: 'pcs', min_stock_level: 20 },
    { name: 'Bourbon Biscuits', sku: 'SNK002', barcode: '8901234567893', category_id: 2, cost_price: 20, selling_price: 35, unit: 'pcs', min_stock_level: 15 },
    { name: 'Basmati Rice 1kg', sku: 'GRC001', barcode: '8901234567894', category_id: 3, cost_price: 80, selling_price: 120, unit: 'pcs', min_stock_level: 5 },
    { name: 'Cooking Oil 1L', sku: 'GRC002', barcode: '8901234567895', category_id: 3, cost_price: 140, selling_price: 190, unit: 'pcs', min_stock_level: 5 },
    { name: 'USB Cable 1m', sku: 'ELC001', barcode: '8901234567896', category_id: 4, cost_price: 50, selling_price: 99, unit: 'pcs', min_stock_level: 10 },
    { name: 'Notebook A4 80pg', sku: 'STN001', barcode: '8901234567897', category_id: 5, cost_price: 30, selling_price: 55, unit: 'pcs', min_stock_level: 20 },
    { name: 'Pen Pack 10 Blue', sku: 'STN002', barcode: '8901234567898', category_id: 5, cost_price: 25, selling_price: 49, unit: 'pcs', min_stock_level: 15 },
    { name: 'Water Bottle 1L', sku: 'BEV003', barcode: '8901234567899', category_id: 1, cost_price: 12, selling_price: 20, unit: 'pcs', min_stock_level: 20 },
    { name: 'Milk 1L Full Cream', sku: 'BEV004', barcode: '8901234567800', category_id: 1, cost_price: 40, selling_price: 55, unit: 'pcs', min_stock_level: 10 },
    { name: 'Orange Juice 1L', sku: 'BEV005', barcode: '8901234567801', category_id: 1, cost_price: 55, selling_price: 80, unit: 'pcs', min_stock_level: 8 },
    { name: 'Wheat Bread 400g', sku: 'GRC003', barcode: '8901234567802', category_id: 3, cost_price: 22, selling_price: 35, unit: 'pcs', min_stock_level: 10 },
    { name: 'Eggs 12 Pack', sku: 'GRC004', barcode: '8901234567803', category_id: 3, cost_price: 65, selling_price: 90, unit: 'pcs', min_stock_level: 8 },
    { name: 'Potato Chips Family Pack', sku: 'SNK003', barcode: '8901234567804', category_id: 2, cost_price: 40, selling_price: 65, unit: 'pcs', min_stock_level: 10 },
    { name: 'Wireless Mouse', sku: 'ELC002', barcode: '8901234567805', category_id: 4, cost_price: 150, selling_price: 299, unit: 'pcs', min_stock_level: 5, tax_rate: 10 },
    { name: 'HDMI Cable 1.5m', sku: 'ELC003', barcode: '8901234567806', category_id: 4, cost_price: 80, selling_price: 149, unit: 'pcs', min_stock_level: 8, tax_rate: 10 },
    { name: 'Sticky Notes 3x3', sku: 'STN003', barcode: '8901234567807', category_id: 5, cost_price: 15, selling_price: 29, unit: 'pcs', min_stock_level: 20 },
    { name: 'Marker Set 4 Colors', sku: 'STN004', barcode: '8901234567808', category_id: 5, cost_price: 45, selling_price: 79, unit: 'pcs', min_stock_level: 10 },
    { name: 'Paper Clips 100pk', sku: 'STN005', barcode: '8901234567809', category_id: 5, cost_price: 8, selling_price: 15, unit: 'pcs', min_stock_level: 30 },
    { name: 'Green Tea 20 Bags', sku: 'BEV006', barcode: '8901234567810', category_id: 1, cost_price: 60, selling_price: 95, unit: 'pcs', min_stock_level: 8 },
    { name: 'Instant Noodles Pack', sku: 'GRC005', barcode: '8901234567811', category_id: 3, cost_price: 12, selling_price: 20, unit: 'pcs', min_stock_level: 30 },
    { name: 'Chocolate Bar 50g', sku: 'SNK004', barcode: '8901234567812', category_id: 2, cost_price: 30, selling_price: 50, unit: 'pcs', min_stock_level: 15 },
    { name: 'Toothpaste 100g', sku: 'GRC006', barcode: '8901234567813', category_id: 3, cost_price: 45, selling_price: 75, unit: 'pcs', min_stock_level: 10 },
    { name: 'Shampoo 200ml', sku: 'GRC007', barcode: '8901234567814', category_id: 3, cost_price: 90, selling_price: 145, unit: 'pcs', min_stock_level: 8 },
    { name: 'LED Bulb 9W', sku: 'ELC004', barcode: '8901234567815', category_id: 4, cost_price: 35, selling_price: 65, unit: 'pcs', min_stock_level: 12 },
    { name: 'Extension Cord 3m', sku: 'ELC005', barcode: '8901234567816', category_id: 4, cost_price: 120, selling_price: 199, unit: 'pcs', min_stock_level: 5 },
    { name: 'Office Tape Pack 6', sku: 'STN006', barcode: '8901234567817', category_id: 5, cost_price: 20, selling_price: 35, unit: 'pcs', min_stock_level: 15 },
    { name: 'A4 Printer Paper 500', sku: 'STN007', barcode: '8901234567818', category_id: 5, cost_price: 180, selling_price: 275, unit: 'box', min_stock_level: 3 },
    { name: 'Hand Sanitizer 50ml', sku: 'GRC008', barcode: '8901234567819', category_id: 3, cost_price: 28, selling_price: 49, unit: 'pcs', min_stock_level: 15 },
  ];

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (name, sku, barcode, category_id, cost_price, selling_price, unit, min_stock_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of products) {
    insertProduct.run(p.name, p.sku, p.barcode, p.category_id, p.cost_price, p.selling_price, p.unit, p.min_stock_level);
    const prod = db.prepare('SELECT id FROM products WHERE sku = ?').get(p.sku);
    if (prod) {
      db.prepare('INSERT INTO inventory (product_id, quantity, type, notes, created_by) VALUES (?, 50, ?, ?, 1)')
        .run(prod.id, 'purchase', `Initial stock for ${p.name}`);
    }
  }

  // Normalize legacy sale quantities (old code stored negative; trigger now expects positive)
  db.exec(`UPDATE inventory SET quantity = ABS(quantity) WHERE type = 'sale' AND quantity < 0`);

  // Sync current_stock from inventory ledger (handles both new and existing records)
  db.exec(`
    DELETE FROM current_stock;
    INSERT INTO current_stock (product_id, quantity, updated_at)
    SELECT product_id,
      SUM(CASE WHEN type IN ('purchase', 'return', 'restock') THEN quantity WHEN type = 'sale' THEN -quantity ELSE quantity END),
      datetime('now')
    FROM inventory
    GROUP BY product_id;
  `);

  // Demo customers
  const customers = [
    { name: 'Walk-in Customer', phone: '0000000000' },
    { name: 'John Doe', phone: '9876543210', email: 'john@email.com' },
    { name: 'Jane Smith', phone: '9876543211', email: 'jane@email.com' },
  ];
  const insertCust = db.prepare('INSERT OR IGNORE INTO customers (name, phone, email) VALUES (?, ?, ?)');
  for (const c of customers) insertCust.run(c.name, c.phone, c.email || null);

  // Default settings
  const settings = [
    ['store_name', 'My Store'],
    ['store_address', '123 Main Street'],
    ['store_phone', '+1-234-567-8900'],
    ['store_email', 'info@mystore.com'],
    ['currency_symbol', '$'],
    ['tax_label', 'Tax'],
    ['default_tax_rate', '0'],
    ['receipt_footer', 'Thank you for your purchase!'],
    ['low_stock_threshold', '10'],
    ['theme', 'light'],
  ];
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const [k, v] of settings) insertSetting.run(k, v);

  logger.info('Database seeded successfully!');
  logger.info('');
  logger.info('Login credentials:');
  logger.info('  Admin:   admin / admin123  (PIN: 1234)');
  logger.info('  Manager: manager / manager123 (PIN: 9012)');
  logger.info('  Cashier: cashier / cashier123 (PIN: 5678)');
  logger.info('');
  logger.info('Role permissions:');
  logger.info('  Admin:   Full system access (all modules)');
  logger.info('  Manager: Products, Sales, Purchases, Customers, Inventory, Reports');
  logger.info('  Cashier: POS, Sales create/read, Products view, Customers view');
}

seed().catch(err => {
  logger.error('Seed failed:', err);
  process.exit(1);
});
