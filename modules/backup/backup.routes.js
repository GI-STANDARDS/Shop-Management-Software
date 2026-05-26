const { Router } = require('express');
const ctrl = require('./backup.controller');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/roles');
const { ROLES } = require('../../config/constants');

const router = Router();
router.use(authenticate);
router.post('/create', authorize(ROLES.ADMIN), ctrl.create);
router.get('/list', authorize(ROLES.ADMIN), ctrl.list);
router.post('/restore/:id', authorize(ROLES.ADMIN), ctrl.restore);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.delete);
module.exports = router;
