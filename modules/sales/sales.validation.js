const { body } = require('express-validator');

const createSaleValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.product_id').isInt().withMessage('Product ID must be integer'),
  body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be positive'),
  body('payment_method').optional().isIn(['cash', 'card', 'upi', 'mixed']).withMessage('Invalid payment method'),
];

module.exports = { createSaleValidation };
