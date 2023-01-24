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
  speciesGroups,
  attributeGroups,
  attributes,
  attributeSuggestions,
  attributeValues /* tblGatewayEntity, Roles */
} = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        let whereFilter = _.omit(filter, ['name']);
        const att = filterHelpers.atrributesHelper(attributes);
        const whereStatus = _.pick(filter, ['status']);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }

        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'speciesGroups');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        let whereChildren1 = {};
        let whereChildren2 = {};

        if (filter.name) {
          whereFilter = {
            ...whereFilter,
            $and: sequelize.literal(` fn_check_speciesGroups_children_name(speciesGroups.id,"${filter.name}") > 0 `)
          };

          whereChildren1 = {
            $and: sequelize.literal(`( fn_check_speciesGroups_children_name(speciesGroups.id,"${filter.name}") = 1
                                       or UPPER(children.name) like concat('%',CONVERT(UPPER("${filter.name}"), BINARY),'%')
                                       or fn_check_speciesGroups_children_name(children.id,"${filter.name}") = 2

                                       )
            `)
          };

          whereChildren2 = {
            $and: sequelize.literal(`( fn_check_speciesGroups_children_name(speciesGroups.id,"${filter.name}") < 3
                                       or UPPER(\`children->children\`.name) like concat('%',CONVERT(UPPER("${filter.name}"), BINARY),'%')


                                       )
            `)
          };
        }
        console.log('where', whereFilter);
        whereFilter.parentId = whereFilter.parentId || 0;

        MODELS.findAndCountAll(speciesGroups, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          distinct: true,
          logging: true,
          include: [
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            {
              model: speciesGroups,
              as: 'children',
              required: false,
              attributes: ['id', 'name', 'icon'],
              where: { ...whereStatus, ...whereChildren1 },
              include: [
                {
                  model: speciesGroups,
                  as: 'children',
                  required: false,
                  attributes: ['id', 'name', 'icon'],
                  where: { ...whereStatus, ...whereChildren2 }
                }
              ]
            }
          ]
        })
          .then(result => {
            console.log('re', result);
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            console.log('Err', err);
            reject(ErrorHelpers.errorReject(err, 'getListError', 'speciesGroupservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'speciesGroupservice'));
      }
    }),
  get_phieuThuThap: async param => {
    try {
      // console.log("Menu Model param: %o | id: ", param, param.id)
      const speciesGroupsId = param.id;
      const findSpeciesGroups = await sequelize.query(`
           call nguongen.sp_get_form_speciesGroupsId_by_speciesGroupsId(${speciesGroupsId},0);
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
          message: 'Nhóm nguồn gen chỉ định và nhóm nguồn gen cấp trên chưa được thiết lập phiếu thu thập thông tin'
        });
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getInfoError', 'speciesGroupservice');
    }
  },
  get_count_individuals: async param => {
    try {
      const { filter } = param;

      let result = await MODELS.findAll(speciesGroups, {
        order: [['id', 'asc']],
        attributes: ['id', 'name', 'icon'],
        distinct: true,
        logging: true,
        include: [
          {
            model: speciesGroups,
            as: 'children',
            required: false,
            attributes: ['id', 'name', 'icon'],
            order: [['name', 'asc']],
            where: { status: 1 },
            include: [
              {
                model: speciesGroups,
                as: 'children',
                required: false,
                order: [['name', 'asc']],
                attributes: ['id', 'name', 'icon'],
                where: { status: 1 }
              }
            ]
          }
        ]
      }).catch(err => {
        console.log('Err', err);
        ErrorHelpers.errorReject(err, 'getListError', 'speciesGroupservice');
      });

      console.log('filter count', {
        in_ownersId: filter.ownersId ? '[' + filter.ownersId + ']' : '[]',
        in_provincesId: filter.provincesId ? '[' + filter.provincesId + ']' : '[]',
        in_districtsId: filter.districtsId ? '[' + filter.districtsId + ']' : '[]',
        in_wardsId: filter.wardsId ? '[' + filter.wardsId + ']' : '[]',
        in_villagesId: filter.villagesId ? '[' + filter.villagesId + ']' : '[]'
      });

      const count = await sequelize
        .query(
          'call sp_get_count_individuals_groupby_speciesGroups( :in_ownersId ,:in_provincesId ,:in_districtsId ,:in_wardsId ,:in_villagesId )',
          {
            replacements: {
              in_ownersId: filter.ownersId ? '[' + filter.ownersId + ']' : '[]',
              in_provincesId: filter.provincesId ? '[' + filter.provincesId + ']' : '[]',
              in_districtsId: filter.districtsId ? '[' + filter.districtsId + ']' : '[]',
              in_wardsId: filter.wardsId ? '[' + filter.wardsId + ']' : '[]',
              in_villagesId: filter.villagesId ? '[' + filter.villagesId + ']' : '[]'
            },

            type: sequelize.QueryTypes.SELECT
          }
        )
        .catch(err => {
          console.log('Err', err);
          ErrorHelpers.errorReject(err, 'getListError', 'speciesGroupservice');
        });

      delete count[0].meta;
      // console.log('result', result);

      result = JSON.parse(JSON.stringify(result));
      const countIndividualsList = {};

      for (const property in count[0]) {
        countIndividualsList[count[0][property].id] = count[0][property].countIndividuals;
      }

      console.log('count', countIndividualsList);
      result = result.map(level0 => {
        level0.countIndividuals = 0;

        if (countIndividualsList[level0.id]) {
          level0.countIndividuals = level0.countIndividuals + countIndividualsList[level0.id] * 1;
        }

        if (level0.children) {
          level0.children = level0.children.map(level1 => {
            level1.countIndividuals = 0;

            if (countIndividualsList[level1.id]) {
              level1.countIndividuals = level1.countIndividuals + countIndividualsList[level1.id] * 1;
              level0.countIndividuals = level0.countIndividuals + countIndividualsList[level1.id] * 1;
            }

            if (level1.children) {
              level1.children = level1.children.map(level2 => {
                level2.countIndividuals = 0;

                if (countIndividualsList[level2.id]) {
                  level2.countIndividuals = level2.countIndividuals + countIndividualsList[level2.id] * 1;
                  level1.countIndividuals = level1.countIndividuals + countIndividualsList[level2.id] * 1;
                  level0.countIndividuals = level0.countIndividuals + countIndividualsList[level2.id] * 1;
                }

                return level2;
              });
            }

            return level1;
          });
        }

        return level0;
      });

      return { rows: result };
    } catch (err) {
      console.log('err', err);
      ErrorHelpers.errorReject(err, 'getListError', 'speciesGroupservice');
    }
  },
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes, ['usersCreatorId']);

        MODELS.findOne(speciesGroups, {
          where: { id: id },
          attributes: att,
          include: [
            { model: users, as: 'userCreators', required: true, attributes: ['id', 'username', 'fullname'] },
            {
              model: speciesGroups,
              as: 'children',
              required: false,
              attributes: ['id', 'name', 'icon'],
              include: [{ model: speciesGroups, as: 'children', required: false, attributes: ['id', 'name', 'icon'] }]
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'speciesGroupservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'speciesGroupservice'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);
      let whereFilter = {
        name: entity.name,
        parentId: entity.parentId || 0
      };
      // api.speciesGroups.identificationCode

      whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'speciesGroups');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(speciesGroups, { attributes: ['id'], where: whereFilter }),
            entity.name ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.speciesGroups.name' }
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

      finnalyResult = await MODELS.create(speciesGroups, entity).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudError',
          error
        });
      });

      if (Number(finnalyResult.status) === 1) {
        await MODELS.update(speciesGroups, { finalLevel: 1 }, { where: { id: finnalyResult.parentId } }).catch(
          error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          }
        );
      }

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudInfo'
        });
      }
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'speciesGroupservice');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('Province update: ');

      const foundProvince = await MODELS.findOne(speciesGroups, {
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

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'speciesGroups');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(speciesGroups, { attributes: ['id'], where: whereFilter }),
              entity.name ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.speciesGroups.name' }
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

        await MODELS.update(
          speciesGroups,
          { ...entity, dateUpdated: new Date() },
          { where: { id: Number(param.id) } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(speciesGroups, { where: { id: param.id } }).catch(error => {
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

        sequelize.query(`call sp_update_speciesGroups_finalLevel(${finnalyResult.parentId})`);
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'speciesGroupservice');
    }

    return { result: finnalyResult };
  },
  setting_attributes: async param => {
    try {
      const entity = param.entity;
      const speciesGroupsId = param.id;

      console.log('setting_attributes update: ', entity);
      if (entity.attributeGroups && entity.attributeGroups.length > 0) {
        await sequelize.transaction(async t => {
          console.log('1');

          await Promise.all(
            entity.attributeGroups.map(async attributeGroupsElement => {
              let result;

              if (Number(attributeGroupsElement.flag) === 1) {
                if (Number(attributeGroupsElement.id) === 0) {
                  result = await MODELS.create(
                    attributeGroups,
                    {
                      ..._.omit(attributeGroupsElement, ['id', 'flag', 'attributes']),
                      speciesGroupsId: speciesGroupsId
                    },
                    { transaction: t }
                  ).catch(err => {
                    console.log('err1', err);
                    throw new ApiErrors.BaseError({
                      statusCode: 202,
                      message: 'Tạo nhóm thuộc tính xảy ra lỗi'
                    });
                  });

                  if (attributeGroupsElement.attributes) {
                    await Promise.all(
                      attributeGroupsElement.attributes.map(async attributesElement => {
                        const attributesResult = await MODELS.create(
                          attributes,
                          {
                            ..._.omit(attributesElement, ['id', 'flag', 'attributeSuggestions']),
                            attributeGroupsId: result.id
                          },
                          { transaction: t }
                        ).catch(err => {
                          console.log('err1', err);
                          throw new ApiErrors.BaseError({
                            statusCode: 202,
                            message: 'Tạo  thuộc tính xảy ra lỗi'
                          });
                        });

                        if (attributesElement.attributeSuggestions) {
                          await MODELS.bulkCreate(
                            attributeSuggestions,
                            attributesElement.attributeSuggestions.map(attributeSuggestionsElement => {
                              return {
                                ...attributeSuggestionsElement,
                                attributesId: attributesResult.id
                              };
                            }),
                            {
                              transaction: t
                            }
                          ).catch(err => {
                            console.log('err1', err);
                            throw new ApiErrors.BaseError({
                              statusCode: 202,
                              message: 'Tạo gợi ý thuộc tính xảy ra lỗi'
                            });
                          });
                        }
                      })
                    );
                  }
                } else {
                  result = await MODELS.findOne(attributeGroups, {
                    where: {
                      id: attributeGroupsElement.id,
                      speciesGroupsId: speciesGroupsId
                    },
                    transaction: t
                  }).catch(err => {
                    console.log('err2', err);
                    throw new ApiErrors.BaseError({
                      statusCode: 202,
                      message: 'Tìm nhóm thuộc tính xảy ra lỗi'
                    });
                  });
                  if (!result) {
                    throw new ApiErrors.BaseError({
                      statusCode: 202,
                      message: 'Không tìm thấy bản ghi'
                    });
                  }
                  await MODELS.update(
                    attributeGroups,
                    {
                      ..._.omit(attributeGroupsElement, ['id', 'flag', 'attributes'])
                    },
                    { where: { id: result.id }, transaction: t }
                  ).catch(err => {
                    console.log('err1', err);
                    throw new ApiErrors.BaseError({
                      statusCode: 202,
                      message: 'Cập nhật nhóm thuộc tính xảy ra lỗi'
                    });
                  });

                  if (attributeGroupsElement.attributes) {
                    await Promise.all(
                      attributeGroupsElement.attributes.map(async attributesElement => {
                        let attributesResult;

                        if (Number(attributesElement.flag) === 1) {
                          if (Number(attributesElement.id) === 0) {
                            attributesResult = await MODELS.create(
                              attributes,
                              {
                                ..._.omit(attributesElement, ['id', 'flag', 'attributeSuggestions']),
                                attributeGroupsId: result.id
                              },
                              { transaction: t }
                            ).catch(err => {
                              console.log('err1a', result.id, err);
                              throw new ApiErrors.BaseError({
                                statusCode: 202,
                                message: 'Tạo thuộc tính xảy ra lỗi'
                              });
                            });

                            if (attributesElement.attributeSuggestions) {
                              await MODELS.bulkCreate(
                                attributeSuggestions,
                                attributesElement.attributeSuggestions.map(attributeSuggestionsElement => {
                                  return {
                                    ...attributeSuggestionsElement,
                                    attributesId: attributesResult.id
                                  };
                                }),
                                {
                                  transaction: t
                                }
                              ).catch(err => {
                                console.log('err1b', err);
                                throw new ApiErrors.BaseError({
                                  statusCode: 202,
                                  message: 'Tạo gợi ý thuộc tính xảy ra lỗi'
                                });
                              });
                            }
                          } else {
                            attributesResult = await MODELS.findOne(attributes, {
                              transaction: t,
                              where: {
                                id: attributesElement.id,
                                attributeGroupsId: result.id
                              },
                              include: [
                                {
                                  model: attributeSuggestions,
                                  as: 'attributeSuggestions'
                                }
                              ]
                            }).catch(err => {
                              console.log('err1c', err);
                              throw new ApiErrors.BaseError({
                                statusCode: 202,
                                message: 'Tìm thuộc tính xảy ra lỗi'
                              });
                            });

                            if (!attributesResult) {
                              throw new ApiErrors.BaseError({
                                statusCode: 202,
                                message: 'Không tìm thấy thuộc tính'
                              });
                            } else {
                              console.log('attributesElement', attributesElement);
                              await MODELS.update(
                                attributes,
                                {
                                  ..._.omit(attributesElement, ['id', 'flag', 'attributeSuggestions'])
                                },
                                { where: { id: attributesElement.id }, transaction: t }
                              ).catch(err => {
                                console.log('err1d', { id: attributesElement.id });
                                console.log('err1d', err);
                                throw new ApiErrors.BaseError({
                                  statusCode: 202,
                                  message: 'Cập nhật nhóm thuộc tính xảy ra lỗi'
                                });
                              });

                              if (attributesElement.attributeSuggestions) {
                                const oldAttributeSuggestions = attributesResult.attributeSuggestions
                                  ? JSON.parse(JSON.stringify(attributesResult.attributeSuggestions))
                                  : [];

                                const newAttributeSuggestions = attributesElement.attributeSuggestions;
                                const updateAttributeSuggestions = [];
                                const deleteAttributeSuggestionsId = [];

                                console.log('oldAttributeSuggestions', oldAttributeSuggestions);
                                console.log('newAttributeSuggestions', newAttributeSuggestions);
                                oldAttributeSuggestions.forEach(oldAtt => {
                                  const findAttributeSuggestions = newAttributeSuggestions.find(
                                    newAtt =>
                                      oldAtt.attributeSuggestionsName.trim().toLocaleLowerCase() ===
                                      newAtt.attributeSuggestionsName.trim().toLocaleLowerCase()
                                  );

                                  if (findAttributeSuggestions) {
                                    findAttributeSuggestions.findStatus = true;
                                    if (
                                      Number(oldAtt.editValueStatus) !==
                                      Number(findAttributeSuggestions.editValueStatus)
                                    ) {
                                      updateAttributeSuggestions.push({
                                        id: oldAtt.id,
                                        editValueStatus: findAttributeSuggestions.editValueStatus
                                      });
                                    }
                                  } else {
                                    deleteAttributeSuggestionsId.push(oldAtt.id);
                                  }
                                });

                                const createAttributeSuggestions = newAttributeSuggestions.filter(e => !e.findStatus);

                                if (deleteAttributeSuggestionsId.length > 0) {
                                  console.log('deleteAttributeSuggestionsId', deleteAttributeSuggestionsId);
                                  await MODELS.destroy(attributeSuggestions, {
                                    where: {
                                      id: {
                                        $in: deleteAttributeSuggestionsId
                                      }
                                    },
                                    transaction: t
                                  }).catch(err => {
                                    console.log('err6', err);
                                    throw new ApiErrors.BaseError({
                                      statusCode: 202,
                                      message: 'Xóa gợi ý thuộc tính thất bại'
                                    });
                                  });
                                }

                                if (createAttributeSuggestions.length > 0) {
                                  await MODELS.bulkCreate(
                                    attributeSuggestions,
                                    createAttributeSuggestions.map(attributeSuggestionsElement => {
                                      return {
                                        ...attributeSuggestionsElement,
                                        attributesId: attributesResult.id
                                      };
                                    }),
                                    {
                                      transaction: t
                                    }
                                  ).catch(err => {
                                    console.log('err1e', err);
                                    throw new ApiErrors.BaseError({
                                      statusCode: 202,
                                      message: 'Tạo gợi ý thuộc tính xảy ra lỗi'
                                    });
                                  });
                                }

                                if (updateAttributeSuggestions.length > 0) {
                                  await Promise.all(
                                    updateAttributeSuggestions.map(async updateSuggestionsElement => {
                                      await MODELS.update(
                                        attributeSuggestions,
                                        {
                                          editValueStatus: updateSuggestionsElement.editValueStatus
                                        },
                                        {
                                          where: {
                                            id: updateSuggestionsElement.id
                                          },
                                          transaction: t
                                        }
                                      );
                                    })
                                  );
                                }
                              }
                            }
                          }
                        } else if (Number(attributesElement.flag) === -1) {
                          attributesResult = await MODELS.findOne(attributes, {
                            transaction: t,
                            where: {
                              id: attributesElement.id,
                              attributeGroupsId: result.id
                            }
                          }).catch(err => {
                            console.log('err1', err);
                            throw new ApiErrors.BaseError({
                              statusCode: 202,
                              message: 'Tìm thuộc tính xảy ra lỗi'
                            });
                          });

                          if (!attributesResult) {
                            throw new ApiErrors.BaseError({
                              statusCode: 202,
                              message: `Không tìm thấy thuộc tính, thuộc tính có thể bị xóa trước đó (attributes.id: ${attributesElement.id})`
                            });
                          }

                          await MODELS.destroy(attributes, {
                            where: {
                              id: attributesResult.id
                            },
                            transaction: t
                          }).catch(err => {
                            console.log('err4', err);
                            throw new ApiErrors.BaseError({
                              statusCode: 202,
                              message: 'Xóa thuộc tính thất bại'
                            });
                          });
                          await MODELS.destroy(attributeValues, {
                            where: {
                              attributesId: attributesResult.id
                            },
                            transaction: t
                          }).catch(err => {
                            console.log('err5', err);
                            throw new ApiErrors.BaseError({
                              statusCode: 202,
                              message: 'Xóa thuộc tính thất bại'
                            });
                          });
                          await MODELS.destroy(attributeSuggestions, {
                            where: {
                              attributesId: attributesResult.id
                            },
                            transaction: t
                          }).catch(err => {
                            console.log('err6', err);
                            throw new ApiErrors.BaseError({
                              statusCode: 202,
                              message: 'Xóa gợi ý thuộc tính thất bại'
                            });
                          });
                        }
                      })
                    );
                  }
                  // result = result.map;
                }
              } else if (Number(attributeGroupsElement.flag) === -1) {
                result = await MODELS.findOne(attributeGroups, {
                  where: {
                    id: attributeGroupsElement.id,
                    speciesGroupsId: speciesGroupsId
                  },
                  include: [
                    {
                      model: attributes,
                      as: 'attributes',
                      attributes: ['id']
                    }
                  ],
                  transaction: t
                }).catch(err => {
                  console.log('err2', err);
                  throw new ApiErrors.BaseError({
                    statusCode: 202,
                    message: 'Tìm nhóm thuộc tính xảy ra lỗi'
                  });
                });

                if (!result) {
                  throw new ApiErrors.BaseError({
                    statusCode: 202,
                    message: 'Xóa nhóm thuộc tính thất bại: không tìm thấy bản ghi'
                  });
                }

                await MODELS.destroy(attributeGroups, {
                  where: {
                    id: attributeGroupsElement.id,
                    speciesGroupsId: speciesGroupsId
                  },
                  transaction: t
                }).catch(err => {
                  console.log('err3', err);
                  throw new ApiErrors.BaseError({
                    statusCode: 202,
                    message: 'Xóa bản ghi thất bại'
                  });
                });

                if (result.attributes) {
                  console.log('result.attributes', result.attributes);
                  console.log(
                    '2',
                    result.attributes.map(e => e.id)
                  );
                  await MODELS.destroy(attributes, {
                    where: {
                      id: {
                        $in: result.attributes.map(e => e.id)
                      }
                    },
                    transaction: t
                  }).catch(err => {
                    console.log('err4', err);
                    throw new ApiErrors.BaseError({
                      statusCode: 202,
                      message: 'Xóa thuộc tính thất bại'
                    });
                  });
                  await MODELS.destroy(attributeValues, {
                    where: {
                      attributesId: {
                        $in: result.attributes.map(e => e.id)
                      }
                    },
                    transaction: t
                  }).catch(err => {
                    console.log('err5', err);
                    throw new ApiErrors.BaseError({
                      statusCode: 202,
                      message: 'Xóa thuộc tính thất bại'
                    });
                  });
                  await MODELS.destroy(attributeSuggestions, {
                    where: {
                      attributesId: {
                        $in: result.attributes.map(e => e.id)
                      }
                    },
                    transaction: t
                  }).catch(err => {
                    console.log('err6', err);
                    throw new ApiErrors.BaseError({
                      statusCode: 202,
                      message: 'Xóa gợi ý thuộc tính thất bại'
                    });
                  });
                }
              } else {
                throw new ApiErrors.BaseError({
                  statusCode: 202,
                  message: 'Flag không đúng'
                });
              }
            })
          );

          return true;
        });
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'Số nhóm thuộc tính phải lớn hơn 1 '
        });
      }
    } catch (error) {
      console.log('a', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'speciesGroupservice');
    }

    return { result: { success: true } };
  },
  get_attributes: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const speciesGroupsId = param.id;

        MODELS.findAll(attributeGroups, {
          where: { speciesGroupsId: speciesGroupsId },
          attributes: ['id', 'attributeGroupsName', 'type', 'order', [sequelize.literal(`0`), `flag`]],
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
                'order',
                [sequelize.literal(`0`), `flag`]
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'speciesGroupservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'speciesGroupservice'));
      }
    }),
  get_attributes_filter: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log("Menu Model param: %o | id: ", param, param.id)
        const speciesGroupsId = param.id;

        MODELS.findAll(attributes, {
          where: { filterStatus: 1 },
          order: [
            ['id', 'asc'],
            [sequelize.literal('`attributeSuggestions`.`editValueStatus`'), 'asc']
          ],
          logging: true,
          include: [
            {
              model: attributeSuggestions,
              as: 'attributeSuggestions',
              required: false,
              attributes: ['id', 'attributeSuggestionsName', 'editValueStatus']
            },
            {
              model: attributeGroups,
              as: 'attributeGroups',
              required: true,
              attributes: [],
              where: {
                speciesGroupsId: speciesGroupsId
              }
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'speciesGroupservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'speciesGroupservice'));
      }
    }),
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(speciesGroups, {
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
                speciesGroups,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)

                  sequelize.query(`call sp_update_speciesGroups_finalLevel(${findEntity.parentId})`);

                  MODELS.findOne(speciesGroups, { where: { id: param.id } })
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

      const foundProvince = await MODELS.findOne(speciesGroups, {
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
        await MODELS.destroy(speciesGroups, { where: { id: parseInt(param.id) } });

        const provinceAfterDelete = await MODELS.findOne(speciesGroups, { where: { Id: param.id } }).catch(err => {
          ErrorHelpers.errorThrow(err, 'crudError', 'speciesGroupservice');
        });

        if (provinceAfterDelete) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'deleteError'
          });
        }
      }
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'crudError', 'speciesGroupservice');
    }

    return { status: 1 };
  },

  bulk_create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      if (entity.speciesGroups) {
        finnalyResult = await Promise.all(
          entity.speciesGroups.map(element => {
            return MODELS.createOrUpdate(
              speciesGroups,
              {
                name: element.name,
                userCreatorsId: entity.userCreatorsId,
                status: element.status
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
