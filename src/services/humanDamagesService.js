// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
// import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import { sequelize } from '../db/sequelize';

const { disasters, disasterGroups, humanDamages, vulnerablePersons, wards, districts, provinces } = models;

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

        whereFilter = await filterHelpers.makeStringFilterRelatively(['fullname'], whereFilter, 'humanDamages');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(humanDamages, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          // distinct: true,
          logging: true,
          include: [
            {
              model: disasters,
              as: 'disasters',
              required: true,
              attributes: ['id', 'disastersName'],
              include: [
                {
                  model: disasterGroups,
                  as: 'disasterGroups',
                  attributes: ['id', 'disasterGroupsName', 'icon'],
                  required: true
                }
              ]
            },
            {
              model: vulnerablePersons,
              as: 'vulnerablePersons',
              required: false,
              attributes: ['id', 'vulnerablePersonsName']
            },
            {
              model: wards,
              as: 'wards',
              required: false,
              attributes: ['id', 'wardName', 'districtsId'],
              include: [
                {
                  model: districts,
                  as: 'districts',
                  required: false,
                  attributes: ['id', 'districtName', 'provincesId'],
                  include: [
                    {
                      model: provinces,
                      as: 'provinces',
                      required: false,
                      attributes: ['id', 'provinceName']
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'humanDamagesService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'humanDamagesService'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes);

        MODELS.findOne(humanDamages, {
          where: { id: id },
          attributes: att,
          include: [
            {
              model: disasters,
              as: 'disasters',
              required: true,
              attributes: ['id', 'disastersName'],
              include: [
                {
                  model: disasterGroups,
                  as: 'disasterGroups',
                  attributes: ['id', 'disasterGroupsName', 'icon'],
                  required: true
                }
              ]
            },
            {
              model: vulnerablePersons,
              as: 'vulnerablePersons',
              required: false,
              attributes: ['id', 'vulnerablePersonsName']
            },
            {
              model: wards,
              as: 'wards',
              required: false,
              attributes: ['id', 'wardName', 'districtsId'],
              include: [
                {
                  model: districts,
                  as: 'districts',
                  required: false,
                  attributes: ['id', 'districtName', 'provincesId'],
                  include: [
                    {
                      model: provinces,
                      as: 'provinces',
                      required: false,
                      attributes: ['id', 'provinceName']
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'humanDamagesService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'humanDamagesService'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;
      const foundvulnerablePersons = await MODELS.findOne(vulnerablePersons, {
        where: {
          status: 1,
          id: entity.vulnerablePersonsId
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của đối tượng dễ bị tổn thương thất bại!',
          error
        });
      });

      if (foundvulnerablePersons) {
        finnalyResult = await MODELS.create(humanDamages, entity).catch(error => {
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
            message: 'Tạo thiệt hại về người thất bại'
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: 'Id đối tượng dễ bị tổn thương không tồn tại'
        });
      }
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'humanDamagesService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      const foundHumanDamage = await MODELS.findOne(humanDamages, {
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

      if (foundHumanDamage) {
        const foundvulnerablePersons = await MODELS.findOne(vulnerablePersons, {
          where: {
            status: 1,
            id: entity.vulnerablePersonsId
          }
        }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Lấy thông tin của đối tượng dễ bị tổn thương thất bại!',
            error
          });
        });

        if (foundvulnerablePersons) {
          await MODELS.update(humanDamages, { ...entity, time: new Date() }, { where: { id: Number(param.id) } }).catch(
            error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudError',
                error
              });
            }
          );
          finnalyResult = await MODELS.findOne(humanDamages, { where: { id: param.id } }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại',
              error
            });
          });
        } else {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
            message: 'Id đối tưởng dễ bị tổn thương không tồn tại'
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
          type: 'crudNotExisted',
          message: 'Id bản ghi không tồn tại'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'humanDamagesService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(humanDamages, {
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
                humanDamages,
                { ...entity, time: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  MODELS.findOne(humanDamages, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'humanDamagesService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'humanDamagesService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'humanDamagesService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'humanDamagesService'));
      }
    }),
  bulk_create_t1: async param => {
    let finnalyResult;

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

              if (e.vulnerablePersonsName) {
                const findVulPersons = await MODELS.findOne(vulnerablePersons, {
                  where: {
                    status: 1,
                    $and: sequelize.literal(
                      `lower(vulnerablePersonsName) like  CONVERT(lower("${e.vulnerablePersonsName}"), BINARY)`
                    )
                  }
                });

                if (findVulPersons) {
                  e.vulnerablePersonsId = findVulPersons.id;
                } else {
                  createOne = false;
                  messageError =
                    messageError + ` Không tìm thấy Id đối tượng dễ bị tổn thương, vui lòng nhập lại thông tin`;
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
                  { ...e, userCreatorsId: entity.usersCreatorId, disastersId: entity.disastersId },
                  {
                    transaction: t
                  }
                ).catch(err => {
                  console.log('err1', err);
                });
              }
            } catch (error) {
              console.log('err', error);
              ErrorHelpers.errorThrow(error, 'crudError', 'humanDamagesService');
            }
          })
        );

        if (createAll === false) {
          throw new ApiErrors.BaseError({ statusCode: 202, message: 'Thêm mới thất bại', error: listError });
        }
      });
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'humanDamagesService');
    }

    return { result: { finnalyResult, success: true } };
  },
  bulk_create_t2: async param => {
    let finnalyResult;

    try {
      const { entity } = param;

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

              if (e.address && e.address.provinceId && e.address.districtId && e.address.wardsId) {
                const findWard = await MODELS.findOne(wards, {
                  where: {
                    status: 1,
                    id: e.address.wardsId
                  },
                  include: [
                    {
                      model: districts,
                      as: 'districts',
                      attributes: ['id', 'districtName'],
                      required: true,
                      where: {
                        status: 1,
                        id: e.address.districtId
                      },
                      include: [
                        {
                          model: provinces,
                          as: 'provinces',
                          attributes: ['id', 'provinceName'],
                          required: true,
                          where: {
                            status: 1,
                            id: e.address.provinceId
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

              if (e.vulnerablePersonsId) {
                const findVulPersons = await MODELS.findOne(vulnerablePersons, {
                  where: {
                    status: 1,
                    id: e.vulnerablePersonsId
                  }
                });

                if (findVulPersons) {
                  e.vulnerablePersonsId = findVulPersons.id;
                } else {
                  createOne = false;
                  messageError =
                    messageError +
                    ` Không tìm thấy ${e.vulnerablePersons.vulnerablePersonsId}, Vui lòng nhập lại thông tin`;
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
                  { ...e, userCreatorsId: entity.usersCreatorId, disastersId: entity.disastersId },
                  {
                    transaction: t
                  }
                ).catch(err => {
                  console.log('err1', err);
                });
              }
            } catch (error) {
              console.log('err', error);
              ErrorHelpers.errorThrow(error, 'crudError', 'customerservices');
            }
          })
        );

        if (createAll === false) {
          throw new ApiErrors.BaseError({ statusCode: 202, message: 'Thêm mới thất bại', error: listError });
        }
      });
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'humanDamagesService');
    }

    return { result: { finnalyResult, success: true } };
  },
  delete: async param => {
    let status = 0;

    try {
      const foundRequest = await MODELS.findOne(humanDamages, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Khong tim thay đáp ứng!',
          error
        });
      });

      if (foundRequest) {
        await MODELS.destroy(humanDamages, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      }
      status = 1;
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'humanDamagesService');
    }

    return {
      status: status
    };
  }
};
