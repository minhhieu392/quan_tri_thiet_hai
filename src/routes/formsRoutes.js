import { Router } from 'express';

import formsValidate from '../validates/formsValidate';
import formsController from '../controllers/formsController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', formsValidate.authenFilter, formsController.get_list);
router.get('/targets/:id', formsController.get_targets_tree);
router.get('/:id', formsController.get_one);
router.post('/', formsValidate.authenCreate, formsController.create);
router.put('/:id', formsValidate.authenUpdate, formsController.update);
router.put('/update-status/:id', formsValidate.authenUpdate_status, formsController.update_status);

export default router;
