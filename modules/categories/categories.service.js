const categoriesModel = require('./categories.model');
const { AppError } = require('../../middleware/errorHandler');

const categoriesService = {
  list() {
    return categoriesModel.findAll();
  },

  getById(id) {
    const cat = categoriesModel.findById(id);
    if (!cat) throw new AppError('Category not found', 404, 'NOT_FOUND');
    return cat;
  },

  create(data) {
    const id = categoriesModel.create(data);
    return categoriesModel.findById(id);
  },

  update(id, data) {
    const cat = categoriesModel.findById(id);
    if (!cat) throw new AppError('Category not found', 404, 'NOT_FOUND');
    categoriesModel.update(id, data);
    return categoriesModel.findById(id);
  },

  delete(id) {
    const cat = categoriesModel.findById(id);
    if (!cat) throw new AppError('Category not found', 404, 'NOT_FOUND');
    categoriesModel.delete(id);
  },
};

module.exports = categoriesService;
