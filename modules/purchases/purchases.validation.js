const { body } = require('express-validator');
module.exports = {
  createPurchaseValidation: [
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('items.*.product_id').isInt().withMessage('Product ID must be integer'),
    body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be positive'),
    body('items.*.unit_cost').isFloat({ min: 0 }).withMessage('Unit cost must be >= 0'),
  ],
};
