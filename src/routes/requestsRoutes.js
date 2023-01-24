import { Router } from 'express';
import requestValidate from "../validates/requestValidate";
import requestController from "../controllers/requestController";;

const router = Router();

router.get('/', requestValidate.authenFilter, requestController.get_list);
router.get('/:id' ,requestController.get_one);
router.post('/', requestValidate.authenCreate,requestController.create);
router.put('/:id', requestValidate.authenUpdate, requestController.update);
router.delete('/:id', requestController.delete);
export default router;
