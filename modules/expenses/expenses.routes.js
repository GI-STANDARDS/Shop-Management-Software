const { Router } = require('express');
const ctrl = require('./expenses.controller');
const { createExpenseValidation } = require('./expenses.validation');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/roles');
const { ROLES } = require('../../config/constants');

const router = Router();
router.use(authenticate);
router.get('/', ctrl.list);
router.get('/categories', ctrl.getCategories);
router.get('/summary', authorize(ROLES.ADMIN, ROLES.MANAGER), ctrl.getSummary);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), createExpenseValidation, validate, ctrl.create);
module.exports = router;
