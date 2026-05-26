const svc = require('./employees.service');
module.exports = {
  list(req, res, next) { try { res.json({ success: true, data: svc.list(req.query) }); } catch (e) { next(e); } },
  getById(req, res, next) { try { res.json({ success: true, data: svc.getById(req.params.id) }); } catch (e) { next(e); } },
  async create(req, res, next) { try { res.status(201).json({ success: true, data: await svc.create(req.body) }); } catch (e) { next(e); } },
  update(req, res, next) { try { res.json({ success: true, data: svc.update(req.params.id, req.body) }); } catch (e) { next(e); } },
  delete(req, res, next) { try { svc.delete(req.params.id); res.json({ success: true, message: 'Employee deactivated' }); } catch (e) { next(e); } },
};
