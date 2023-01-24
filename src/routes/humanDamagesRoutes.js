import { Router } from 'express';
import humanDamageController from "../controllers/humanDamageController";
import humanDamages from "../validates/humanDamages";

const router = Router();


router.get('/', humanDamages.authenFilter, humanDamageController.get_list);

router.get('/:id' ,humanDamageController.get_one);
router.post('/',humanDamages.authenCreate,humanDamageController.create);
router.put('/:id', humanDamages.authenUpdate, humanDamageController.update);
router.post('/bulkCreate_t1',humanDamages.authenbulkCreate_t1, humanDamageController.bulk_create_t1);
router.post('/bulkCreate_t2',humanDamages.authenbulkCreate_t2, humanDamageController.bulk_create_t2);
router.delete('/:id', humanDamageController.delete);
export default router; 
