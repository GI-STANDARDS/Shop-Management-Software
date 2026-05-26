const { Router } = require('express');
const ctrl = require('./reports.controller');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/roles');
const { ROLES } = require('../../config/constants');

const router = Router();
router.use(authenticate);
router.get('/daily-sales', authorize(ROLES.ADMIN, ROLES.MANAGER), ctrl.dailySales);
router.get('/profit-loss', authorize(ROLES.ADMIN, ROLES.MANAGER), ctrl.profitLoss);
router.get('/top-products', authorize(ROLES.ADMIN, ROLES.MANAGER), ctrl.topProducts);
router.get('/expense-summary', authorize(ROLES.ADMIN, ROLES.MANAGER), ctrl.expensesSummary);
module.exports = router;
