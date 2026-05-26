const svc = require('./reports.service');
module.exports = {
  dailySales(req, res, next) { try { res.json({ success: true, data: svc.dailySales(req.query) }); } catch (e) { next(e); } },
  profitLoss(req, res, next) { try { res.json({ success: true, data: svc.profitLoss(req.query) }); } catch (e) { next(e); } },
  topProducts(req, res, next) { try { res.json({ success: true, data: svc.topProducts(req.query) }); } catch (e) { next(e); } },
  expensesSummary(req, res, next) { try { res.json({ success: true, data: svc.expensesSummary(req.query) }); } catch (e) { next(e); } },
};
