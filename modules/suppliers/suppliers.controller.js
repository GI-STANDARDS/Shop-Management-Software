const suppliersService = require('./suppliers.service');

module.exports = {
  list(req, res, next) { try { res.json({ success: true, data: suppliersService.list(req.query) }); } catch (e) { next(e); } },
  getById(req, res, next) { try { res.json({ success: true, data: suppliersService.getById(req.params.id) }); } catch (e) { next(e); } },
  create(req, res, next) { try { res.status(201).json({ success: true, data: suppliersService.create(req.body) }); } catch (e) { next(e); } },
  update(req, res, next) { try { res.json({ success: true, data: suppliersService.update(req.params.id, req.body) }); } catch (e) { next(e); } },
  delete(req, res, next) { try { suppliersService.delete(req.params.id); res.json({ success: true, message: 'Supplier deleted' }); } catch (e) { next(e); } },
};
