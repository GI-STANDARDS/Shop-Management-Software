const productsModel = require('./products.model');
const { AppError } = require('../../middleware/errorHandler');

const productsService = {
  list(query) {
    return productsModel.findAll(query);
  },

  getById(id) {
    const product = productsModel.findById(id);
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
    return product;
  },

  getByBarcode(barcode) {
    const product = productsModel.findByBarcode(barcode);
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
    return product;
  },

  create(data) {
    const existing = productsModel.findByBarcode(data.barcode);
    if (existing) throw new AppError('Barcode already exists', 409, 'CONFLICT');
    const id = productsModel.create(data);
    return productsModel.findById(id);
  },

  update(id, data) {
    const product = productsModel.findById(id);
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
    productsModel.update(id, data);
    return productsModel.findById(id);
  },

  delete(id) {
    const product = productsModel.findById(id);
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
    productsModel.delete(id);
  },

  getLowStock() {
    return productsModel.getLowStock();
  },
};

module.exports = productsService;
