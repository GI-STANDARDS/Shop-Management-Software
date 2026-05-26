const path = require('path');
const Database = require('better-sqlite3');
const config = require('./index');
const logger = require('./logger');

let db;

function getDatabase() {
  if (!db) {
    const rawPath = config.db.path;
    const isMemory = rawPath === ':memory:';
    const dbPath = isMemory ? ':memory:' : path.resolve(rawPath);
    logger.info(`Connecting to database: ${dbPath}`);
    db = new Database(dbPath);
    if (!isMemory) db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL UNIQUE,
      description TEXT,
      permissions TEXT,
      created_at  DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      full_name     TEXT    NOT NULL,
      email         TEXT    UNIQUE,
      phone         TEXT,
      role_id       INTEGER NOT NULL REFERENCES roles(id),
      is_active     INTEGER DEFAULT 1,
      shift         TEXT,
      pin_code      TEXT,
      last_login    DATETIME,
      created_at    DATETIME DEFAULT (datetime('now')),
      updated_at    DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL UNIQUE,
      description TEXT,
      parent_id   INTEGER REFERENCES categories(id),
      is_active   INTEGER DEFAULT 1,
      created_at  DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      contact_person TEXT,
      phone         TEXT,
      email         TEXT,
      address       TEXT,
      gst_number    TEXT,
      payment_terms TEXT,
      is_active     INTEGER DEFAULT 1,
      created_at    DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT    NOT NULL,
      sku             TEXT    NOT NULL UNIQUE,
      barcode         TEXT    UNIQUE,
      description     TEXT,
      category_id     INTEGER REFERENCES categories(id),
      supplier_id     INTEGER REFERENCES suppliers(id),
      cost_price      REAL    NOT NULL DEFAULT 0,
      selling_price   REAL    NOT NULL DEFAULT 0,
      tax_rate        REAL    DEFAULT 0,
      discount_rate   REAL    DEFAULT 0,
      unit            TEXT    DEFAULT 'pcs',
      min_stock_level INTEGER DEFAULT 0,
      is_active       INTEGER DEFAULT 1,
      image_url       TEXT,
      created_at      DATETIME DEFAULT (datetime('now')),
      updated_at      DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id  INTEGER NOT NULL REFERENCES products(id),
      quantity    REAL    NOT NULL,
      type        TEXT    NOT NULL,
      reference_id INTEGER,
      notes       TEXT,
      created_by  INTEGER REFERENCES users(id),
      created_at  DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS current_stock (
      product_id  INTEGER PRIMARY KEY REFERENCES products(id),
      quantity    REAL    NOT NULL DEFAULT 0,
      updated_at  DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      phone         TEXT,
      email         TEXT,
      address       TEXT,
      gst_number    TEXT,
      credit_limit  REAL DEFAULT 0,
      total_purchases REAL DEFAULT 0,
      loyalty_points INTEGER DEFAULT 0,
      is_active     INTEGER DEFAULT 1,
      created_at    DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sales (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number  TEXT    NOT NULL UNIQUE,
      customer_id     INTEGER REFERENCES customers(id),
      user_id         INTEGER NOT NULL REFERENCES users(id),
      subtotal        REAL    NOT NULL DEFAULT 0,
      tax_total       REAL    NOT NULL DEFAULT 0,
      discount_total  REAL    NOT NULL DEFAULT 0,
      grand_total     REAL    NOT NULL DEFAULT 0,
      amount_paid     REAL    NOT NULL DEFAULT 0,
      change_amount   REAL    NOT NULL DEFAULT 0,
      payment_method  TEXT    DEFAULT 'cash',
      status          TEXT    DEFAULT 'completed',
      notes           TEXT,
      created_at      DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id       INTEGER NOT NULL REFERENCES sales(id),
      product_id    INTEGER NOT NULL REFERENCES products(id),
      quantity      REAL    NOT NULL,
      unit_price    REAL    NOT NULL,
      cost_price    REAL    NOT NULL,
      tax_amount    REAL    DEFAULT 0,
      discount_amount REAL  DEFAULT 0,
      total         REAL    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_number TEXT    NOT NULL UNIQUE,
      supplier_id     INTEGER REFERENCES suppliers(id),
      user_id         INTEGER NOT NULL REFERENCES users(id),
      subtotal        REAL    NOT NULL DEFAULT 0,
      tax_total       REAL    NOT NULL DEFAULT 0,
      grand_total     REAL    NOT NULL DEFAULT 0,
      status          TEXT    DEFAULT 'received',
      notes           TEXT,
      created_at      DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS purchase_items (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id   INTEGER NOT NULL REFERENCES purchases(id),
      product_id    INTEGER NOT NULL REFERENCES products(id),
      quantity      REAL    NOT NULL,
      unit_cost     REAL    NOT NULL,
      total         REAL    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      category    TEXT    NOT NULL,
      amount      REAL    NOT NULL,
      description TEXT,
      paid_to     TEXT,
      payment_method TEXT DEFAULT 'cash',
      receipt_url TEXT,
      user_id     INTEGER REFERENCES users(id),
      expense_date DATETIME DEFAULT (datetime('now')),
      created_at  DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key         TEXT PRIMARY KEY,
      value       TEXT NOT NULL,
      updated_by  INTEGER REFERENCES users(id),
      updated_at  DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS backup_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      filename    TEXT NOT NULL,
      size_bytes  INTEGER,
      type        TEXT DEFAULT 'manual',
      created_by  INTEGER REFERENCES users(id),
      created_at  DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER REFERENCES users(id),
      action      TEXT    NOT NULL,
      entity_type TEXT,
      entity_id   INTEGER,
      details     TEXT,
      ip_address  TEXT,
      created_at  DATETIME DEFAULT (datetime('now'))
    );
  `);

  createTriggers(db);
  createIndexes(db);
}

function createTriggers(db) {
  db.exec(`DROP TRIGGER IF EXISTS trg_inventory_sync_current_stock`);
  db.exec(`
    CREATE TRIGGER trg_inventory_sync_current_stock
    AFTER INSERT ON inventory
    FOR EACH ROW
    BEGIN
      INSERT INTO current_stock (product_id, quantity, updated_at)
      VALUES (
        NEW.product_id,
        CASE
          WHEN NEW.type IN ('purchase', 'return', 'restock') THEN NEW.quantity
          WHEN NEW.type IN ('sale', 'removal') THEN -NEW.quantity
          ELSE NEW.quantity
        END,
        datetime('now')
      )
      ON CONFLICT(product_id) DO UPDATE SET
        quantity = quantity + CASE
          WHEN NEW.type IN ('purchase', 'return', 'restock') THEN NEW.quantity
          WHEN NEW.type IN ('sale', 'removal') THEN -NEW.quantity
          ELSE NEW.quantity
        END,
        updated_at = datetime('now');
    END;
  `);
}

function createIndexes(db) {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id)',
    'CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id)',
    'CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id)',
    'CREATE INDEX IF NOT EXISTS idx_inventory_type ON inventory(type)',
    'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)',
    'CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id)',
    'CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)',
    'CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)',
    'CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date)',
    'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)',
  ];
  for (const idx of indexes) {
    db.exec(idx);
  }
}

module.exports = { getDatabase };
