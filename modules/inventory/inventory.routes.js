const { Router } = require('express');
const ctrl = require('./inventory.controller');
const { adjustValidation, restockValidation } = require('./inventory.validation');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/roles');
const { ROLES } = require('../../config/constants');

const router = Router();
router.use(authenticate);
router.get('/', ctrl.getAllStock);
router.get('/low-stock-count', ctrl.getLowStockCount);
router.get('/:product_id', ctrl.getStock);
router.get('/:product_id/movements', ctrl.getMovements);
router.post('/adjust/:product_id', authorize(ROLES.ADMIN, ROLES.MANAGER), adjustValidation, validate, ctrl.adjust);
router.post('/restock/:product_id', authorize(ROLES.ADMIN, ROLES.MANAGER), restockValidation, validate, ctrl.restock);
module.exports = router;
