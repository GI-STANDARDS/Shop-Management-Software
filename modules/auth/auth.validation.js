const { body } = require('express-validator');

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const pinLoginValidation = [
  body('pin_code').trim().notEmpty().isLength({ min: 4, max: 6 }).withMessage('PIN must be 4-6 digits'),
];

const changePasswordValidation = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

module.exports = { loginValidation, pinLoginValidation, changePasswordValidation };
