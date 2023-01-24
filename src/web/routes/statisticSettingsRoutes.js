import { Router } from 'express';

import statisticSettingsValidate from '../../validates/statisticSettingsValidate';
import statisticSettingsController from '../../controllers/statisticSettingsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', statisticSettingsValidate.authenFilter, statisticSettingsController.get_list);
router.get('/targets/tree', statisticSettingsController.get_targets_tree);
router.get('/targets', statisticSettingsController.get_all);

// router.post('/', statisticSettingsValidate.authenCreate, statisticSettingsController.create);

export default router;
