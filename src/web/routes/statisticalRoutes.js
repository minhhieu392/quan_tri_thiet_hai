import { Router } from 'express';

import statisticalServicesValidate from '../../validates/statisticalValidate';
import statisticalController from '../../controllers/statisticalController';
// import { findUser, userValidator } from '../validators/userValidator';

const router = Router();

router.get(
  '/thiethai/countDisasters',
  statisticalServicesValidate.authenFilter,
  statisticalController.get_disasters_count
);

router.get(
  '/thiethai/countDisasters/byDisasterGroups',
  statisticalServicesValidate.authenFilter,
  statisticalController.get_disasters_count_by_disasterGroupsId
);
router.get('/thiethai/nguoi', statisticalServicesValidate.authenFilter, statisticalController.get_statistic_nguoi);

router.get('/thiethai/one', statisticalServicesValidate.authenFilter, statisticalController.get_statistic_one);
router.get('/thiethai/many', statisticalServicesValidate.authenFilter, statisticalController.get_statistic_many);

router.get('/sumDamage', statisticalServicesValidate.authenFilter, statisticalController.get_damage_sum_by_province);
router.get('/countHumanDamages', statisticalServicesValidate.authenFilter, statisticalController.get_count_humanDamage);

router.get(
  '/atlas/kinhte',
  statisticalServicesValidate.authenFilter,
  statisticalController.get_atlas_statistic_kinh_te
);

router.get(
  '/atlas/sukienthientai',
  statisticalServicesValidate.authenFilter,
  statisticalController.get_atlas_statistic_su_kien_thien_tai
);

router.get('/atlas/nguoi', statisticalServicesValidate.authenFilter, statisticalController.get_atlas_statistic_nguoi);

export default router;
