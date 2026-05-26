const { body } = require('express-validator');

const createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];

module.exports = { createCategoryValidation };
