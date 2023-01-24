import Model from '../models/models';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import viMessage from '../locales/vi';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import _ from 'lodash';
import MODELS from '../models/models';

const { requestGroups, users, requests, responses } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;
        let whereFilter = filter;

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(
          ['requestGroupsName'],
          whereFilter,
          'requestGroups'
        );

        if (!whereFilter) {
          whereFilter = { ...filter };
        }
        const att = filterHelpers.atrributesHelper(attributes);

        Model.findAndCountAll(requestGroups, {
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          attributes: att,
          distinct: true,
          include: [
            {
              model: users,
              attributes: ['username', 'image', 'fullname', 'mobile', 'email'],
              as: 'userCreators',
              required: true
            }
          ]
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'GroupSiteService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'GroupSiteService'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        Model.findOne(requestGroups, {
          where: { id },
          attributes: att,
          include: [
            {
              model: users,
              attributes: ['username', 'image', 'fullname', 'mobile', 'email'],
              as: 'userCreators',
              required: true
            }
          ]
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'GroupSiteService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'GroupSiteService'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      const whereFilter = {
        requestGroupsName: entity.requestGroupsName
      };
      // whereFilter = await filterHelpers.makeStringFilterAbsolutely(['requestGroupsName'], whereFilter, 'requestGroups');
      const dupGroupSite = await preCheckHelpers.createPromiseCheckNew(
        Model.findOne(requestGroups, {
          attributes: ['id'],
          where: whereFilter
        }),

        entity.requestGroupsName ? true : false,
        TYPE_CHECK.CHECK_DUPLICATE,
        { parent: 'api.requestGroups.name' }
      );

      if (!preCheckHelpers.check([dupGroupSite])) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }
      finnalyResult = await Model.create(requestGroups, param.entity).catch(error => {
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
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'requestGroupsService');
    }

    return { result: finnalyResult };
  },
    update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      const foundProvince = await MODELS.findOne(requestGroups, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'khong tim thay thong tin loai yeu cau!',
          error
        });
      });

      if (foundProvince) {
        const foundRequest = await MODELS.findOne(requests, {
          where: {
            requestGroupsId: param.id
          }
        });
        const foundResponse = await MODELS.findOne(responses, {
          where: {
            requestGroupsId: param.id
          }
        });

        let whereFilter = {
          id: { $ne: param.id },
          requestGroupsName: entity.requestGroupsName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(
          ['requestGroupsName'],
          whereFilter,
          'requestGroups'
        );

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(requestGroups, { attributes: ['id'], where: whereFilter }),
              entity.requestGroupsName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.requestGroups.name' }
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
        if (foundRequest === null && foundResponse === null) {
          await MODELS.update(
            requestGroups,
            { ...entity, dateUpdated: new Date() },
            { where: { id: Number(param.id) } }
          ).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          })
          finnalyResult = await MODELS.findOne(requestGroups, {
            where: {
              id: param.id
            }
          });
        } else {
          param.entity.status = 1;
          param.entity.unitName = param.entity.unitName || foundProvince.unitName;

          await MODELS.update(
            requestGroups,
            { status: 0, dateUpdated: new Date() },
            { where: { id: Number(param.id) } }
          )
          finnalyResult = await Model.create(requestGroups, param.entity).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
        }
        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thất bại'
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'requestGroupsService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(requestGroups, {
          where: {
            id
          },
          logging: console.log
        })
          .then(findEntity => {
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              MODELS.update(
                requestGroups,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  MODELS.findOne(requestGroups, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'requestGroupsService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'requestGroupsService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'requestGroupsService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'requestGroupsService'));
      }
    })
};
