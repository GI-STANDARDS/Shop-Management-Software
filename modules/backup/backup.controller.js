const svc = require('./backup.service');
module.exports = {
  create(req, res, next) { try { const r = svc.createBackup(req.user.sub); res.json({ success: true, data: r }); } catch (e) { next(e); } },
  list(req, res, next) { try { res.json({ success: true, data: svc.listBackups() }); } catch (e) { next(e); } },
  restore(req, res, next) { try { res.json({ success: true, data: svc.restoreBackup(req.params.id) }); } catch (e) { next(e); } },
  delete(req, res, next) { try { svc.deleteBackup(req.params.id); res.json({ success: true, message: 'Backup deleted' }); } catch (e) { next(e); } },
};
