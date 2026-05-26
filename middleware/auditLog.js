const { getDatabase } = require('../config/database');

function auditLog(action, entityType = null, entityId = null, details = null) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400 && req.user) {
        try {
          const db = getDatabase();
          db.prepare(`
            INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            req.user.sub,
            action,
            entityType,
            entityId || body?.data?.id || null,
            details ? JSON.stringify(details) : null,
            req.ip
          );
        } catch (err) {
          // silently fail audit logging
        }
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = { auditLog };
