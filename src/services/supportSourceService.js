// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import { sequelize } from '../db/sequelize';
import Model from "../models/models";


const {
  users,
  supportSources,
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

        whereFilter = await filterHelpers.makeStringFilterRelatively(
          ['supportSourcesName'],
          whereFilter,
          'supportSources'
        );

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(supportSources, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          logging: true,
          include: [{ model: users, as: 'userCreators', required: true, attributes: ['id', 'username'] }]
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'supportSourceService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'supportSourceService'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {

        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes);

        MODELS.findOne(supportSources, {
          where: { id: id },
          attributes: att,
          include: [
            {
              model: users, as: 'userCreators', required: true, attributes: ['id', 'username']
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'supportSourceService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'supportSourceService'));
      }
    }),

  create: async param => {

    let finnalyResult;

    try {
      const entity = param.entity;
      const whereFilter = {
        supportSourcesName: entity.supportSourcesName
      };
      // whereFilter = await filterHelpers.makeStringFilterAbsolutely(['requestGroupsName'], whereFilter, 'requestGroups');
      const dupGroupSite = await preCheckHelpers.createPromiseCheckNew(
        Model.findOne(supportSources, {
          attributes: ['id'],
          where: whereFilter
        }),

        entity.supportSourcesName ? true : false,
        TYPE_CHECK.CHECK_DUPLICATE,
        { parent: 'api.supportSources.name' }
      );

      if (!preCheckHelpers.check([dupGroupSite])) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Không xác thực được thông tin gửi lên'
        });
      }
      finnalyResult = await MODELS.create(supportSources, entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'supportSourceService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      const foundsupportSources = await MODELS.findOne(supportSources, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của thiệt hại người thất bại!',
          error
        });
      });

      if (foundsupportSources) {

        const whereFilter = {
          supportSourcesName: entity.supportSourcesName
        };
      
        const dupGroupSite = await preCheckHelpers.createPromiseCheckNew(
          Model.findOne(supportSources, {
            attributes: ['id'],
            where: whereFilter
          }),

          entity.supportSourcesName ? true : false,
          TYPE_CHECK.CHECK_DUPLICATE,
          { parent: 'api.supportSources.name' }
        );

        if (!preCheckHelpers.check([dupGroupSite])) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Không xác thực được thông tin gửi lên'
          });
        }

        await MODELS.update(
          supportSources,
          { ...entity, dateUpdated: new Date() },
          { where: { id: Number(param.id) } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(supportSources, { where: { id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'supportSourceService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(supportSources, {
          where: {
            id: id 
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
                supportSources,
                { ...entity, time: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  MODELS.findOne(supportSources, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'supportSourceService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'supportSourceService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'supportSourceService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'supportSourceService'));
      }
    }),
  bulk_create: async param => {

    let finnalyResult ;

    try {
      const { entity } = param;

      console.log('User create: ', entity);
      const disastersId = entity.disastersId;

      if (!entity.list || entity.list.length <= 0) {
        throw new ApiErrors.BaseError({ statusCode: 202, message: 'Danh sách trống. Tạo mới thất bại!' });
      }

      await sequelize.transaction(async t => {
        const listError = [];
        let createAll = true;

        await Promise.all(
          entity.list.map(async (e, index) => {
            let createOne = true;

            let messageError = 'Lỗi. ';

            try {
              console.log('e', e);

              if (e.address && e.address.provinceName && e.address.districtName && e.address.wardName) {
                const findWard = await MODELS.findOne(wards, {
                  where: {
                    status: 1,
                    $and: sequelize.literal(`lower(wardName) like  CONVERT(lower("${e.address.wardName}"), BINARY)`)
                  },
                  include: [
                    {
                      model: districts,
                      as: 'districts',
                      attributes: ['id', 'districtName'],
                      required: true,
                      where: {
                        status: 1,
                        $and: sequelize.literal(
                          `lower(districtName) like  CONVERT(lower("${e.address.districtName}"), BINARY)`
                        )
                      },
                      include: [
                        {
                          model: provinces,
                          as: 'provinces',
                          attributes: ['id', 'provinceName'],
                          required: true,
                          where: {
                            status: 1,
                            $and: sequelize.literal(
                              `lower(provinceName) like  CONVERT(lower("${e.address.provinceName}"), BINARY)`
                            )
                          }
                        }
                      ]
                    }
                  ]
                });

                if (findWard) {
                  e.wardsId = Number(findWard.id);
                } else {
                  createOne = false;
                  messageError =
                    messageError +
                    ` Không tìm thấy ${e.address.provinceName} - ${e.address.districtName} - ${e.address.wardName} .`;
                }

                if (e.address.address) {
                  e.address = e.address.address;
                } else {
                  delete e.address;
                }
              } else {
                createOne = false;
                messageError = messageError + ' Địa chỉ không hợp lý.';
              }

              if (e.vulnerablePersons && e.vulnerablePersons.vulnerablePersonsName) {
                const findVulPersons = await MODELS.findOne(vulnerablePersons, {
                  where: {
                    status: 1||0,
                    $and: sequelize.literal(
                      `lower(vulnerablePersonsName) like  CONVERT(lower("${e.vulnerablePersons.vulnerablePersonsName}"), BINARY)`
                    )
                  }
                })
                if(findVulPersons) {
                  e.vulnerablePersonsId = findVulPersons.id
                }else {
                  e.vulnerablePersonsId = 0
                  messageError =
                    messageError +
                    ` Không tìm thấy`;
                }
              }

              if (!createOne) {
                listError.push({
                  index: index,
                  messageError: messageError
                });

                createAll = false;
              } else {
                await MODELS.create(
                  humanDamages,
                  { ...e,
                    userCreatorsId: entity.usersCreatorId,
                    disastersId: entity.disastersId },
                  {
                    transaction: t
                  }
                ).catch(err => {
                  console.log('err1', err);
                });
              }
            } catch (error) {
              console.log('err', error);
              ErrorHelpers.errorThrow(error, 'crudError', 'supportSourceService');
            }
          })
        );

        if (createAll === false) {
          throw new ApiErrors.BaseError({ statusCode: 202, message: 'Thêm mới thất bại', error: listError });
        }
      });


    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'supportSourceService');
    }

    return { result: { finnalyResult,success: true } };
  }

};
