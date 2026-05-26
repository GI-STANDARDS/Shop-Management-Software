const { body, param, query } = require('express-validator');

const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('selling_price').isFloat({ min: 0 }).withMessage('Selling price must be >= 0'),
  body('cost_price').isFloat({ min: 0 }).withMessage('Cost price must be >= 0'),
];

const updateProductValidation = [
  param('id').isInt().withMessage('Invalid product ID'),
];

const listProductsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('Limit must be 1-200'),
];

module.exports = { createProductValidation, updateProductValidation, listProductsValidation };
