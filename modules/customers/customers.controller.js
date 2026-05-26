const svc = require('./customers.service');
module.exports = {
  list(req, res, next) { try { res.json({ success: true, data: svc.list(req.query) }); } catch (e) { next(e); } },
  getById(req, res, next) { try { res.json({ success: true, data: svc.getById(req.params.id) }); } catch (e) { next(e); } },
  create(req, res, next) { try { res.status(201).json({ success: true, data: svc.create(req.body) }); } catch (e) { next(e); } },
  update(req, res, next) { try { res.json({ success: true, data: svc.update(req.params.id, req.body) }); } catch (e) { next(e); } },
  delete(req, res, next) { try { svc.delete(req.params.id); res.json({ success: true, message: 'Customer deleted' }); } catch (e) { next(e); } },
  getPurchaseHistory(req, res, next) { try { res.json({ success: true, data: svc.getPurchaseHistory(req.params.id, req.query) }); } catch (e) { next(e); } },
};
