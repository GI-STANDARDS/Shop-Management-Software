const model = require('./activity.model');
module.exports = {
  list(req, res, next) { try { res.json({ success: true, data: model.findAll(req.query) }); } catch (e) { next(e); } },
};
