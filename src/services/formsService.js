// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
// import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import treeHelper from '../helpers/treeHelper';

const { sequelize, users, forms, formsTargets, targets } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        let whereFilter = filter;
        const att = filterHelpers.atrributesHelper(attributes);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['formsName'], whereFilter, 'forms');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(forms, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          // distinct: true,
          logging: true,
          include: [{ model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] }]
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'formservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'formservice'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(forms, {
          where: { id: id },
          attributes: att,
          include: [{ model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] }]
        })
          .then(result => {
            if (!result) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            }
            resolve(result);
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'formservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'formservice'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);
      let whereFilter = {
        formsName: entity.formsName
      };
      // api.forms.identificationCode

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['formsName'], whereFilter, 'forms');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(forms, { attributes: ['id'], where: whereFilter }),
            entity.formsName ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.forms.formsName' }
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

      await sequelize.transaction(async t => {
        if (Number(entity.isDefault) === 1) {
          await MODELS.update(forms, { isDefault: 0 }, { transaction: t }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
        }

        finnalyResult = await MODELS.create(forms, entity, { transaction: t }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        await MODELS.bulkCreate(
          formsTargets,
          entity.targets.map(e => {
            return {
              targetsId: e,
              formsId: finnalyResult.id
            };
          }),
          { transaction: t }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      });
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'formservice');
    }

    return { result: finnalyResult };
  },
  get_targets_tree: async param => {
    let finnalyResult;
    const { id } = param;

    const attributes = 'id,parentId,targetsCode,targetsName,finalLevel,valueStatus,unitName';

    const parentKey = 'parentId';
    const currentKey = 'id';

    const att = filterHelpers.atrributesHelper(attributes);

    let result;

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      result = await MODELS.findAll(targets, {
        where: { status: 1, finalLevel: 0 },

        attributes: att,
        order: [['parentId', 'desc']],
        include: [
          {
            model: formsTargets,
            as: 'formsTargets',
            required: false,
            where: {
              formsId: id
            }
          }
        ]
      }).catch(error => {
        throw error;
      });

      if (result) {
        result = JSON.parse(JSON.stringify(result));

        console.log('2', result, currentKey, parentKey, 0);

        const resultTree = treeHelper.createTreeCheckSelect(result, currentKey, parentKey, 0, 'formsTargets');

        finnalyResult = {
          rows: resultTree,
          count: resultTree.length // result.count
        };
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
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(forms, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của Tỉnh/Thành phố thất bại!',
          error
        });
      });

      if (foundProvince) {
        let whereFilter = {
          id: { $ne: param.id },
          formsName: entity.formsName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['formsName'], whereFilter, 'forms');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(forms, { attributes: ['id'], where: whereFilter }),
              entity.formsName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.forms.formsName' }
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

        await sequelize.transaction(async t => {
          if (Number(entity.isDefault) === 1) {
            await MODELS.update(forms, { isDefault: 0 }, { transaction: t }).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });
          }
          await MODELS.update(
            forms,
            { ...entity, dateUpdated: new Date() },
            { where: { id: Number(param.id) }, transaction: t }
          ).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          await MODELS.destroy(formsTargets, { where: { formsId: Number(param.id) }, transaction: t }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          await MODELS.bulkCreate(
            formsTargets,
            entity.targets.map(e => {
              return {
                targetsId: e,
                formsId: param.id
              };
            }),
            { transaction: t }
          ).catch(error => {
            console.log('e1', error);
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
          finnalyResult = await MODELS.findOne(forms, { where: { id: param.id }, transaction: t }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại',
              error
            });
          });

          if (!finnalyResult) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại'
            });
          }
        });
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'formservice');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(forms, {
          where: {
            id
          },
          logging: console.log
        })
          .then(findEntity => {
            // console.log("findPlace: ", findPlace)
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              MODELS.update(
                forms,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(forms, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
      }
    })
};
