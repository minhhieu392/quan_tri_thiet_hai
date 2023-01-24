import { Router } from 'express';
import vulnerablePersons from '../../validates/vulnerablePersons';
import vulnerablePersonController from '../../controllers/vulnerablePersonController';

const router = Router();

router.get('/', vulnerablePersons.authenFilter, vulnerablePersonController.get_list);
router.get('/:id', vulnerablePersonController.get_one);
// router.post('/', vulnerablePersons.authenCreate,vulnerablePersonController.create);
// router.put('/:id', vulnerablePersons.authenUpdate, vulnerablePersonController.update);
// router.put('/update-status/:id', vulnerablePersons.authenUpdate_status, vulnerablePersonController.update_status);

export default router;
