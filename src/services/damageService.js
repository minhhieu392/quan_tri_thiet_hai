// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import { sequelize } from '../db/sequelize';
import treeHelper from '../helpers/treeHelper';

const { disasters, wards, districts, provinces, damages, targets } = models;

export default {
  get_list: param =>
    new Promise((resolve, reject) => {
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

        MODELS.findAndCountAll(damages, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          // distinct: true,
          logging: true,
          include: [{ model: disasters, as: 'disasters', required: true, attributes: ['id', 'disastersName'] }]
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'damageService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'damageService'));
      }
    }),
  get_targets_tree: async param => {
    let finnalyResult;
    const { disastersId, wardsId } = param;

    if (!disastersId || !wardsId) {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'crudInfo',
        message: 'disastersId và wardsId không được để trống'
      });
    }

    const parentKey = 'parentId';
    const currentKey = 'id';

    let result;

    try {
      result = await MODELS.findAll(targets, {
        where: { status: 1 },

        // attributes: att,
        order: [['parentId', 'desc']],
        attributes: [
          'id',
          'parentId',
          'targetsCode',
          'targetsName',
          'unitName',
          'finalLevel',
          'valueStatus',
          [sequelize.literal('damages.value'), 'value'],
          [sequelize.literal('damages.quantity'), 'quantity']
        ],
        include: [
          {
            model: damages,
            as: 'damages',
            required: false,
            attributes: [],
            where: {
              disastersId,
              wardsId
            }
          }
        ]
      }).catch(error => {
        throw error;
      });

      if (result) {
        result = JSON.parse(JSON.stringify(result));

        console.log('2', result, currentKey, parentKey, 0);

        const resultTree = treeHelper.createTreeCheckSumAttributes(result, currentKey, parentKey, 0, [
          'value',
          'quantity'
        ]);

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
  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes);

        MODELS.findOne(damages, {
          where: { id: id },
          attributes: att,
          include: [
            {
              model: disasters,
              as: 'disasters',
              required: true,
              attributes: ['id', 'disastersName']
            },
            {
              model: targets,
              as: 'targets',
              required: false,
              attributes: ['id', 'targetsName']
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'damageService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'damageService'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      const checkWardS = await MODELS.findOne(wards, { attributes: ['id'], where: { id: entity.wardsId } }).catch(
        error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'khong tim thay dia phuong!',
            error
          });
        }
      );
      const checkTargets = await MODELS.findOne(targets, {
        attributes: ['id'],
        where: {
          id: entity.wardsId
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'khong tim thay chi tieu!',
          error
        });
      });

      if (checkTargets && checkWardS) {
        const foundTargets = await MODELS.findOne(damages, {
          attributes: ['id'],
          where: {
            targetsId: entity.targetsId,
            disastersId: entity.disastersId,
            wardsId: entity.wardsId
          }
        }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Tim thong tin thiet hai that bai!',
            error
          });
        });

        if (foundTargets) {
          finnalyResult = await MODELS.update(
            damages,
            { value: entity.value, quantity: entity.quantity, dateUpdated: new Date() },
            { where: { id: Number(foundTargets.id) } }
          ).catch(error => {
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
        } else {
          finnalyResult = await MODELS.create(damages, entity).catch(error => {
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
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted',
            message: ''
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          message: 'Thông tin địa phương hoặc chỉ tiêu bạn truyền vào không chính xác'
        });
      }
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'damageService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      const foundDamage = await MODELS.findOne(damages, {
        attributes: ['id', 'disastersId', 'wardsId', 'targetsId'],
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Lấy thông tin của thiệt hại thất bại!',
          error
        });
      });

      if (foundDamage) {
        if (
          Number(entity.disastersId) === Number(foundDamage.disastersId) &&
          Number(entity.wardsId) === Number(foundDamage.wardsId) &&
          Number(entity.targetsId) === Number(foundDamage.targetsId)
        ) {
          console.log('ok', Number(entity.disastersId));
          await MODELS.update(damages, { ...entity }, { where: { id: Number(param.id) } }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          });
          finnalyResult = await MODELS.findOne(damages, { where: { id: param.id } }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudInfo',
              message: 'Lấy thông tin sau khi thay đổi thất bại',
              error
            });
          });
        } else {
          const checkWardS = await MODELS.findOne(wards, { attributes: ['id'], where: { id: entity.wardsId } }).catch(
            error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'getInfoError',
                message: 'khong tim thay dia phuong!',
                error
              });
            }
          );
          const checkTargets = await MODELS.findOne(targets, {
            attributes: ['id'],
            where: {
              id: entity.wardsId
            }
          }).catch(error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'getInfoError',
              message: 'khong tim thay chi tieu!',
              error
            });
          });

          if (checkTargets && checkWardS) {
            const check = await MODELS.findOne(damages, {
              where: { disastersId: entity.disastersId, wardsId: entity.wardsId, targetsId: entity.targetsId }
            }).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'getInfoError',
                message: 'khong tim thấy đối tượng !',
                error
              });
            });

            if (check) {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'getInfoError',
                message: 'Thiệt hại đã tồn tại!'
              });
            } else {
              await MODELS.update(damages, { ...entity }, { where: { id: Number(param.id) } }).catch(error => {
                throw new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudError',
                  error
                });
              });
              finnalyResult = await MODELS.findOne(damages, { where: { id: param.id } }).catch(error => {
                throw new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudInfo',
                  message: 'Lấy thông tin sau khi thay đổi thất bại',
                  error
                });
              });
              // if (!finnalyResult) {
              //   throw new ApiErrors.BaseError({
              //     statusCode: 202,
              //     type: 'crudInfo',
              //     message: 'Lấy thông tin sau khi thay đổi thất bại'
              //   });
              // }
            }
          } else {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted',
              massage: 'Không tìm thấy chỉ tiêu hoặc địa phương'
            });
          }
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted',
          massage: 'Không tìm thấy bản ghi'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'damageService');
    }
    if (!finnalyResult) {
      throw new ApiErrors.BaseError({
        statusCode: 202,
        type: 'crudInfo',
        message: 'Lấy thông tin sau khi thay đổi thất bại'
      });
    }

    return { result: finnalyResult };
  },

  bulk_create_t1: async param => {
    let finnalyResult;

    try {
      const { entity } = param;

      console.log('User create: ', entity);

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
                  throw new ApiErrors.BaseError({
                    statusCode: 202,
                    message: ` Không tìm thấy ${e.address.provinceName} - ${e.address.districtName} - ${e.address.wardName} .`
                  });
                  // messageError =
                  //   messageError +
                  //   ` Không tìm thấy ${e.address.provinceName} - ${e.address.districtName} - ${e.address.wardName} .`;
                }
              } else {
                createOne = false;
                messageError = messageError + ' Địa chỉ không hợp lý.';
              }

              if (e.targetsName) {
                const findTargets = await MODELS.findOne(targets, {
                  where: {
                    status: 1,
                    $and: sequelize.literal(`lower(targetsName) like  CONVERT(lower("${e.targetsName}"), BINARY)`)
                  }
                });

                if (findTargets) {
                  e.targetsId = findTargets.id;
                } else {
                  createOne = false;
                  throw new ApiErrors.BaseError({
                    statusCode: 202,
                    message: ` Không tìm thấy ${e.address.provinceName},Vui lòng nhập lại thông tin`
                  });
                  // messageError =
                  //   messageError +
                  //   ` Không tìm thấy ${e.address.provinceName},Vui lòng nhập lại thông tin`;
                }
              }

              if (!createOne) {
                listError.push({
                  index: index,
                  messageError: messageError
                });

                createAll = false;
              } else {
                delete e.address;
                delete e.targets;
                const check = await MODELS.findOne(damages, {
                  attributes: ['id'],
                  where: {
                    disastersId: entity.disastersId,
                    targetsId: e.targetsId,
                    wardsId: e.wardsId
                  }
                });

                if (check) {
                  await MODELS.update(
                    damages,
                    { value: e.value, quantity: e.quantity },
                    { where: { id: check.id } },
                    {
                      transaction: t
                    }
                  ).catch(err => {
                    console.log('err', err);
                  });
                } else {
                  await MODELS.create(
                    damages,
                    { ...e, disastersId: entity.disastersId },
                    {
                      transaction: t
                    }
                  ).catch(err => {
                    console.log('err', err);
                  });
                }
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
      ErrorHelpers.errorThrow(error, 'crudError', 'damageService');
    }

    return { result: { finnalyResult, success: true } };
  },
  bulk_create_t2: async param => {
    let finnalyResult;

    try {
      const { entity } = param;

      if (!entity.list || entity.list.length <= 0) {
        throw new ApiErrors.BaseError({ statusCode: 202, message: 'Danh sách trống. Tạo mới thất bại!' });
      }

      await sequelize.transaction(async t => {
        const listError = [];

        let createAll = true;

        console.log('e', entity.list);
        await Promise.all(
          entity.list.map(async (e, index) => {
            let createOne = true;

            let messageError = 'Lỗi. ';

            try {
              if (e.address && e.address.provinceId && e.address.districtId && e.address.wardsId) {
                const findWard = await MODELS.findOne(wards, {
                  where: {
                    status: 1,
                    id: e.address.wardsId
                  },
                  transaction: t,
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
                  throw new ApiErrors.BaseError({
                    statusCode: 202,
                    message: ` Không tìm thấy ${e.address.provinceId} - ${e.address.districtId} - ${e.address.wardsId} .`,
                    error: listError
                  });
                  // messageError =
                  //   messageError +
                  //   ` Không tìm thấy ${e.address.provinceId} - ${e.address.districtId} - ${e.address.wardsId} .`;
                }
              } else {
                createOne = false;
                messageError = messageError + ' Địa chỉ không hợp lý.';
              }

              if (e.targetsId) {
                const findTargets = await MODELS.findOne(targets, {
                  where: {
                    status: 1,
                    id: e.targetsId
                  }
                });

                if (findTargets) {
                  e.targetsId = findTargets.id;
                } else {
                  createOne = false;
                  throw new ApiErrors.BaseError({
                    statusCode: 202,
                    message: ` Không tìm thấy ${e.targets.targetsId}, Vui lòng nhập lại thông tin`
                  });
                  // messageError =
                  //   messageError +
                  //   ` Không tìm thấy ${e.targets.targetsId}, Vui lòng nhập lại thông tin`;
                }
              }

              console.log('createOne', createOne);
              if (!createOne) {
                listError.push({
                  index: index,
                  messageError: messageError
                });

                createAll = false;
              } else {
                delete e.address;
                const check = await MODELS.findOne(damages, {
                  attributes: ['id'],
                  where: {
                    disastersId: entity.disastersId,
                    targetsId: e.targetsId,
                    wardsId: e.wardsId
                  }
                });

                if (check) {
                  await MODELS.update(
                    damages,
                    { value: e.value, quantity: e.quantity },
                    { where: { id: check.id } },
                    {
                      transaction: t
                    }
                  ).catch(err => {
                    console.log('err', err);
                  });
                } else {
                  await MODELS.create(
                    damages,
                    { ...e, disastersId: entity.disastersId },
                    {
                      transaction: t
                    }
                  ).catch(err => {
                    console.log('err', err);
                  });
                }
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
      ErrorHelpers.errorThrow(error, 'crudError', 'damageService');
    }

    return { result: { finnalyResult, success: true } };
  },

  delete: async param => {
    let status = 0;

    try {
      const foundRequest = await MODELS.findOne(damages, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Khong tim thấy Id thiệt hại!',
          error
        });
      });

      if (foundRequest) {
        await MODELS.destroy(damages, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      }
      status = 1;
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'damageService');
    }

    return {
      status: status
    };
  }
};
