const { body } = require('express-validator');
module.exports = {
  createEmployeeValidation: [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('role_id').isInt().withMessage('Role is required'),
  ],
};
