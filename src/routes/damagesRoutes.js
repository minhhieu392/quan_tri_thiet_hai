import { Router } from 'express';

import damagesController from '../controllers/damagesController';
import damageValidate from '../validates/damageValidate';

const router = Router();

router.get('/targets', damagesController.get_targets_tree);

router.get('/', damageValidate.authenFilter, damagesController.get_list);

router.get('/:id', damagesController.get_one);

router.post('/', damageValidate.authenCreate, damagesController.create);


router.post('/bulkCreate_t1', damageValidate.authenbulkCreate_t1, damagesController.bulk_create_t1);
router.post('/bulkCreate_t2', damageValidate.authenbulkCreate_t2, damagesController.bulk_create_t2);

router.put('/:id', damageValidate.authenUpdate, damagesController.update);
router.delete('/:id', damagesController.delete);

export default router;
