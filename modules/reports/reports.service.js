const model = require('./reports.model');
const { AppError } = require('../../middleware/errorHandler');

module.exports = {
  dailySales({ from, to }) {
    if (!from || !to) throw new AppError('from and to dates required', 400);
    return model.dailySales(from, to);
  },
  profitLoss({ from, to }) {
    if (!from || !to) throw new AppError('from and to dates required', 400);
    return model.profitLoss(from, to);
  },
  topProducts({ from, to, limit = 10 }) {
    if (!from || !to) throw new AppError('from and to dates required', 400);
    return model.topProducts(from, to, parseInt(limit));
  },
  expensesSummary({ from, to }) {
    if (!from || !to) throw new AppError('from and to dates required', 400);
    return model.expensesSummary(from, to);
  },
};
