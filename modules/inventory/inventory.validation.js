const { body } = require('express-validator');

module.exports = {
  adjustValidation: [
    body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be positive'),
    body('type').isIn(['adjustment', 'return', 'restock', 'removal']).withMessage('Type must be adjustment, return, restock, or removal'),
  ],
  restockValidation: [
    body('quantity').isFloat({ min: 0.01 }).withMessage('Restock quantity must be positive'),
    body('notes').optional().trim(),
  ],
};
