const jwt = require('jsonwebtoken');
const config = require('../config');

const PAGE_PERMISSIONS = {
  dashboard: { any: true },
  pos: { permissions: ['sales.create'] },
  products: { permissions: ['products.read'] },
  categories: { permissions: ['categories.read'] },
  suppliers: { permissions: ['suppliers.read'] },
  customers: { permissions: ['customers.read'] },
  inventory: { permissions: ['inventory.read'] },
  sales: { permissions: ['sales.read'] },
  purchases: { permissions: ['purchases.*'] },
  expenses: { permissions: ['expenses.*'] },
  reports: { permissions: ['reports.read'] },
  employees: { permissions: ['employees.read'] },
  backup: { roles: ['admin'] },
  settings: { roles: ['admin'] },
};

function loadUser(req, res, next) {
  const token = req.cookies?.auth_token;
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
    } catch (e) {
      res.clearCookie('auth_token');
    }
  }
  res.locals.user = req.user || null;
  next();
}

function requireUser(req, res, next) {
  if (!req.user) {
    if (req.path.startsWith('/api')) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }
    return res.redirect('/login');
  }
  next();
}

function pageGuard(pageName) {
  return (req, res, next) => {
    const rule = PAGE_PERMISSIONS[pageName];
    if (!rule) return next();

    if (rule.any) return next();

    if (!req.user) {
      return res.redirect('/login');
    }

    if (rule.roles) {
      const userRole = req.user.role || req.user.role_name;
      if (!rule.roles.includes(userRole)) {
        return res.status(403).render('errors/403', { layout: 'layouts/auth' });
      }
      return next();
    }

    if (rule.permissions) {
      const userPerms = req.user.permissions || [];
      const hasAccess = rule.permissions.some((required) =>
        userPerms.some((up) => {
          if (up === '*') return true;
          if (up.endsWith('.*')) return required.startsWith(up.slice(0, -2));
          return up === required;
        })
      );
      if (!hasAccess) {
        return res.status(403).render('errors/403', { layout: 'layouts/auth' });
      }
      return next();
    }

    next();
  };
}

module.exports = { loadUser, requireUser, pageGuard, PAGE_PERMISSIONS };
