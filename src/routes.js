import { Router } from 'express';
import adsPositionRoutes from './routes/adsPositionRoutes';
import adsRoutes from './routes/adsRoutes';
import adsTypeRoutes from './routes/adsTypeRoutes';
import categoryRoutes from './routes/categoryRoutes';
import currentUserRoutes from './routes/currentUserRoutes';
import groupSiteRoutes from './routes/groupSiteRoutes';
import menuPositionRoutes from './routes/menuPositionRoutes';
import menuRoutes from './routes/menuRoutes';
import siteProfileRoutes from './routes/siteProfileRoutes';
import siteRoutes from './routes/siteRoutes';
import templateGroupRoutes from './routes/templateGroupRoutes';
import templateLayoutRoutes from './routes/templateLayoutRoutes';
import templateRoutes from './routes/templateRoutes';
import tokenRoutes from './routes/tokenRoutes';
import userGroupRolesRoutes from './routes/userGroupRolesRoutes';
import userGroupsRoutes from './routes/userGroupsRoutes';
import userPassRoutes from './routes/userPassRoutes';
import usersRoutes from './routes/usersRoutes';
import swaggerSpec from './utils/swagger';
import languagesRoutes from './routes/languagesRoutes';
import articleRoutes from './routes/articleRoutes';
import userTokensRoutes from './routes/userTokensRoutes';

//
import requestsRoutes from './routes/requestsRoutes';
import responsesRoutes from './routes/responsesRoutes';
import humanDamagesRoutes from './routes/humanDamagesRoutes';
import vulnerablePersonsRoutes from './routes/vulnerablePersonsRoutes';
import damagesRoutes from "./routes/damagesRoutes";
import supportSourcesRoutes from "./routes/supportSourcesRoutes";
//
import provincesRoutes from './routes/provincesRoutes';
import districtsRoutes from './routes/districtsRoutes';
import wardsRoutes from './routes/wardsRoutes';
import villagesRoutes from './routes/villagesRoutes';

import statisticalRoutes from './routes/statisticalRoutes';
//
import disasterGroupsRoutes from './routes/disasterGroupsRoutes';
import disastersRoutes from './routes/disastersRoutes';
import targetsRoutes from './routes/targetsRoutes';
//
import requestGroupsRoutes from './routes/requestGroupsRoutes';
import formsRoutes from './routes/formsRoutes';
import statisticSettingsRoutes from './routes/statisticSettingsRoutes';

/**
 * Contains all API routes for the application.
 */
const router = Router();

/**
 * GET /swagger.json
 */
router.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

/**
 * GET /api
 */
router.get('/', (req, res) => {
  res.json({
    app: req.app.locals.title,
    apiVersion: req.app.locals.version
  });
});

router.use('/c/token', tokenRoutes);
router.use('/c/currentUser', currentUserRoutes);
router.use('/c/users', usersRoutes);
router.use('/c/userspass', userPassRoutes);
router.use('/c/menus', menuRoutes);
router.use('/c/adsPositions', adsPositionRoutes);
router.use('/c/adsTypes', adsTypeRoutes);
router.use('/c/ads', adsRoutes);
router.use('/c/categories', categoryRoutes);
router.use('/c/groupSites', groupSiteRoutes);
router.use('/c/menuPositions', menuPositionRoutes);
router.use('/c/sites', siteRoutes);
router.use('/c/templateLayouts', templateLayoutRoutes);
router.use('/c/templates', templateRoutes);
router.use('/c/templateGroups', templateGroupRoutes);
router.use('/c/siteProfiles', siteProfileRoutes);
router.use('/c/userGroups', userGroupsRoutes);
router.use('/c/userGroupRoles', userGroupRolesRoutes);
router.use('/c/languages', languagesRoutes);
router.use('/c/articles', articleRoutes);

//
router.use('/c/provinces', provincesRoutes);
router.use('/c/villages', villagesRoutes);
router.use('/c/districts', districtsRoutes);
router.use('/c/wards', wardsRoutes);
router.use('/c/userTokens', userTokensRoutes);

//
router.use('/c/statistical', statisticalRoutes);
//
router.use('/c/humanDamages', humanDamagesRoutes);

router.use('/c/requestGroups', requestGroupsRoutes);
router.use('/c/requests', requestsRoutes);
router.use('/c/responses', responsesRoutes);
router.use('/c/humanDamages', humanDamagesRoutes);
router.use('/c/vulnerablePersons', vulnerablePersonsRoutes);
router.use('/c/damages', damagesRoutes);
router.use('/c/supportSources', supportSourcesRoutes);

router.use('/c/disasterGroups', disasterGroupsRoutes);
router.use('/c/disasters', disastersRoutes);
router.use('/c/targets', targetsRoutes);
router.use('/c/forms', formsRoutes);
router.use('/c/statisticSettings', statisticSettingsRoutes);
export default router;
