const { Router } = require('express');
const ctrl = require('./activity.controller');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/roles');
const { ROLES } = require('../../config/constants');

const router = Router();
router.use(authenticate);
router.get('/', authorize(ROLES.ADMIN), ctrl.list);
module.exports = router;
