const { body } = require('express-validator');
module.exports = { createSupplierValidation: [body('name').trim().notEmpty().withMessage('Supplier name is required')] };
