const { ROLE_HIERARCHY, PERMISSIONS } = require('../config/constants');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const userRole = req.user.role || req.user.role_name;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    }

    next();
  };
}

function requireLevel(minLevel) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const userRole = req.user.role || req.user.role_name;
    const level = ROLE_HIERARCHY[userRole] || 0;
    if (level < minLevel) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient role level' },
      });
    }

    next();
  };
}

function hasPermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasAccess = userPermissions.some((p) => {
      if (p === '*') return true;
      if (p.endsWith('.*')) {
        return permission.startsWith(p.slice(0, -2));
      }
      return p === permission;
    });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `Missing permission: ${permission}` },
      });
    }

    next();
  };
}

module.exports = { authorize, requireLevel, hasPermission };
