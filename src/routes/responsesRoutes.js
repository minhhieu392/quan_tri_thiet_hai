import { Router } from 'express';
import requestValidate from "../validates/requestValidate";
import responseController from "../controllers/responseController";

const router = Router();

router.get('/', requestValidate.authenFilter, responseController.get_list);
router.get('/:id', requestValidate.authenFilter ,responseController.get_one);
router.post('/', requestValidate.authenCreate,responseController.create);
router.put('/:id', requestValidate.authenUpdate, responseController.update);
router.delete('/:id', responseController.delete);
export default router;
