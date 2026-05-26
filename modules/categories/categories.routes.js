const { Router } = require('express');
const categoriesController = require('./categories.controller');
const { createCategoryValidation } = require('./categories.validation');
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/auth');
const { authorize } = require('../../middleware/roles');
const { ROLES } = require('../../config/constants');

const router = Router();
router.use(authenticate);

router.get('/', categoriesController.list);
router.get('/:id', categoriesController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.MANAGER), createCategoryValidation, validate, categoriesController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.MANAGER), categoriesController.update);
router.delete('/:id', authorize(ROLES.ADMIN), categoriesController.delete);

module.exports = router;
