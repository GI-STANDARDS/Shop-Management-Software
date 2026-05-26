const model = require('./employees.model');
const { AppError } = require('../../middleware/errorHandler');

module.exports = {
  list(q) { return model.findAll(q); },
  getById(id) { const u = model.findById(id); if (!u) throw new AppError('Employee not found', 404); return u; },
  async create(d) { const id = await model.create(d); return model.findById(id); },
  update(id, d) { if (!model.findById(id)) throw new AppError('Employee not found', 404); model.update(id, d); return model.findById(id); },
  delete(id) { model.update(id, { is_active: 0 }); },
};
