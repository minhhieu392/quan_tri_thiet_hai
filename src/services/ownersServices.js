// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { sequelize, owners /* tblGatewayEntity, Roles */, villages, wards, districts, provinces } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        let whereFilter = _.omit(filter, [
          'provincesId',
          'districtsId',
          'wardsId',
          'individualsId',
          'speciesId',
          'speciesGroupsId',
          'individualsName',
          'individualsCode',
          'speciesName'
        ]);

        const whereVillages = _.pick(filter, ['wardsId']);
        const whereWards = _.pick(filter, ['districtsId']);
        const whereDistricts = _.pick(filter, ['provincesId']);

        const att = filterHelpers.atrributesHelper(attributes);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }
        const villagesId = Number(filter.villagesId) || 0;
        const provincesId = Number(filter.provincesId) || 0;
        const districtsId = Number(filter.districtsId) || 0;
        const wardsId = Number(filter.wardsId) || 0;
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'owners');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('whereFilter', JSON.stringify(whereFilter));
        if (
          filter.individualsId ||
          filter.speciesId ||
          filter.speciesGroupsId ||
          filter.individualsName ||
          filter.individualsCode ||
          filter.speciesName
        ) {
          if (filter.speciesGroupsId) {
            filter.speciesGroupsId = filter.speciesGroupsId.split(',');
          } else {
            filter.speciesGroupsId = [];
          }
          whereFilter = {
            ...whereFilter,
            ...{
              $and: sequelize.literal(
                `fn_owners_filter2(owners.id,${filter.individualsId || 0},${filter.speciesId || 0},'${JSON.stringify(
                  filter.speciesGroupsId
                )}',"${filter.individualsName || ''}","${filter.individualsCode || ''}","${filter.speciesName ||
                  ''}")= 1`
              )
            }
          };
        }
        console.log(
          'where',
          `fn_owners_filter2(owners.id,${filter.individualsId || 0},${filter.speciesId || 0},'${JSON.stringify(
            filter.speciesGroupsId
          )}',"${filter.individualsName || ''}","${filter.individualsCode || ''}","${filter.speciesName || ''}")= 1`
        );

        MODELS.findAndCountAll(owners, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          distinct: true,
          logging: console.log,
          include: [
            {
              model: villages,
              as: 'villages',
              attributes: ['id', 'villageName'],
              where: whereVillages,
              include: [
                {
                  model: wards,
                  as: 'wards',
                  attributes: ['id', 'wardName'],
                  where: whereWards,
                  include: [
                    {
                      model: districts,
                      as: 'districts',
                      attributes: ['id', 'districtName', 'provincesId'],
                      where: whereDistricts,
                      include: [
                        {
                          model: provinces,
                          as: 'provinces',
                          attributes: ['id', 'provinceName']
                        }
                      ]
                    }
                  ]
                }
              ]
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'ownerservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'ownerservice'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(owners, {
          where: { id: id },
          attributes: att,
          include: [
            {
              model: villages,
              as: 'villages',
              attributes: ['id', 'villageName'],
              include: [
                {
                  model: wards,
                  as: 'wards',
                  attributes: ['id', 'wardName'],
                  include: [
                    {
                      model: districts,
                      as: 'districts',
                      attributes: ['id', 'districtName', 'provincesId'],
                      include: [
                        {
                          model: provinces,
                          as: 'provinces',
                          attributes: ['id', 'provinceName']
                        }
                      ]
                    }
                  ]
                }
              ]
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ownerservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ownerservice'));
      }
    }),
  get_detail: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;

        let att = filterHelpers.atrributesHelper(param.attributes);

        att = att && att.length > 0 ? att : ['id', 'villagesId', 'name', 'note', 'status', 'points'];

        att = [...att, [sequelize.literal('fn_individuals_by_owner(owners.id)'), 'individuals']];
        MODELS.findOne(owners, {
          where: { id: id },
          attributes: att,
          include: [
            {
              model: villages,
              as: 'villages',
              attributes: ['id', 'villageName'],
              include: [
                {
                  model: wards,
                  as: 'wards',
                  attributes: ['id', 'wardName'],
                  include: [
                    {
                      model: districts,
                      as: 'districts',
                      attributes: ['id', 'districtName', 'provincesId'],
                      include: [
                        {
                          model: provinces,
                          as: 'provinces',
                          attributes: ['id', 'provinceName']
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        })
          .then(result => {
            console.log('result', result);
            result.dataValues.individuals = JSON.parse(result.dataValues.individuals);
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ownerservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'ownerservice'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);
      let whereFilter = {
        name: entity.name
      };
      // api.owners.identificationCode

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'owners');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(owners, { attributes: ['id'], where: whereFilter }),
            entity.name ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.owners.name' }
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

      finnalyResult = await MODELS.create(owners, entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'ownerservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(owners, {
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
          name: entity.name
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'owners');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(owners, { attributes: ['id'], where: whereFilter }),
              entity.name ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.owners.name' }
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

        await MODELS.update(owners, { ...entity, dateUpdated: new Date() }, { where: { id: Number(param.id) } }).catch(
          error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          }
        );

        finnalyResult = await MODELS.findOne(owners, { where: { id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'ownerservice');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(owners, {
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
                owners,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(owners, { where: { id: param.id } })
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
    }),
  delete: async param => {
    try {
      console.log('delete id', param.id);

      const foundProvince = await MODELS.findOne(owners, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          error
        });
      });

      if (!foundProvince) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      } else {
        await MODELS.destroy(owners, { where: { id: parseInt(param.id) } });

        const provinceAfterDelete = await MODELS.findOne(owners, { where: { Id: param.id } }).catch(err => {
          ErrorHelpers.errorThrow(err, 'crudError', 'ownerservice');
        });

        if (provinceAfterDelete) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'deleteError'
          });
        }
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'crudError', 'ownerservice');
    }

    return { status: 1 };
  },

  bulk_create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      if (entity.owners) {
        finnalyResult = await Promise.all(
          entity.owners.map(element => {
            return MODELS.createOrUpdate(
              owners,
              {
                userCreatorsId: entity.userCreatorsId,
                ..._.omit(element, ['id'])
              },
              {
                where: {
                  id: element.id
                }
              }
            ).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            });
          })
        );
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'WardService');
    }

    return { result: finnalyResult ? true : false };
  }
};
