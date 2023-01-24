import moment from 'moment';
import MODELS from '../models/models';
import models from '../entity/index';
// import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';

import { sequelize } from '../db/sequelize';
import { Model } from 'mongoose';

const {
  // sequelize,
  users,
  disasters,
  disasterGroups,
  districts,
  provinces,
  disastersAffectedAreas,
  disasterGroupsDisasters,
  wards,
  humanDamages,
  damages
} = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sortBy, attributes } = param;

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        let att = attributes ? attributes : '';

        if (att) {
          att =
            'disasters.' +
            att

              .replace(',disasterGroups', '')
              .replace(',disastersAffectedAreas', '')
              .replace(/,/gims, ',disasters.');
          console.log('attt', att);
        }

        console.log('filter', {
          in_id: filter.id ? `(${filter.id})` : '',
          in_disastersName: filter.disastersName || '',
          in_disasterGroupsId: filter.disasterGroupsId || '',
          in_provincesId: filter.provincesId || '',
          in_districtsId: filter.districtsId || '',
          in_wardsId: filter.wardsId || '',
          in_isActive: Number(filter.isActive) === 0 ? 0 : filter.isActive || -99,
          in_status: Number(filter.status) === 0 ? 0 : filter.status || -99,
          in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
          in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : '',
          in_orderBy: sortBy[0],
          in_order: sortBy[1],
          in_attributes: att,
          in_start_page: range[0],
          in_end_page: range[1] - range[0] + 1
        });

        const result = await sequelize
          .query(
            'call sp_disasters_get_list(:in_id,:in_disastersName,:in_disasterGroupsId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_isActive,:in_status,:in_FromDate,:in_ToDate,:in_orderBy,:in_order,:in_attributes,:in_start_page,:in_end_page);',
            {
              replacements: {
                in_id: filter.id ? `(${filter.id})` : '',
                in_disastersName: filter.disastersName || '',
                in_disasterGroupsId: filter.disasterGroupsId || '',
                in_provincesId: filter.provincesId || '',
                in_districtsId: filter.districtsId || '',
                in_wardsId: filter.wardsId || '',
                in_isActive: Number(filter.isActive) === 0 ? 0 : filter.isActive || -99,
                in_status: Number(filter.status) === 0 ? 0 : filter.status || -99,
                in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
                in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : '',
                in_orderBy: sortBy[0],
                in_order: sortBy[1],
                in_attributes: att,
                in_start_page: range[0],
                in_end_page: range[1] - range[0] + 1
              },

              type: sequelize.QueryTypes.SELECT
            }
          )
          .catch(err => {
            console.log('err', err);
          });

        console.log('re', result);
        delete result[0].meta;

        const rows = Object.values(result[0]);

        resolve({
          rows,
          page: page + 1,
          perPage,
          count: result[result.length - 2]['0'].count || 0
        });
      } catch (err) {
        console.log('err', err);
        reject(ErrorHelpers.errorReject(err, 'getListError', 'Groupstorieservice'));
      }
    }),
  get_all: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sortBy, attributes } = param;

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        let att = attributes ? attributes : '';

        if (att) {
          att =
            'disasters.' +
            att

              .replace(',disasterGroups', '')
              .replace(',disastersAffectedAreas', '')
              .replace(/,/gims, ',disasters.');
          console.log('attt', att);
        }

        console.log('filter', {
          in_id: filter.id ? `(${filter.id})` : '',
          in_disastersName: filter.disastersName || '',
          in_disasterGroupsId: filter.disasterGroupsId || '',
          in_provincesId: filter.provincesId || '',
          in_districtsId: filter.districtsId || '',
          in_wardsId: filter.wardsId || '',
          in_isActive: Number(filter.isActive) === 0 ? 0 : filter.isActive || -99,
          in_status: Number(filter.status) === 0 ? 0 : filter.status || -99,
          in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
          in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : '',
          in_orderBy: sortBy[0],
          in_order: sortBy[1]
        });

        const result = await sequelize
          .query(
            'call sp_disasters_get_all(:in_id,:in_disastersName,:in_disasterGroupsId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_isActive,:in_status,:in_FromDate,:in_ToDate,:in_orderBy,:in_order);',
            {
              replacements: {
                in_id: filter.id ? `(${filter.id})` : '',
                in_disastersName: filter.disastersName || '',
                in_disasterGroupsId: filter.disasterGroupsId || '',
                in_provincesId: filter.provincesId || '',
                in_districtsId: filter.districtsId || '',
                in_wardsId: filter.wardsId || '',
                in_isActive: Number(filter.isActive) === 0 ? 0 : filter.isActive || -99,
                in_status: Number(filter.status) === 0 ? 0 : filter.status || -99,
                in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
                in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : '',
                in_orderBy: sortBy[0],
                in_order: sortBy[1]
              },

              type: sequelize.QueryTypes.SELECT
            }
          )
          .catch(err => {
            console.log('err', err);
          });

        console.log('re', result);

        delete result[0].meta;
        // console.log('re', JSON.stringify(result[0]['0']));
        const rows = Object.values(result[0]);

        resolve({
          rows,
          page: page + 1,
          perPage
        });
      } catch (err) {
        console.log('err', err);
        reject(ErrorHelpers.errorReject(err, 'getListError', 'Groupstorieservice'));
      }
    }),
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(disasters, {
          where: { id: id },
          attributes: att,
          include: [
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            {
              model: disasterGroups,
              as: 'disasterGroups',
              attributes: ['id', 'disasterGroupsName', 'icon'],
              required: true
            },
            {
              model: disastersAffectedAreas,
              as: 'disastersAffectedAreas',
              required: true,
              include: [
                {
                  model: wards,
                  as: 'wards',

                  attributes: ['id', 'wardName'],
                  required: false
                },
                {
                  model: districts,
                  as: 'districts',
                  attributes: ['id', 'districtName'],
                  required: false
                },
                {
                  model: provinces,
                  as: 'provinces',
                  attributes: ['id', 'provinceName'],
                  required: false
                }
              ]
            }
          ]
        })
          .then(async result => {
            const count = await MODELS.count(humanDamages, {
              where: { disastersId: id }
            }).catch(err => {
              reject(ErrorHelpers.errorReject(err, 'getInfoError', 'disasterservice'));
            });

            const sum = await MODELS.findAll(damages, {
              attributes: [[sequelize.fn('sum', sequelize.col('value')), 'value']],
              where: { disastersId: id }
            }).catch(err => {
              reject(ErrorHelpers.errorReject(err, 'getInfoError', 'disasterservice'));
            });

            if (!result) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            }
            resolve({ result, count, sum });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'disasterservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'disasterservice'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);

      if (!entity.disasterGroups || !entity.disasterGroups.length >= 1) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Sự kiện thiên tai phải thuộc ít nhất 1 loại thiên tai'
        });
      }

      if (!entity.disastersAffectedAreas || !entity.disastersAffectedAreas.length >= 1) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Sự kiện thiên tai phải có ít nhất 1 vùng ảnh hưởng'
        });
      }

      await sequelize.transaction(async t => {
        finnalyResult = await MODELS.create(disasters, entity, { transaction: t }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        await MODELS.bulkCreate(
          disasterGroupsDisasters,
          entity.disasterGroups.map(e => {
            return {
              disastersId: finnalyResult.id,
              disasterGroupsId: e.id
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

        await MODELS.bulkCreate(
          disastersAffectedAreas,
          entity.disastersAffectedAreas.map(e => {
            let zone = 1;

            if (Number(e.wardsId) > 0) {
              zone = 3;
            } else if (Number(e.districtsId) > 0) {
              zone = 2;
            } else if (Number(e.districtsId) > 0) {
              zone = 1;
            }
            delete e.id;

            return {
              disastersId: finnalyResult.id,
              ...e,
              zone: zone
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
      ErrorHelpers.errorThrow(error, 'crudError', 'disasterservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(disasters, {
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

      if (entity.disasterGroups && !entity.disasterGroups.length >= 1) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Sự kiện thiên tai phải thuộc ít nhất 1 loại thiên tai'
        });
      }

      if (entity.disastersAffectedAreas && !entity.disastersAffectedAreas.length >= 1) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Sự kiện thiên tai phải có ít nhất 1 vùng ảnh hưởng'
        });
      }

      if (foundProvince) {
        sequelize.transaction(async t => {
          await MODELS.update(
            disasters,
            { ...entity, dateUpdated: new Date() },
            { where: { id: Number(param.id) } }
          ).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          if (entity.disasterGroups) {
            await MODELS.destroy(disasterGroupsDisasters, {
              transaction: t,
              where: {
                disastersId: finnalyResult.id
              }
            }).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });
            await MODELS.bulkCreate(
              disasterGroupsDisasters,
              entity.disasterGroups.map(e => {
                return {
                  disastersId: finnalyResult.id,
                  disasterGroupsId: e.id
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
          }

          if (entity.disastersAffectedAreas) {
            await MODELS.destroy(disastersAffectedAreas, {
              transaction: t,
              where: {
                disastersId: finnalyResult.id
              }
            }).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });

            await MODELS.bulkCreate(
              disastersAffectedAreas,
              entity.disastersAffectedAreas.map(e => {
                let zone = 1;

                if (Number(e.wardsId) > 0) {
                  zone = 3;
                } else if (Number(e.districtsId) > 0) {
                  zone = 2;
                } else if (Number(e.districtsId) > 0) {
                  zone = 1;
                }

                delete e.id;

                return {
                  disastersId: finnalyResult.id,
                  ...e,
                  zone: zone
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
          }
        });

        finnalyResult = await MODELS.findOne(disasters, { where: { id: param.id } }).catch(error => {
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
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'disasterservice');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(disasters, {
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
                disasters,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(disasters, { where: { id: param.id } })
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
