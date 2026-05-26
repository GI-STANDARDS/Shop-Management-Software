const { getDatabase } = require('../../config/database');

module.exports = {
  logBackup(filename, sizeBytes, type, userId) {
    const db = getDatabase();
    db.prepare('INSERT INTO backup_log (filename, size_bytes, type, created_by) VALUES (?, ?, ?, ?)')
      .run(filename, sizeBytes, type, userId);
  },

  getBackups() {
    const db = getDatabase();
    return db.prepare(`
      SELECT b.*, u.full_name as created_by_name
      FROM backup_log b LEFT JOIN users u ON b.created_by = u.id
      ORDER BY b.created_at DESC LIMIT 50
    `).all();
  },

  deleteBackupLog(id) {
    const db = getDatabase();
    db.prepare('DELETE FROM backup_log WHERE id = ?').run(id);
  },
};
