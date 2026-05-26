const { Router } = require('express');
const ctrl = require('./employees.controller');
const { createEmployeeValidation } = require('./employees.validation');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/roles');
const { ROLES } = require('../../config/constants');

const router = Router();
router.use(authenticate);
router.get('/', authorize(ROLES.ADMIN), ctrl.list);
router.get('/:id', authorize(ROLES.ADMIN), ctrl.getById);
router.post('/', authorize(ROLES.ADMIN), createEmployeeValidation, validate, ctrl.create);
router.put('/:id', authorize(ROLES.ADMIN), ctrl.update);
router.delete('/:id', authorize(ROLES.ADMIN), ctrl.delete);
module.exports = router;
