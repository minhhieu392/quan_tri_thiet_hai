// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const {
  sequelize,
  users,
  species /* tblGatewayEntity, Roles */,
  speciesGroups,
  attributeGroups,
  attributes,
  attributeSuggestions
} = models;

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

        whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'species');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(species, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          distinct: true,
          logging: console.log,
          include: [
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            { model: speciesGroups, as: 'speciesGroups', required: true, attributes: ['id', 'name', 'icon'] }
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'specieservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'specieservice'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(species, {
          where: { id: id },
          attributes: att,
          include: [
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            { model: speciesGroups, as: 'speciesGroups', required: true, attributes: ['id', 'name'] }
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'specieservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'specieservice'));
      }
    }),
  get_phieuThuThap: async param => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const speciesId = param.id;
      const findSpeciesGroups = await sequelize.query(`
           call sp_get_form_speciesGroupsId_by_speciesId(${speciesId},0);
        `);

      if (findSpeciesGroups && findSpeciesGroups[0] && findSpeciesGroups[0].speciesGroupsId) {
        const currentSpeciesGroupsId = findSpeciesGroups[0].speciesGroupsId;
        const name = findSpeciesGroups[0].name;

        const result = await MODELS.findAll(attributeGroups, {
          where: { speciesGroupsId: currentSpeciesGroupsId },
          attributes: ['id', 'attributeGroupsName', 'type', 'order'],
          order: [
            ['order', 'asc'],
            [sequelize.literal('`attributes`.`order`'), 'asc'],
            [sequelize.literal('`attributes->attributeSuggestions`.`editValueStatus`'), 'asc']
          ],
          logging: true,
          include: [
            {
              model: attributes,
              as: 'attributes',
              required: false,
              attributes: [
                'id',
                'attributesName',
                'dataType',
                'viewType',
                'selectType',
                'positionType',
                'placeholder',
                'filterStatus',
                'order'
              ],
              include: [
                {
                  model: attributeSuggestions,
                  as: 'attributeSuggestions',
                  required: false,
                  attributes: ['id', 'attributeSuggestionsName', 'editValueStatus']
                }
              ]
            }
          ]
        }).catch(err => {
          ErrorHelpers.errorThrow(err, 'getInfoError', 'speciesGroupservice');
        });

        if (!result) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            message: 'Nguồn gen chưa được thiết lập phiếu thu thập thông tin'
          });
        }

        return {
          info: {
            speciesGroupsId: currentSpeciesGroupsId,
            name: name
          },
          data: result
        };
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Nguồn gen chưa được thiết lập phiếu thu thập thông tin'
        });
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getInfoError', 'speciesGroupservice');
    }
  },
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);
      let whereFilter = {
        name: entity.name
      };
      // api.species.identificationCode

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'species');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(species, { attributes: ['id'], where: whereFilter }),
            entity.name ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.species.name' }
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

      finnalyResult = await MODELS.create(species, entity).catch(error => {
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
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'specieservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(species, {
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

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'species');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(species, { attributes: ['id'], where: whereFilter }),
              entity.name ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.species.name' }
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

        await MODELS.update(species, { ...entity, dateUpdated: new Date() }, { where: { id: Number(param.id) } }).catch(
          error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          }
        );

        finnalyResult = await MODELS.findOne(species, { where: { id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'specieservice');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(species, {
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
                species,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(species, { where: { id: param.id } })
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

      const foundProvince = await MODELS.findOne(species, {
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
        await MODELS.destroy(species, { where: { id: parseInt(param.id) } });

        const provinceAfterDelete = await MODELS.findOne(species, { where: { Id: param.id } }).catch(err => {
          ErrorHelpers.errorThrow(err, 'crudError', 'specieservice');
        });

        if (provinceAfterDelete) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'deleteError'
          });
        }
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'crudError', 'specieservice');
    }

    return { status: 1 };
  },

  bulk_create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      if (entity.species) {
        finnalyResult = await Promise.all(
          entity.species.map(element => {
            return MODELS.createOrUpdate(
              species,
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
