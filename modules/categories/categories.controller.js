const categoriesService = require('./categories.service');

const categoriesController = {
  list(req, res, next) {
    try {
      const categories = categoriesService.list();
      res.json({ success: true, data: categories });
    } catch (err) { next(err); }
  },

  getById(req, res, next) {
    try {
      const category = categoriesService.getById(req.params.id);
      res.json({ success: true, data: category });
    } catch (err) { next(err); }
  },

  create(req, res, next) {
    try {
      const category = categoriesService.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (err) { next(err); }
  },

  update(req, res, next) {
    try {
      const category = categoriesService.update(req.params.id, req.body);
      res.json({ success: true, data: category });
    } catch (err) { next(err); }
  },

  delete(req, res, next) {
    try {
      categoriesService.delete(req.params.id);
      res.json({ success: true, message: 'Category deleted' });
    } catch (err) { next(err); }
  },
};

module.exports = categoriesController;
