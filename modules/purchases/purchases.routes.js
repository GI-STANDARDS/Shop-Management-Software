const { Router } = require('express');
const ctrl = require('./purchases.controller');
const { createPurchaseValidation } = require('./purchases.validation');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/roles');
const { ROLES } = require('../../config/constants');

const router = Router();
router.use(authenticate);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), createPurchaseValidation, validate, ctrl.create);
module.exports = router;
