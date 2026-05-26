const model = require('./settings.model');
module.exports = {
  getAll(req, res, next) { try { res.json({ success: true, data: model.getAll() }); } catch (e) { next(e); } },
  update(req, res, next) {
    try {
      model.setMultiple(req.body, req.user.sub);
      res.json({ success: true, data: model.getAll() });
    } catch (e) { next(e); }
  },
};
