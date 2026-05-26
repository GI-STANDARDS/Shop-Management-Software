const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const config = require('./config');
const logger = require('./config/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { loadUser, pageGuard } = require('./middleware/pageGuard');

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.cors.origin }));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Logging
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Load user from cookie on all page routes
app.use(loadUser);

// API Routes
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/products', require('./modules/products/products.routes'));
app.use('/api/v1/categories', require('./modules/categories/categories.routes'));
app.use('/api/v1/suppliers', require('./modules/suppliers/suppliers.routes'));
app.use('/api/v1/customers', require('./modules/customers/customers.routes'));
app.use('/api/v1/inventory', require('./modules/inventory/inventory.routes'));
app.use('/api/v1/sales', require('./modules/sales/sales.routes'));
app.use('/api/v1/purchases', require('./modules/purchases/purchases.routes'));
app.use('/api/v1/expenses', require('./modules/expenses/expenses.routes'));
app.use('/api/v1/employees', require('./modules/employees/employees.routes'));
app.use('/api/v1/reports', require('./modules/reports/reports.routes'));
app.use('/api/v1/dashboard', require('./modules/dashboard/dashboard.routes'));
app.use('/api/v1/backup', require('./modules/backup/backup.routes'));
app.use('/api/v1/settings', require('./modules/settings/settings.routes'));
app.use('/api/v1/activity', require('./modules/activity/activity.routes'));

// Web Routes (EJS pages)
app.get('/login', (req, res) => {
  if (req.user) return res.redirect('/app/dashboard');
  res.render('pages/login', { layout: 'layouts/auth' });
});

// POS page
app.get('/app/pos', pageGuard('pos'), (req, res) =>
  res.render('pages/pos', { currentPage: 'pos', layout: 'layouts/pos' }));

// Role-specific dashboards
app.get('/app/dashboard', pageGuard('dashboard'), (req, res) => {
  const role = (req.user && (req.user.role || req.user.role_name)) || 'cashier';
  const dashboardViews = {
    admin: 'pages/dashboards/admin',
    manager: 'pages/dashboards/manager',
    cashier: 'pages/dashboards/cashier',
  };
  const view = dashboardViews[role] || 'pages/dashboards/cashier';
  res.render(view, { currentPage: 'dashboard' });
});

const pageRoutes = {
  '/app/products': { view: 'pages/products/list', guard: 'products' },
  '/app/products/new': { view: 'pages/products/form', guard: 'products' },
  '/app/categories': { view: 'pages/categories/list', guard: 'categories' },
  '/app/suppliers': { view: 'pages/suppliers/list', guard: 'suppliers' },
  '/app/customers': { view: 'pages/customers/list', guard: 'customers' },
  '/app/inventory': { view: 'pages/inventory/list', guard: 'inventory' },
  '/app/sales': { view: 'pages/sales/list', guard: 'sales' },
  '/app/purchases': { view: 'pages/purchases/list', guard: 'purchases' },
  '/app/expenses': { view: 'pages/expenses/list', guard: 'expenses' },
  '/app/reports': { view: 'pages/reports/index', guard: 'reports' },
  '/app/employees': { view: 'pages/employees/list', guard: 'employees' },
  '/app/backup': { view: 'pages/backup/index', guard: 'backup' },
  '/app/settings': { view: 'pages/settings/index', guard: 'settings' },
};

Object.entries(pageRoutes).forEach(([path, { view, guard }]) => {
  app.get(path, pageGuard(guard), (req, res) =>
    res.render(view, { currentPage: path.split('/')[2] }));
});

// Product edit and detail routes
app.get('/app/products/:id/edit', pageGuard('products'), (req, res) =>
  res.render('pages/products/form', { currentPage: 'products' }));
app.get('/app/products/:id', pageGuard('products'), (req, res) =>
  res.render('pages/products/detail', { currentPage: 'products' }));

// Sale detail / invoice
app.get('/app/sales/:id', pageGuard('sales'), (req, res) =>
  res.render('pages/sales/invoice', { currentPage: 'sales' }));

// Root redirect
app.get('/', (req, res) => {
  if (req.user) return res.redirect('/app/dashboard');
  res.redirect('/login');
});

// API Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
  } else {
    res.status(404).render('errors/404', { layout: 'layouts/auth' });
  }
});

// Error handler
app.use(errorHandler);

module.exports = app;
