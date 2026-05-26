const { Router } = require('express');
const ctrl = require('./dashboard.controller');
const authenticate = require('../../middleware/auth');

const router = Router();
router.use(authenticate);
router.get('/summary', ctrl.getSummary);
router.get('/charts', ctrl.getCharts);
router.get('/recent-sales', ctrl.getRecentSales);
module.exports = router;
