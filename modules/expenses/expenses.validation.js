const { body } = require('express-validator');
module.exports = {
  createExpenseValidation: [
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  ],
};
