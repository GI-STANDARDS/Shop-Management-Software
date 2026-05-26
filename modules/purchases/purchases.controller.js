const svc = require('./purchases.service');
module.exports = {
  list(req, res, next) { try { res.json({ success: true, data: svc.list(req.query) }); } catch (e) { next(e); } },
  getById(req, res, next) { try { res.json({ success: true, data: svc.getById(req.params.id) }); } catch (e) { next(e); } },
  create(req, res, next) { try { const p = svc.create(req.body, req.user.sub); res.status(201).json({ success: true, data: p }); } catch (e) { next(e); } },
};
