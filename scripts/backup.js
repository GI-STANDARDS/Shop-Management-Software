const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const config = require('../config');
const logger = require('../config/logger');

const src = path.resolve(config.db.path);
const date = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `backup-${date}.db`;
const dest = path.join('backups', filename);

if (!fs.existsSync('backups')) fs.mkdirSync('backups', { recursive: true });
fs.copyFileSync(src, dest);
const stats = fs.statSync(dest);
logger.info(`Backup saved: ${dest} (${stats.size} bytes)`);
