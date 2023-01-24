/* eslint-disable padding-line-between-statements */
import Model from '../models/models';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import _ from 'lodash';
import treeHelper from '../helpers/treeHelper';

const { Op, targets, users, sequelize } = models;

export default {
  get_list: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort, attributes } = param;
      let whereFilter = filter;

      console.log(attributes);
      try {
        whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);

      whereFilter = await filterHelpers.makeStringFilterRelatively(['targetsName'], whereFilter, 'targets');

      if (!whereFilter) {
        whereFilter = { ...filter };
      }
      const att = filterHelpers.atrributesHelper(attributes);

      console.log('where', whereFilter);

      const result = await Model.findAndCountAll(targets, {
        where: whereFilter,
        order: sort,
        offset: range[0],
        limit: perPage,
        attributes: att,
        logging: true,
        include: [{ model: users, as: 'userCreators', attributes: ['id', 'fullname'] }]
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getListError', 'AdsService');
      });

      finnalyResult = {
        ...result,
        page: page + 1,
        perPage
      };
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'AdsService');
    }

    return finnalyResult;
  },
  get_one: param =>
    new Promise(async (resolve, reject) => {
      try {
        console.log('get one');
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;

        const att = filterHelpers.atrributesHelper(param.attributes, ['userCreatorssId']);

        const result = await Model.findOne(targets, {
          where: { id },
          attributes: att,
          include: [{ model: users, as: 'userCreators', attributes: ['id', 'fullname'] }]
        }).catch(err => {
          reject(ErrorHelpers.errorReject(err, 'getInfoError', 'AdsService'));
        });
        if (!result) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted'
          });
        }

        resolve(result);
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'AdsService'));
      }
    }),
  get_one_tree: param => {
    return new Promise(async (resolve, reject) => {
      {
        let finnalyResult;
        const id = param.id;
        console.log('getOne', id);
        const parentKey = 'parentId';
        const currentKey = 'id';
        const include = [{ model: users, as: 'userCreators', attributes: ['id', 'fullname'] }];
        try {
          let result = await targets
            .findOne({
              where: { id: id },
              include: include
            })
            .catch(err => {
              ErrorHelpers.errorThrow(err, 'getListError', 'AdsService');
            });
          if (!result) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted'
            });
          }

          result = JSON.parse(JSON.stringify(result));
          const startTime = new Date().getTime();

          result = await treeHelper.get_tree_forOne(
            result,
            targets,
            {
              include: [],
              attributes: ['id', 'targetsCode', 'targetsName', 'parentId', 'finalLevel', 'valueStatus'],
              otherWhere: {}
            },
            parentKey,
            currentKey
          );

          const endTime = new Date().getTime();

          console.log('time', endTime - startTime);

          return resolve(result);
        } catch (err) {
          reject(ErrorHelpers.errorReject(err, 'getInfoError', 'villageService'));
        }

        return finnalyResult;
      }
    });
  },

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      if (Number(entity.parentId) > 0) {
        const productsParent = await Model.findOne(targets, {
          order: [['id', 'desc']],
          where: {
            id: entity.parentId
          }
        });

        const countChild = await sequelize.query(
          `select count(*) as count from targets where parentId = ${entity.parentId}`
        );

        console.log('count', countChild);

        entity.targetsCode =
          `${productsParent.targetsCode}` + String(Number(countChild[0][0].count || 0) + 1).padStart(2, '0');
        console.log(' entity.targetsCode =', entity.targetsCode);
      }

      finnalyResult = await Model.create(targets, param.entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo',
          message: viMessage['api.message.infoAfterCreateError']
        });
      }

      if (Number(finnalyResult.parentId) > 0) {
        await Model.update(
          targets,
          {
            finalLevel: 0
          },
          { where: { id: finnalyResult.parentId } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'AdsService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('AdsService update: ', entity);

      const foundGateway = await Model.findOne(targets, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw preCheckHelpers.createErrorCheck(
          { typeCheck: TYPE_CHECK.GET_INFO, modelStructure: { parent: 'sites' } },
          error
        );
      });

      if (foundGateway) {
        let whereFilter = {
          id: { $ne: param.id },
          targetsCode: entity.targetsCode || foundGateway.targetsCode,

          parentId: entity.parentId || foundGateway.parentId || 0
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['targetsCode'], whereFilter, 'targets');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              Model.findOne(targets, {
                where: whereFilter
              }),
              entity.targetsCode ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.targets.targetsCode' }
            )
          ])
        );

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }

        await Model.update(targets, entity, { where: { id: parseInt(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await Model.findOne(targets, {
          where: { id: param.id },
          include: [{ model: users, as: 'userCreators', attributes: ['id', 'fullname'] }]
        }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError'],
            error
          });
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: viMessage['api.message.infoAfterEditError']
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: viMessage['api.message.notExisted']
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'AdsService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;
        const parentKey = 'parentId';
        const currentKey = 'id';

        Model.findOne(targets, {
          where: {
            id
          },
          logging: console.log
        })
          .then(async findEntity => {
            // console.log("findPlace: ", findPlace)
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              if (entity.hasOwnProperty('status')) {
                const arrTreeId = [];
                const array = [findEntity];

                if (entity.status !== Number(1)) {
                  await filterHelpers.makeTreeArrayChildSearchByAllType(
                    array,
                    arrTreeId,
                    targets,
                    {},
                    parentKey,
                    currentKey
                  );
                } else if (entity.status === Number(1)) {
                  arrTreeId.push(findEntity.id);
                  // await filterHelpers.makeTreeArrayParentSearchByAllTye(
                  //   array,
                  //   arrTreeId,
                  //   targets,
                  //   {},
                  //   parentKey,
                  //   currentKey
                  // );
                }
                console.log('arrTreeId222', arrTreeId);
                const whereUpdate = {};

                whereUpdate[`${currentKey}`] = {
                  [Op.in]: arrTreeId
                };
                targets
                  .update(
                    { status: entity.status, dateUpdated: new Date() },
                    {
                      where: whereUpdate
                    }
                  )
                  .then(() => {
                    // console.log("rowsUpdate: ", rowsUpdate)
                    Model.findOne(targets, { where: { id: param.id } })
                      .then(result => {
                        if (!result) {
                          reject(
                            new ApiErrors.BaseError({
                              statusCode: 202,
                              type: 'deleteError'
                            })
                          );
                        } else resolve({ status: 1, result: result });
                      })
                      .catch(err => {
                        reject(ErrorHelpers.errorReject(err, 'crudError', 'statisticalProductsServices'));
                      });
                  })
                  .catch(err => {
                    reject(ErrorHelpers.errorReject(err, 'crudError', 'statisticalProductsServices'));
                  });
              }
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'targetsServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'targetsServices'));
      }
    }),
  get_tree: async param => {
    let finnalyResult;
    const { filter, range, sort } = param;

    const attributes = param.attributes
      ? param.attributes
      : 'id,parentId,targetsCode,targetsName,dateCreated,finalLevel,valueStatus';

    console.log('getTree', filter);

    const parentKey = 'parentId';
    const currentKey = 'id';

    if (filter.parentId && Number(filter.parentId) === 0) {
      delete filter.parentId;
    }
    let whereFilter = _.omit(filter, ['status', 'finalLevel', parentKey]);
    const otherWhere = _.pick(filter, ['finalLevel']);
    const whereParent = _.pick(filter, [parentKey]);
    const filterStatus = _.pick(filter, ['status']);
    let resultTree = [];
    let result;

    try {
      whereFilter = await filterHelpers.combineFromDateWithToDate(whereFilter);
    } catch (error) {
      throw error;
    }

    whereFilter = await filterHelpers.makeStringFilterRelatively(
      ['targetsName', 'targetsCode'],
      whereFilter,
      'targets'
    );

    console.log('whereFilter: ', whereFilter);

    console.log(
      'a',
      _.isEmpty(whereFilter) && (_.isEmpty(filterStatus) || Number(filterStatus.status) === 1),
      _.isEmpty(whereFilter)
    );
    const att = filterHelpers.atrributesHelper(attributes);

    const include = [];

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];
      result = await Model.findAll(targets, {
        where: { ...whereFilter, ...filterStatus, ...whereParent, ...otherWhere },
        order: sort,
        distinct: true,
        attributes: att,
        include: include
      }).catch(error => {
        throw error;
      });
      //  case 1: có parent Id => chỉ lấy chính nó   => tạo tree lần lượt
      // case 2: không tìm gì , (status = 1 || ! status), (parentId= 0 || !parentId) => lấy tất => tạo cây  1 thể
      //  case 3: có tìm tên || stauts <> 1 => tìm tất theo tên => tạo tree đủ lần lượt

      if (result) {
        result = JSON.parse(JSON.stringify(result));
        if (!_.isEmpty(whereParent) && Number(whereParent[parentKey]) !== 0) {
          console.log('case1');
          // case 1
          resultTree = await treeHelper.getChildren_Tree(
            result,
            targets,
            { attributes: att, include: null, otherWhere: { ...filterStatus } },
            parentKey,
            currentKey
          );
        } else if (_.isEmpty(whereFilter) && (_.isEmpty(filterStatus) || Number(filterStatus.status) === 1)) {
          // case 2
          console.log('case2');
          console.log('ko có filter', whereFilter);

          resultTree = treeHelper.createTree(result, currentKey, parentKey, 0);
        } else {
          // case 3
          console.log('case3');
          resultTree = await treeHelper.getTree_from_many_node(
            result,
            targets,
            { attributes: att, include: include, otherWhere: { ...filterStatus, ...otherWhere } },
            parentKey,
            currentKey,
            0
          );
        }

        // console.log(JSON.stringify(resultTree));

        if (range) {
          const perPage = range[1] - range[0] + 1;
          const page = Math.floor(range[0] / perPage);
          finnalyResult = {
            rows: resultTree.slice(range[0], range[1] + 1),
            count: resultTree.length, // result.count
            page: page + 1,
            perPage: perPage
          };
        } else {
          finnalyResult = {
            rows: resultTree,
            count: resultTree.length // result.count
          };
        }
      } else {
        finnalyResult = {
          rows: [],
          count: 0 // result.count
        };
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'getListError', 'MenuService');
    }

    return finnalyResult;
  }
};
