const fs = require('fs');
const path = require('path');
const config = require('../../config');
const backupModel = require('./backup.model');
const { AppError } = require('../../middleware/errorHandler');
const logger = require('../../config/logger');

module.exports = {
  createBackup(userId) {
    const src = path.resolve(config.db.path);
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${date}.db`;
    const dest = path.join('backups', filename);

    if (!fs.existsSync('backups')) fs.mkdirSync('backups', { recursive: true });
    fs.copyFileSync(src, dest);
    const stats = fs.statSync(dest);

    backupModel.logBackup(filename, stats.size, 'manual', userId);
    logger.info(`Backup created: ${filename} (${stats.size} bytes)`);
    return { filename, size: stats.size, path: dest };
  },

  listBackups() {
    return backupModel.getBackups();
  },

  restoreBackup(backupId) {
    const backups = backupModel.getBackups();
    const entry = backups.find(b => b.id === parseInt(backupId));
    if (!entry) throw new AppError('Backup not found', 404);

    const backupPath = path.join('backups', entry.filename);
    if (!fs.existsSync(backupPath)) throw new AppError('Backup file not found on disk', 404);

    const currentDb = path.resolve(config.db.path);
    const safetyPath = currentDb + '.pre-restore.bak';
    fs.copyFileSync(currentDb, safetyPath);
    fs.copyFileSync(backupPath, currentDb);

    // Close and reopen connection
    delete require.cache[require.resolve('../../config/database')];
    const { getDatabase } = require('../../config/database');
    getDatabase();

    logger.info(`Database restored from backup: ${entry.filename}`);
    return { message: 'Restore successful. Old DB saved as .pre-restore.bak' };
  },

  deleteBackup(id) {
    const backups = backupModel.getBackups();
    const entry = backups.find(b => b.id === parseInt(id));
    if (!entry) throw new AppError('Backup not found', 404);

    const filePath = path.join('backups', entry.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    backupModel.deleteBackupLog(id);
  },
};
