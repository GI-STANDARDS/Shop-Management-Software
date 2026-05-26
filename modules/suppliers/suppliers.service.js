const suppliersModel = require('./suppliers.model');
const { AppError } = require('../../middleware/errorHandler');

const suppliersService = {
  list(q) { return suppliersModel.findAll(q); },
  getById(id) { const s = suppliersModel.findById(id); if (!s) throw new AppError('Supplier not found', 404); return s; },
  create(d) { const id = suppliersModel.create(d); return suppliersModel.findById(id); },
  update(id, d) { if (!suppliersModel.findById(id)) throw new AppError('Supplier not found', 404); suppliersModel.update(id, d); return suppliersModel.findById(id); },
  delete(id) { if (!suppliersModel.findById(id)) throw new AppError('Supplier not found', 404); suppliersModel.delete(id); },
};

module.exports = suppliersService;
