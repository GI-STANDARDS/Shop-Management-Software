const model = require('./dashboard.model');
module.exports = {
  getSummary(req, res, next) { try { res.json({ success: true, data: model.getSummary() }); } catch (e) { next(e); } },
  getCharts(req, res, next) { try { res.json({ success: true, data: model.getChartData(req.query.days || 7) }); } catch (e) { next(e); } },
  getRecentSales(req, res, next) { try { res.json({ success: true, data: model.getRecentSales(req.query.limit || 10) }); } catch (e) { next(e); } },
};
