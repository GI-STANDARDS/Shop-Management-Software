const svc = require('./inventory.service');
const model = require('./inventory.model');

module.exports = {
  getAllStock(req, res, next) { try { res.json({ success: true, data: svc.getAllStock(req.query) }); } catch (e) { next(e); } },
  getStock(req, res, next) { try { res.json({ success: true, data: svc.getStock(req.params.product_id) }); } catch (e) { next(e); } },
  getMovements(req, res, next) { try { res.json({ success: true, data: svc.getMovements(req.params.product_id, req.query) }); } catch (e) { next(e); } },
  getLowStockCount(req, res, next) { try { res.json({ success: true, data: { count: model.getProductLowStockCount() } }); } catch (e) { next(e); } },
  adjust(req, res, next) { try { res.json({ success: true, data: svc.adjust(req.params.product_id, req.body, req.user.sub) }); } catch (e) { next(e); } },
  restock(req, res, next) { try { res.json({ success: true, data: svc.restock(req.params.product_id, req.body, req.user.sub) }); } catch (e) { next(e); } },
};
