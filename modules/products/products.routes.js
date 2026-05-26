const { Router } = require('express');
const productsController = require('./products.controller');
const { createProductValidation, updateProductValidation, listProductsValidation } = require('./products.validation');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/roles');
const { ROLES } = require('../../config/constants');

const router = Router();

router.use(authenticate);

router.get('/', listProductsValidation, validate, productsController.list);
router.get('/low-stock', productsController.getLowStock);
router.get('/barcode/:code', productsController.getByBarcode);
router.get('/:id', productsController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), createProductValidation, validate, productsController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), updateProductValidation, validate, productsController.update);
router.delete('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), productsController.delete);

module.exports = router;
