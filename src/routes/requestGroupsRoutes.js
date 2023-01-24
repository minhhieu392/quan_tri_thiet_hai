import { Router } from 'express';

import requestGroupsValidate from '../validates/requestGroupsValidate';
import requestGroupsController from '../controllers/requestGroupsController';
import requestController from "../controllers/requestController";

const router = Router();

router.get("/",requestGroupsValidate.authenFilter, requestGroupsController.get_list)
router.get("/:id", requestGroupsController.get_one)
router.post("/",requestGroupsValidate.authenCreate ,requestGroupsController.create)
router.put('/:id', requestGroupsValidate.authenUpdate, requestGroupsController.update);
router.put('/update-status/:id', requestGroupsValidate.authenUpdate_status, requestGroupsController.update_status);

export default router;

