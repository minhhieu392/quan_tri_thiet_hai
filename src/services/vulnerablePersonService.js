// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const {
  users,
  disasterGroups,
  disasters,
  humanDamages,
  vulnerablePersons,
  wards,
  villages,
  districts,
  provinces
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
          ['vulnerablePersonsName'],
          whereFilter,
          'vulnerablePersons'
        );

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(vulnerablePersons, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          // distinct: true,
          logging: true,
          include: [{ model: users, as: 'userCreators', required: true, attributes: ['id','username','fullname'] }]
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'vulnerablePersonService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'vulnerablePersonService'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes);

        MODELS.findOne(vulnerablePersons, {
          where: { id: id },
          attributes: att,
          logging: true,
          include: [
            {
              model: users, as: 'userCreators', required: true, attributes: ['id','username','fullname']
            },
            {
              model: humanDamages, as: 'humanDamages', required: false, attributes: ['id','fullname','yearOfBirth']
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'vulnerablePersonService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'vulnerablePersonService'));
      }
    }),

  create: async param => {

    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('vulnerablePersons create: ', entity);

      finnalyResult = await MODELS.create(vulnerablePersons, entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'vulnerablePersonService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      console.log('vulnerablePersons update: ');

      const foundVulnerablePersons = await MODELS.findOne(vulnerablePersons, {
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

      if (foundVulnerablePersons) {
        let whereFilter = {
          id: { $ne: param.id },
          vulnerablePersonsName: entity.vulnerablePersonsName
        };

        whereFilter = await filterHelpers.makeStringFilterAbsolutely(
          ['vulnerablePersonsName'],
          whereFilter,
          'vulnerablePersons'
        );

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(vulnerablePersons, { attributes: ['id'], where: whereFilter }),
              entity.vulnerablePersonsName ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.vulnerablePersons.name' }
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
          vulnerablePersons,
          { ...entity, dateUpdated: new Date() },
          { where: { id: Number(param.id) } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(vulnerablePersons, { where: { id: param.id } }).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'vulnerablePersonService');
    }

    return { result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        const id = param.id;
        const entity = param.entity;
        console.log('l', id, entity)

        MODELS.findOne(vulnerablePersons, 
          {
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
                vulnerablePersons,
                { ...entity, dateUpdated: new Date() },
                {
                  where: { id: id }
                }
              )
                .then(() => {
                  MODELS.findOne(vulnerablePersons, { where: { id: param.id } })
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
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'vulnerablePersonService'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'vulnerablePersonService'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'vulnerablePersonService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'vulnerablePersonService'));
      }
    })
};
