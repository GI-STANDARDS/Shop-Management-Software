const authService = require('./auth.service');

const authController = {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async pinLogin(req, res, next) {
    try {
      const { pin_code } = req.body;
      const result = await authService.pinLogin(pin_code);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  getProfile(req, res, next) {
    try {
      const user = authService.getProfile(req.user.sub);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { current_password, new_password } = req.body;
      await authService.changePassword(req.user.sub, current_password, new_password);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
