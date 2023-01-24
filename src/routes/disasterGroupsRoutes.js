import { Router } from 'express';

import disasterGroupsValidate from '../validates/disasterGroupsValidate';
import disasterGroupsController from '../controllers/disasterGroupsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', disasterGroupsValidate.authenFilter, disasterGroupsController.get_list);

router.get('/:id', disasterGroupsController.get_one);

router.post('/', disasterGroupsValidate.authenCreate, disasterGroupsController.create);
router.put('/:id', disasterGroupsValidate.authenUpdate, disasterGroupsController.update);
router.put('/update-status/:id', disasterGroupsValidate.authenUpdate_status, disasterGroupsController.update_status);

export default router;
