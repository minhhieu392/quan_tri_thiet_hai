import { Router } from 'express';
import supportSourcesController from "../controllers/supportSourcesController";
import supportSourcesValidate from "../validates/supportSourcesValidate";

const router = Router();

router.get('/', supportSourcesValidate.authenFilter, supportSourcesController.get_list);
router.get('/:id' ,supportSourcesController.get_one);
router.post('/', supportSourcesValidate.authenCreate,supportSourcesController.create);
router.put('/:id', supportSourcesValidate.authenUpdate, supportSourcesController.update);
router.put('/update-status/:id', supportSourcesValidate.authenUpdate_status, supportSourcesController.update_status);
export default router;
