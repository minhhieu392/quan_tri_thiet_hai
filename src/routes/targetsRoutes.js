import { Router } from 'express';

import targetsValidate from '../validates/targetsValidate';
import targetsController from '../controllers/targetsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', targetsValidate.authenFilter, targetsController.get_list);
router.get('/tree/all', targetsValidate.authenFilter, targetsController.get_tree_all);
router.get('/tree/list', targetsValidate.authenFilter, targetsController.get_tree_list);
router.get('/tree/:id', targetsController.get_one_tree);
router.get('/:id', targetsController.get_one);
router.post('/', targetsValidate.authenCreate, targetsController.create);
router.put('/:id', targetsValidate.authenUpdate, targetsController.update);
router.put('/update-status/:id', targetsValidate.authenUpdate_status, targetsController.update_status);

export default router;
