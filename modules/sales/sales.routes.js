const { Router } = require('express');
const ctrl = require('./sales.controller');
const { createSaleValidation } = require('./sales.validation');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { authorize, hasPermission } = require('../../middleware/roles');
const { ROLES } = require('../../config/constants');
const { auditLog } = require('../../middleware/auditLog');

const router = Router();
router.use(authenticate);
router.get('/today', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), ctrl.getTodaySummary);
router.get('/', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), ctrl.list);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER), ctrl.getById);
router.post('/',
  authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER),
  hasPermission('sales.create'),
  createSaleValidation, validate,
  auditLog('create_sale', 'sale'), ctrl.create);
router.put('/:id/refund',
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  hasPermission('sales.refund'),
  auditLog('refund_sale', 'sale'), ctrl.refund);
module.exports = router;
