import { Router } from 'express';

import speciesValidate from '../validates/speciesValidate';
import speciesController from '../controllers/speciesController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get('/', speciesValidate.authenFilter, speciesController.get_list);

router.get('/:id', speciesController.get_one);
router.get('/phieuThuThap/:id', speciesController.get_phieuThuThap);

router.post('/bulkCreate', speciesValidate.authenBulkCreateOrUpdate, speciesController.bulk_create);
router.post('/', speciesValidate.authenCreate, speciesController.create);
router.put('/:id', speciesValidate.authenUpdate, speciesController.update);
router.put('/update-status/:id', speciesValidate.authenUpdate_status, speciesController.update_status);

export default router;
