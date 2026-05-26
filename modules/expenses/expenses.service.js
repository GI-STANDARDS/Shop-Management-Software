const model = require('./expenses.model');
const { AppError } = require('../../middleware/errorHandler');

module.exports = {
  list(q) { return model.findAll(q); },
  create(d, userId) { d.user_id = userId; const id = model.create(d); return model.findAll({}).then ? null : { id }; },
  getCategories() { return model.getCategories(); },
  getSummary(q) { return model.getSummary(q); },
};
