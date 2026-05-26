const { body } = require('express-validator');
module.exports = { createCustomerValidation: [body('name').trim().notEmpty().withMessage('Customer name is required')] };
