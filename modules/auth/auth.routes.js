const { Router } = require('express');
const authController = require('./auth.controller');
const { loginValidation, pinLoginValidation, changePasswordValidation } = require('./auth.validation');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');

const router = Router();

router.post('/login', loginValidation, validate, authController.login);
router.post('/verify-pin', pinLoginValidation, validate, authController.pinLogin);
router.get('/me', authenticate, authController.getProfile);
router.put('/change-password', authenticate, changePasswordValidation, validate, authController.changePassword);

module.exports = router;
