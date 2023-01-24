import MODELS from '../models/models';
import models from '../entity/index';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import _ from 'lodash';

const { supportSources, disasters, responses, requestGroups, wards, districts, provinces } = models;

export default {
  get_list: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter, range, sort, attributes } = param;

        let whereFilter = _.omit(filter, ['districtsId', 'provincesId']);
        const whereDistrictsId = _.pick(filter, ['districtsId']);

        const whereProvincesId = _.pick(filter, ['provincesId']);

        try {
          whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
        } catch (error) {
          reject(error);
        }
        const att = filterHelpers.atrributesHelper(attributes);
        const perPage = range[1] - range[0] + 1;
        const page = Math.floor(range[0] / perPage);

        console.log('where', whereFilter);
        await MODELS.findAndCountAll(responses, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          logging: true,
          include: [
            {
              model: supportSources,
              as: 'supportSources',
              required: false,
              attributes: ['supportSourcesName']
            },
            { model: disasters, as: 'disasters', required: false, attributes: ['id', 'disastersName'] },
            {
              model: wards,
              as: 'wards',
              where: whereDistrictsId,
              attributes: ['id', 'wardName'],
              required: true,
              include: [
                {
                  model: districts,
                  as: 'districts',
                  attributes: ['id', 'districtName'],
                  required: true,
                  where: whereProvincesId,
                  include: [{ model: provinces, as: 'provinces', attributes: ['id', 'provinceName'] }]
                }
              ]
            },
            {
              model: requestGroups,
              as: 'requestGroups',
              required: false,
              attributes: ['id', 'requestGroupsName', 'unitName']
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
            reject(ErrorHelpers.errorReject(err, 'getListError', 'requestService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'requestService'));
      }
    }),

  get_one: param =>
    new Promise((resolve, reject) => {
      try {
        const id = param.id;
        const att = filterHelpers.atrributesHelper(param.attributes);

        MODELS.findOne(responses, {
          where: { id: id },
          attributes: att,
          include: [
            {
              model: supportSources,
              as: 'supportSources',
              required: false,
              attributes: [ 'supportSourcesName']
            },
            { model: disasters, as: 'disasters', required: false, attributes: ['id', 'disastersName'] },
            {
              model: requestGroups,
              as: 'requestGroups',
              required: false,
              attributes: ['id', 'requestGroupsName', 'unitName']
            },
            {
              model: wards,
              as: 'wards',
              required: false,
              attributes: ['id', 'wardName'],
              include: [
                {
                  model: districts,
                  as: 'districts',
                  attributes: ['id', 'districtName'],
                  required: false,
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
            reject(ErrorHelpers.errorReject(err, 'getInfoError', 'responseService'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getInfoError', 'responseService'));
      }
    }),

  create: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      finnalyResult = await MODELS.create(responses, entity).catch(error => {
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
      ErrorHelpers.errorThrow(error, 'crudError', 'responseService');
    }

    return { result: finnalyResult };
  },
  update: async param => {
    let finnalyResult;

    try {
      const entity = param.entity;

      const foundRequest = await MODELS.findOne(responses, {
        where: {
          id: param.id
        }
      }).catch(error => {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Khong tim thay yeu cau!',
          error
        });
      });

      if (foundRequest) {
        await MODELS.update(
          responses,
          { ...entity, dateUpdated: new Date() },
          { where: { id: Number(param.id) } }
        ).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });

        finnalyResult = await MODELS.findOne(responses, { where: { id: param.id } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            message: 'Lấy thông tin sau khi thay đổi thanh cong',
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
      ErrorHelpers.errorThrow(error, 'crudError', 'responseService');
    }

    return { result: finnalyResult };
  },
  delete: async param => {
    let status = 0;

    try {
      const foundRequest = await MODELS.findOne(responses, {
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
        await MODELS.destroy(responses, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      }
      status = 1;
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'responseService');
    }

    return {
      status: status
    };
  }
};
