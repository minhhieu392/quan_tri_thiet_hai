// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import moment from 'moment';

const {
  sequelize,
  individuals,
  owners,
  species,

  attributes,
  speciesGroups,
  attributeGroups,
  attributeSuggestions,
  attributeValues,
  villages,
  wards,
  districts,
  users,
  provinces
} = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sortBy } = param;

        let attributes = param.attributes || '';

        if (attributes) {
          const otherAttributes = ['owners', 'species', 'provinces', 'districts', 'wards', 'villages'];

          attributes = attributes.split(',').map(e => {
            if (!otherAttributes.include('e')) return 'individuals.' + e;

            return e;
          });
        }
        // +param.attributes.replace(/,/gims, ',individuals.');
        let orderBy;
        let order;

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        console.log('attributes', filter);

        console.log('sort', sortBy);
        if (sortBy) {
          orderBy = sortBy[0];
          order = sortBy[1] || 'desc';
        }
        console.log('filter', {
          in_search: filter.search || '',
          in_individualsCode: filter.code || '',
          in_individualsName: filter.name || '',
          in_ownersName: filter.ownersName || '',
          in_speciesName: filter.speciesName || '',
          in_ownersId: filter.ownersId || '',
          in_speciesGroupsId: filter.speciesGroupsId || '',
          in_speciesId: filter.speciesId || '',
          in_provincesId: filter.provincesId || '',
          in_districtsId: filter.districtsId || '',
          in_wardsId: filter.wardsId || '',
          in_villagesId: filter.villagesId || '',
          in_attributeSuggestionsId: filter.attributeSuggestionsId || '',
          in_attributeSuggestionsId_length: filter.attributeSuggestionsId
            ? filter.attributeSuggestionsId.split(',').length
            : 0,
          in_status: Number(filter.status) === 0 ? 0 : filter.status || -99,
          in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
          in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : '',
          in_orderBy: orderBy,
          in_order: order,
          in_attributes: attributes ? attributes : '',
          in_start_page: range[0],
          in_end_page: range[1] - range[0] + 1
        });

        const result = await sequelize
          .query(
            'call sp_individuals_get_list(:in_search ,:in_individualsCode ,:in_individualsName ,:in_ownersName,:in_speciesName, :in_ownersId ,:in_speciesGroupsId ,:in_speciesId ,:in_provincesId ,:in_districtsId ,:in_wardsId ,:in_villagesId,:in_attributeSuggestionsId,:in_attributeSuggestionsId_length ,:in_status,:in_FromDate, :in_ToDate, :in_orderBy, :in_order, :in_attributes ,:in_start_page ,:in_end_page  )',
            {
              replacements: {
                in_search: filter.search || '',
                in_individualsCode: filter.code || '',
                in_individualsName: filter.name || '',
                in_ownersName: filter.ownersName || '',
                in_speciesName: filter.speciesName || '',
                in_ownersId: filter.ownersId || '',
                in_speciesGroupsId: filter.speciesGroupsId || '',
                in_speciesId: filter.speciesId || '',
                in_provincesId: filter.provincesId || '',
                in_districtsId: filter.districtsId || '',
                in_wardsId: filter.wardsId || '',
                in_villagesId: filter.villagesId || '',
                in_attributeSuggestionsId: filter.attributeSuggestionsId || '',
                in_attributeSuggestionsId_length: filter.attributeSuggestionsId
                  ? filter.attributeSuggestionsId.split(',').length
                  : 0,
                in_status: Number(filter.status) === 0 ? 0 : filter.status || -99,
                in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
                in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : '',
                in_orderBy: orderBy,
                in_order: order,
                in_attributes: attributes ? attributes : '',
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
        // delete result[1].meta;
        const rows = Object.values(result[0]);

        // const outOutput = result[0]['0']['count(*)'];
        // const countList = Object.values(result[1]);

        resolve({
          count: result[result.length - 2]['0'].count,
          rows,
          page: page + 1,
          perPage
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'Groupstorieservice'));
      }
    }),
  get_all_map: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        console.log('filter', {
          in_search: filter.search || '',
          in_individualsCode: filter.code || '',
          in_individualsName: filter.name || '',
          in_ownersName: filter.ownersName || '',
          in_speciesName: filter.speciesName || '',
          in_ownersId: filter.ownersId || '',
          in_speciesGroupsId: filter.speciesGroupsId || '',
          in_speciesId: filter.speciesId || '',
          in_provincesId: filter.provincesId || '',
          in_districtsId: filter.districtsId || '',
          in_wardsId: filter.wardsId || '',
          in_villagesId: filter.villagesId || ''
        });

        const result = await sequelize
          .query(
            'call sp_individuals_get_all_map(:in_search ,:in_individualsCode ,:in_individualsName ,:in_ownersName, :in_speciesName ,:in_ownersId ,:in_speciesGroupsId ,:in_speciesId ,:in_provincesId ,:in_districtsId ,:in_wardsId ,:in_villagesId)',
            {
              replacements: {
                in_search: filter.search || '',
                in_individualsCode: filter.code || '',
                in_individualsName: filter.name || '',
                in_ownersName: filter.ownersName || '',
                in_speciesName: filter.speciesName || '',
                in_ownersId: filter.ownersId || '',
                in_speciesGroupsId: filter.speciesGroupsId || '',
                in_speciesId: filter.speciesId || '',
                in_provincesId: filter.provincesId || '',
                in_districtsId: filter.districtsId || '',
                in_wardsId: filter.wardsId || '',
                in_villagesId: filter.villagesId || ''
              },
              type: sequelize.QueryTypes.SELECT
            }
          )
          .catch(err => {
            console.log('err', err);
          });

        delete result[0].meta;
        // delete result[1].meta;
        const rows = Object.values(result[0]);

        resolve({
          rows
          // count: Object.values(result[1])
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'Groupstorieservice'));
      }
    }),

  get_one: async param => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const id = param.id;
      const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

      console.log('param', param);
      const result = await MODELS.findOne(individuals, {
        where: { id: id },
        attributes: att,
        include: [
          { model: owners, as: 'owners', attributes: ['id', 'name', 'ethnic'] },
          { model: users, as: 'userCreators', attributes: ['id', 'fullname', 'workUnit'] },
          {
            model: species,
            as: 'species',
            required: true,
            attributes: ['id', 'name', 'otherName', 'scienceName', 'speciesGroupsId'],
            include: [{ model: speciesGroups, as: 'speciesGroups', attributes: ['id', 'name', 'icon'] }]
          },
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
      }).catch(err => {
        ErrorHelpers.errorThrow(err, 'getInfoError', 'individualservice');
      });

      if (!result) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }

      if (param.phieuThuThap) {
        let currentSpeciesGroupsId;
        let name;

        let findCurrentSpeciesGroups = await sequelize.query(`
           select speciesGroupsId, speciesGroups.name from attributeValues
             inner join attributes on attributes.id = attributeValues.attributesId
             inner join attributeGroups on attributeGroups.id = attributes.attributeGroupsId
             inner join speciesGroups on speciesGroups.id = attributeGroups.speciesGroupsId
             where attributeValues.individualsId = ${id}
             limit 1
        `);

        console.log('find_currentSpeciesGroups', findCurrentSpeciesGroups);

        if (
          findCurrentSpeciesGroups[0] &&
          findCurrentSpeciesGroups[0][0] &&
          findCurrentSpeciesGroups[0][0].speciesGroupsId
        ) {
          currentSpeciesGroupsId = findCurrentSpeciesGroups[0][0].speciesGroupsId;
          name = findCurrentSpeciesGroups[0][0].name;
        } else {
          findCurrentSpeciesGroups = await sequelize.query(`
           call sp_get_form_speciesGroupsId_by_speciesId(${result.speciesId},0);
        `);

          if (findCurrentSpeciesGroups && findCurrentSpeciesGroups[0] && findCurrentSpeciesGroups[0].speciesGroupsId) {
            currentSpeciesGroupsId = findCurrentSpeciesGroups[0].speciesGroupsId;
            name = findCurrentSpeciesGroups[0].name;
          }
        }

        console.log('currentSpeciesGroupsId', currentSpeciesGroupsId);
        if (currentSpeciesGroupsId) {
          const include = [];
          const order = [
            ['order', 'asc'],
            [sequelize.literal('`attributes`.`order`'), 'asc']
          ];

          if (param.attributeSuggestions) {
            include.push({
              model: attributeSuggestions,
              as: 'attributeSuggestions',
              required: false,
              attributes: ['id', 'attributeSuggestionsName', 'editValueStatus']
            });
            order.push([sequelize.literal('`attributes->attributeSuggestions`.`editValueStatus`'), 'asc']);
          }

          const phieuThuThap = await MODELS.findAll(attributeGroups, {
            where: { speciesGroupsId: currentSpeciesGroupsId },
            attributes: ['id', 'attributeGroupsName', 'type', 'order'],
            order: order,
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
                  ...include,
                  {
                    model: attributeValues,
                    as: 'attributeValues',
                    required: false,
                    attributes: ['id', 'attributeSuggestionsId', 'value'],
                    where: {
                      individualsId: result.id
                    }
                  }
                ]
              }
            ]
          });

          if (phieuThuThap) {
            result.dataValues.phieuThuThap = {
              info: {
                speciesGroupsId: currentSpeciesGroupsId,
                name: name
              },
              data: phieuThuThap
            };
          } else {
            result.dataValues.phieuThuThap = null;
          }
        }
      }

      return result;
    } catch (err) {
      console.log('err', err);
      ErrorHelpers.errorThrow(err, 'getInfoError', 'individualservice');
    }
  },
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);
      const whereFilter = {
        code: entity.code
      };
      // api.individuals.identificationCode

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(individuals, { attributes: ['id'], where: whereFilter }),
            entity.code ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.individuals.code' }
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
        finnalyResult = await MODELS.create(individuals, entity, { transaction: t }).catch(error => {
          console.log('err', error);
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

        if (entity.phieuThuThap && entity.phieuThuThap.length > 0) {
          await MODELS.bulkCreate(
            attributeValues,
            entity.phieuThuThap.map(e => {
              return {
                ...e,
                individualsId: finnalyResult.id
              };
            }),
            { transaction: t }
          );
        }
      });
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'individualservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(individuals, {
        where: {
          id: param.id
        },
        include: [
          {
            model: attributeValues,
            as: 'attributeValues',
            attributes: [
              'id',
              'attributesId',
              'attributeSuggestionsId',
              [sequelize.literal('selectType'), 'selectType']
            ],
            include: [
              {
                model: attributes,
                as: 'attributes',
                attributes: []
              }
            ]
          }
        ]
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của Tỉnh/Thành phố thất bại!',
          error
        });
      });

      console.log('JSON', JSON.stringify(foundProvince));

      if (foundProvince) {
        const whereFilter = {
          id: { $ne: param.id },
          code: entity.code || ''
        };

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(individuals, { attributes: ['id'], where: whereFilter }),
              entity.code ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.individuals.code' }
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
          await MODELS.update(
            individuals,
            { ...entity, dateUpdated: new Date() },
            { where: { id: Number(param.id) } }
          ).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });

          console.log('entity.attributeValues', entity.attributeValues);

          if (entity.phieuThuThap && entity.phieuThuThap.length > 0) {
            const oldAttributeValues = foundProvince.attributeValues
              ? JSON.parse(JSON.stringify(foundProvince.attributeValues))
              : [];

            const newAttributeValues = entity.phieuThuThap;

            const updateAttributeValues = [];
            const deleteAttributeValuesId = [];

            oldAttributeValues.forEach(oldAtt => {
              if (Number(oldAtt.selectType) === 1) {
                deleteAttributeValuesId.push(oldAtt.id);
              } else {
                const findAttributeValues = newAttributeValues.find(
                  newAtt => Number(oldAtt.attributesId) === Number(newAtt.attributesId)
                );

                if (findAttributeValues) {
                  findAttributeValues.findStatus = true;
                  if (Number(oldAtt.attributeSuggestionsId) !== Number(findAttributeValues.attributeSuggestionsId)) {
                    updateAttributeValues.push({
                      id: oldAtt.id,
                      attributeSuggestionsId: findAttributeValues.attributeSuggestionsId,
                      value: findAttributeValues.value
                    });
                  }
                } else {
                  deleteAttributeValuesId.push(oldAtt.id);
                }
              }
            });

            const createAttributeValues = newAttributeValues.filter(e => !e.findStatus);

            // console.log('deleteAttributeValuesId', deleteAttributeValuesId);
            // console.log('createAttributeValues', createAttributeValues);
            // console.log('updateAttributeValues', updateAttributeValues);

            if (deleteAttributeValuesId.length > 0) {
              await MODELS.destroy(attributeValues, {
                where: {
                  id: { $in: deleteAttributeValuesId },
                  transaction: t
                }
              });
            }

            if (createAttributeValues.length > 0) {
              await MODELS.bulkCreate(
                attributeValues,
                createAttributeValues.map(e => {
                  return {
                    ...e,
                    individualsId: foundProvince.id
                  };
                }),
                {
                  where: {
                    id: { $in: deleteAttributeValuesId },
                    transaction: t
                  }
                }
              );
            }

            if (updateAttributeValues.length > 0) {
              await Promise.all(
                updateAttributeValues.map(async updateElement => {
                  await MODELS.update(
                    attributeValues,
                    {
                      attributeSuggestionsId: updateElement.attributeSuggestionsId,
                      value: updateElement.value
                    },
                    {
                      where: {
                        id: updateElement.id
                      },
                      transaction: t
                    }
                  );
                })
              );
            }
          }

          finnalyResult = await MODELS.findOne(individuals, { where: { id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'individualservice');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(individuals, {
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
                individuals,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(individuals, { where: { id: param.id } })
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

      const foundProvince = await MODELS.findOne(individuals, {
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
        await MODELS.destroy(individuals, { where: { id: parseInt(param.id) } });

        const provinceAfterDelete = await MODELS.findOne(individuals, { where: { Id: param.id } }).catch(err => {
          ErrorHelpers.errorThrow(err, 'crudError', 'individualservice');
        });

        if (provinceAfterDelete) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'deleteError'
          });
        }
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'crudError', 'individualservice');
    }

    return { status: 1 };
  },

  bulk_create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      if (entity.individuals) {
        finnalyResult = await Promise.all(
          entity.individuals.map(element => {
            return MODELS.createOrUpdate(
              individuals,
              {
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
