const customersModel = require('./customers.model');
const { AppError } = require('../../middleware/errorHandler');

module.exports = {
  list(q) { return customersModel.findAll(q); },
  getById(id) { const c = customersModel.findById(id); if (!c) throw new AppError('Customer not found', 404); return c; },
  create(d) { const id = customersModel.create(d); return customersModel.findById(id); },
  update(id, d) { if (!customersModel.findById(id)) throw new AppError('Customer not found', 404); customersModel.update(id, d); return customersModel.findById(id); },
  delete(id) { if (!customersModel.findById(id)) throw new AppError('Customer not found', 404); customersModel.update(id, { is_active: 0 }); },
  getPurchaseHistory(id, q) { return customersModel.getPurchaseHistory(id, q); },
};
