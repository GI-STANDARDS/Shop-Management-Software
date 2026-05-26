const productsService = require('./products.service');

const productsController = {
  list(req, res, next) {
    try {
      const result = productsService.list(req.query);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  getById(req, res, next) {
    try {
      const product = productsService.getById(req.params.id);
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  getByBarcode(req, res, next) {
    try {
      const product = productsService.getByBarcode(req.params.code);
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  create(req, res, next) {
    try {
      const product = productsService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  update(req, res, next) {
    try {
      const product = productsService.update(req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  delete(req, res, next) {
    try {
      productsService.delete(req.params.id);
      res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
      next(err);
    }
  },

  getLowStock(req, res, next) {
    try {
      const products = productsService.getLowStock();
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = productsController;
