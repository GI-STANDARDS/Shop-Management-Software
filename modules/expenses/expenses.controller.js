const svc = require('./expenses.service');
module.exports = {
  list(req, res, next) { try { res.json({ success: true, data: svc.list(req.query) }); } catch (e) { next(e); } },
  create(req, res, next) { try { const r = svc.create(req.body, req.user.sub); res.status(201).json({ success: true, data: r }); } catch (e) { next(e); } },
  getCategories(req, res, next) { try { res.json({ success: true, data: svc.getCategories() }); } catch (e) { next(e); } },
  getSummary(req, res, next) { try { res.json({ success: true, data: svc.getSummary(req.query) }); } catch (e) { next(e); } },
};
