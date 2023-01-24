import { Router } from 'express';

import speciesGroupsValidate from '../validates/speciesGroupsValidate';
import speciesGroupsController from '../controllers/speciesGroupsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', speciesGroupsValidate.authenFilter, speciesGroupsController.get_list);
router.get('/countIndividuals', speciesGroupsValidate.authenFilterCount, speciesGroupsController.get_count_individuals);
router.get('/phieuThuThap/:id', speciesGroupsController.get_phieuThuThap);

router.get('/:id', speciesGroupsController.get_one);
router.get('/attributes/:id', speciesGroupsController.get_attributes);
router.get('/attributes_filter/:id', speciesGroupsController.get_attributes_filter);

router.post('/bulkCreate', speciesGroupsValidate.authenBulkCreateOrUpdate, speciesGroupsController.bulk_create);
router.post('/', speciesGroupsValidate.authenCreate, speciesGroupsController.create);
router.put(
  '/attributes/:id',
  speciesGroupsValidate.authenSettingAttributes,
  speciesGroupsController.setting_attributes
);
router.put('/:id', speciesGroupsValidate.authenUpdate, speciesGroupsController.update);
router.put('/update-status/:id', speciesGroupsValidate.authenUpdate_status, speciesGroupsController.update_status);

export default router;
