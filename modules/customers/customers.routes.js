const { Router } = require('express');
const ctrl = require('./customers.controller');
const { createCustomerValidation } = require('./customers.validation');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/roles');
const { ROLES } = require('../../config/constants');

const router = Router();
router.use(authenticate);
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), ctrl.list);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), ctrl.getById);
router.get('/:id/purchases', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), ctrl.getPurchaseHistory);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), createCustomerValidation, validate, ctrl.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), ctrl.update);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.delete);
module.exports = router;
