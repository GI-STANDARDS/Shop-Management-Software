const svc = require('./sales.service');
module.exports = {
  list(req, res, next) { try { res.json({ success: true, data: svc.list(req.query) }); } catch (e) { next(e); } },
  getById(req, res, next) { try { res.json({ success: true, data: svc.getById(req.params.id) }); } catch (e) { next(e); } },
  create(req, res, next) { try { const s = svc.create(req.body, req.user.sub); res.status(201).json({ success: true, data: s }); } catch (e) { next(e); } },
  refund(req, res, next) { try { res.json({ success: true, data: svc.refund(req.params.id) }); } catch (e) { next(e); } },
  getTodaySummary(req, res, next) { try { res.json({ success: true, data: svc.getTodaySummary() }); } catch (e) { next(e); } },
};
