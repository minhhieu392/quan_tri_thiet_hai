export default models => {
  // eslint-disable-next-line no-empty-pattern
  const {
    ads,
    adsPositions,
    adsType,
    sites,
    categories,
    languages,
    templates,
    templateGroups,
    templateLayouts,
    categoriesTemplateLayouts,
    users,
    menuPositions,
    menus,
    groupSites,
    categoriesUrlSlugs,
    templateLayoutTemplates,
    siteProfiles,
    userGroupRoles,
    userGroups,
    article,
    articlesUrlSlugs,
    //  tinh-thanhpho
    provinces,
    wards,
    districts,
    villages,
    userTokens,
    //
    requestGroups,
    requests,
    responses,
    //
    disasterGroups,
    disasters,
    //
    humanDamages,
    vulnerablePersons,
    disastersAffectedAreas,
    disasterGroupsDisasters,
    damages,
    //
    supportSources,
    targets,
    formsTargets,
    forms,
    statisticSettings
  } = models;
  //
  //

  supportSources.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  //
  damages.belongsTo(disasters, {
    foreignKey: 'disastersId',
    as: 'disasters'
  });
  damages.belongsTo(targets, {
    foreignKey: 'targetsId',
    as: 'targets'
  });
  damages.belongsTo(wards, {
    foreignKey: 'wardsId',
    as: 'wards'
  });
  //
  vulnerablePersons.hasMany(humanDamages, {
    foreignKey: 'vulnerablePersonsId',
    as: 'humanDamages'
  });
  vulnerablePersons.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  //
  humanDamages.belongsTo(vulnerablePersons, {
    foreignKey: 'vulnerablePersonsId',
    as: 'vulnerablePersons'
  });

  humanDamages.belongsTo(disasters, {
    foreignKey: 'disastersId',
    as: 'disasters'
  });
  humanDamages.belongsTo(wards, {
    foreignKey: 'wardsId',
    as: 'wards'
  });
  //
  responses.belongsTo(supportSources, {
    foreignKey: 'supportSourcesId',
    as: 'supportSources'
  });

  responses.belongsTo(wards, {
    foreignKey: 'wardsId',
    as: 'wards'
  });
  responses.belongsTo(requestGroups, {
    foreignKey: 'requestGroupsId',
    as: 'requestGroups'
  });
  responses.belongsTo(disasters, {
    foreignKey: 'disastersId',
    as: 'disasters'
  });
  //
  requests.belongsTo(wards, {
    foreignKey: 'wardsId',
    as: 'wards'
  });

  requests.belongsTo(disasters, {
    foreignKey: 'disastersId',
    as: 'disasters'
  });
  requests.belongsTo(requestGroups, {
    foreignKey: 'requestGroupsId',
    as: 'requestGroups'
  });
  //
  requestGroups.hasMany(requests, {
    foreignKey: 'requestGroupsId',
    as: 'requestGroups_req'
  });
  requestGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  // NHÓM NGƯỜI DÙNG
  userGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  // Quyền
  userGroupRoles.belongsTo(menus, {
    foreignKey: 'menusId',
    as: 'menus'
  });
  userGroupRoles.belongsTo(userGroups, {
    foreignKey: 'userGroupsId',
    as: 'userGroups'
  });

  menus.belongsTo(menus, {
    foreignKey: 'parentId',
    as: 'parent'
  });
  menus.belongsTo(menuPositions, {
    foreignKey: 'menuPositionsId',
    as: 'menuPositions'
  });
  menus.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });
  menus.belongsTo(sites, {
    foreignKey: 'sitesId',
    as: 'sites'
  });

  menus.hasMany(userGroupRoles, {
    foreignKey: 'menusId',
    as: 'userGroupRoles'
  });
  menuPositions.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  sites.belongsTo(templates, {
    foreignKey: 'templatesId',
    as: 'templates'
  });
  sites.belongsTo(groupSites, {
    foreignKey: 'groupSitesId',
    as: 'groupSites'
  });
  sites.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  templateLayouts.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  templates.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  users.belongsTo(userGroups, {
    foreignKey: 'userGroupsId',
    as: 'userGroups'
  });
  users.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'usersCreators'
  });

  adsPositions.belongsTo(sites, {
    foreignKey: 'sitesId',
    as: 'sites'
  });
  adsPositions.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  ads.belongsTo(sites, {
    foreignKey: 'sitesId',
    as: 'sites'
  });
  ads.belongsTo(adsPositions, {
    foreignKey: 'adsPositionsId',
    as: 'adsPositions'
  });
  ads.belongsTo(adsType, {
    foreignKey: 'adsTypeId',
    as: 'adsType'
  });
  ads.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  adsType.belongsTo(sites, {
    foreignKey: 'sitesId',
    as: 'sites'
  });
  adsType.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  // categories.belongsTo(templateLayouts, { foreignKey: 'templateLayoutsId', as: 'templateLayouts' });

  // categories.belongsTo(categoriesTemplateLayouts, { foreignKey: 'categoriesId', as: 'categories' });
  categories.belongsToMany(templateLayouts, {
    through: { model: categoriesTemplateLayouts, unique: false },
    foreignKey: 'categoriesId',
    as: 'templateLayouts'
  });
  categories.hasMany(categoriesTemplateLayouts, {
    foreignKey: 'categoriesId',
    as: 'categoriesTemplateLayout'
  });

  templateLayouts.belongsToMany(categories, {
    through: { model: categoriesTemplateLayouts, unique: false },
    foreignKey: 'templateLayoutsId',
    as: 'categories'
  });
  categoriesTemplateLayouts.belongsTo(templateLayouts, {
    foreignKey: 'templateLayoutsId',
    as: 'templateLayouts'
  });
  categories.hasMany(categoriesUrlSlugs, {
    foreignKey: 'categoriesId',
    as: 'categoriesUrlSlugs'
  });

  categories.belongsTo(sites, {
    foreignKey: 'sitesId',
    as: 'sites'
  });
  categories.belongsTo(categories, {
    foreignKey: 'parentId',
    as: 'parent'
  });
  categories.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  groupSites.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  templates.belongsTo(templateGroups, {
    foreignKey: 'templateGroupsId',
    as: 'templateGroups'
  });
  templates.hasOne(sites, {
    foreignKey: 'templatesId',
    as: 'sites'
  });
  templateGroups.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });

  templateLayouts.belongsToMany(templates, {
    through: { model: templateLayoutTemplates, unique: false },
    foreignKey: 'templateLayoutsId',
    as: 'templates'
  });

  templates.belongsToMany(templateLayouts, {
    through: { model: templateLayoutTemplates, unique: false },
    foreignKey: 'templatesId',
    as: 'templateLayouts'
  });

  templates.hasMany(templateLayoutTemplates, {
    foreignKey: 'templatesId',
    as: 'templateLayoutTemplates'
  });

  siteProfiles.belongsTo(sites, {
    foreignKey: 'sitesId',
    as: 'sites'
  });

  sites.hasMany(siteProfiles, {
    foreignKey: 'sitesId',
    as: 'siteProfiles'
  });

  ads.belongsTo(languages, {
    foreignKey: 'languagesId',
    as: 'languages'
  });

  categories.belongsTo(languages, {
    foreignKey: 'languagesId',
    as: 'languages'
  });
  menus.belongsTo(languages, {
    foreignKey: 'languagesId',
    as: 'languages'
  });
  siteProfiles.belongsTo(languages, {
    foreignKey: 'languagesId',
    as: 'languages'
  });

  article.belongsTo(categories, {
    foreignKey: 'categoriesId',
    as: 'categories'
  });
  article.belongsTo(users, {
    foreignKey: 'usersCreatorId',
    as: 'usersCreator'
  });
  article.hasMany(articlesUrlSlugs, {
    foreignKey: 'articlesId',
    as: 'articlesUrlSlugs'
  });

  // tinh -tp
  villages.belongsTo(wards, {
    foreignKey: 'wardsId',
    as: 'wards'
  });
  villages.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  wards.hasMany(villages, {
    foreignKey: 'wardsId',
    as: 'villages'
  });

  wards.belongsTo(districts, {
    foreignKey: 'districtsId',
    as: 'districts'
  });
  wards.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  districts.belongsTo(provinces, {
    foreignKey: 'provincesId',
    as: 'provinces'
  });
  districts.hasMany(wards, {
    foreignKey: 'districtsId',
    as: 'wards'
  });
  districts.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  provinces.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  users.hasMany(userTokens, {
    foreignKey: 'usersId',
    as: 'userTokens'
  });

  userTokens.belongsTo(users, {
    foreignKey: 'usersId',
    as: 'users'
  });

  //
  disasterGroups.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  disasters.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });
  disasters.belongsToMany(disasterGroups, {
    foreignKey: 'disastersId',
    through: { model: disasterGroupsDisasters },
    as: 'disasterGroups'
  });

  disasterGroups.belongsToMany(disasters, {
    foreignKey: 'disasterGroupsId',
    through: { model: disasterGroupsDisasters },
    as: 'disasters'
  });
  disasters.hasMany(disastersAffectedAreas, {
    foreignKey: 'disastersId',
    as: 'disastersAffectedAreas'
  });

  disastersAffectedAreas.belongsTo(provinces, {
    foreignKey: 'provincesId',
    as: 'provinces'
  });

  disastersAffectedAreas.belongsTo(districts, {
    foreignKey: 'districtsId',
    as: 'districts'
  });
  disastersAffectedAreas.belongsTo(wards, {
    foreignKey: 'wardsId',
    as: 'wards'
  });
  disasters.hasMany(humanDamages, {
    foreignKey: 'disastersId',
    as: 'humanDamages'
  });

  targets.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });

  forms.belongsTo(users, {
    foreignKey: 'userCreatorsId',
    as: 'userCreators'
  });

  targets.hasOne(formsTargets, {
    foreignKey: 'targetsId',
    as: 'formsTargets'
  });

  targets.hasOne(damages, {
    foreignKey: 'targetsId',
    as: 'damages'
  });

  targets.hasOne(statisticSettings, {
    foreignKey: 'targetsId',
    as: 'statisticSettings'
  });

  statisticSettings.belongsTo(targets, {
    foreignKey: 'targetsId',
    as: 'targets'
  });

  targets.hasMany(targets, {
    foreignKey: 'parentId',
    as: 'children'
  });
};
