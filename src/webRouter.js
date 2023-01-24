import { Router } from 'express';
import tokenRoutes from './web/routes/tokenRoutes';
import menuRoutes from './web/routes/menuRoutes';
import categoryRoutes from './web/routes/categoryRoutes';
import adsRoutes from './web/routes/adsRoutes';
import siteRoutes from './web/routes/siteRoutes';
import templateRoutes from './web/routes/templateRoutes';
import templateLayoutRoutes from './web/routes/templateLayoutRoutes';
import templateGroupRoutes from './web/routes/templateGroupRoutes';
import usersRoutes from './web/routes/usersRoutes';
import articleRoutes from './web/routes/articleRoutes';

//
import provincesRoutes from './web/routes/provincesRoutes';
import districtsRoutes from './web/routes/districtsRoutes';
import wardsRoutes from './web/routes/wardsRoutes';

import disasterGroupsRoutes from './routes/disasterGroupsRoutes';
import vulnerablePersonsRoutes from './routes/vulnerablePersonsRoutes';
import disastersRoutes from './routes/disastersRoutes';

import statisticSettingsRoutes from './web/routes/statisticSettingsRoutes';
import statisticalRoutes from './web/routes/statisticalRoutes';
/**
/**
 * Contains all API routes for the application.
 */
const router = Router();

router.use('/c/token', tokenRoutes);
router.use('/c/menus', menuRoutes);
router.use('/c/ads', adsRoutes);
router.use('/c/categories', categoryRoutes);
router.use('/c/sites', siteRoutes);
router.use('/c/templateGroups', templateGroupRoutes);
router.use('/c/templateLayouts', templateLayoutRoutes);
router.use('/c/templates', templateRoutes);
router.use('/c/users', usersRoutes);
router.use('/c/articles', articleRoutes);

//
router.use('/c/provinces', provincesRoutes);
router.use('/c/districts', districtsRoutes);
router.use('/c/wards', wardsRoutes);
router.use('/c/statisticSettings', statisticSettingsRoutes);
router.use('/c/statistical', statisticalRoutes);

router.use('/c/vulnerablePersons', vulnerablePersonsRoutes);
router.use('/c/disasterGroups', disasterGroupsRoutes);
router.use('/c/disasters', disastersRoutes);
export default router;
