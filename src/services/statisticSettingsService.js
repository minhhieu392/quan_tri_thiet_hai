// import moment from 'moment'
import MODELS from '../models/models';
import models from '../entity/index';
// import _ from 'lodash';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import treeHelper from '../helpers/treeHelper';

const { sequelize, statisticSettings, targets } = models;

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

        whereFilter = await filterHelpers.makeStringFilterRelatively(['formsName'], whereFilter, 'forms');

        if (!whereFilter) {
          whereFilter = { ...filter };
        }

        console.log('where', whereFilter);

        MODELS.findAndCountAll(statisticSettings, {
          where: whereFilter,
          order: sort,
          attributes: att,
          offset: range[0],
          limit: perPage,
          // distinct: true,
          logging: true,
          include: [{ model: targets, as: 'targets', required: true, attributes: ['id', 'targetsName'] }]
        })
          .then(result => {
            resolve({
              ...result,
              page: page + 1,
              perPage
            });
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'getListError', 'formservice'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'formservice'));
      }
    }),
  get_all: async () => {
    try {
      const listTargetsId = await sequelize.query(
        `select json_arrayagg(targetsId) as targets from thiethai.statisticSettings`
      );

      console.log('listTargetsId', listTargetsId);

      return listTargetsId[0][0].targets;
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'crudError', 'formservice');
    }
  },
  create: async param => {
    try {
      const entity = param.entity;

      console.log('provinceModel create: ', entity);

      await sequelize.transaction(async t => {
        await MODELS.destroy(statisticSettings, { where: { id: { $gt: 0 } }, transaction: t, logging: true }).catch(
          error => {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudError',
              error
            });
          }
        );

        await MODELS.bulkCreate(
          statisticSettings,
          entity.targets.map(e => {
            delete e.id;

            return {
              targetsId: e
            };
          }),
          { transaction: t }
        ).catch(error => {
          console.log('e1', error);
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudError',
            error
          });
        });
      });
    } catch (error) {
      console.log('err', error);
      ErrorHelpers.errorThrow(error, 'crudError', 'formservice');
    }

    return { result: { succes: true } };
  },
  get_targets_tree: async param => {
    let finnalyResult;
    const { id } = param;

    const attributes = 'id,parentId,targetsCode,targetsName,finalLevel,valueStatus,unitName';

    const parentKey = 'parentId';
    const currentKey = 'id';

    const att = filterHelpers.atrributesHelper(attributes);

    let result;

    try {
      const arrTreeSearchId = typeof arrTreeId !== 'undefined' ? arrTreeSearchId : [];

      result = await MODELS.findAll(targets, {
        where: { status: 1, finalLevel: 0 },

        attributes: att,
        order: [['parentId', 'desc']],
        include: [
          {
            model: statisticSettings,
            as: 'statisticSettings',
            required: false
          }
        ]
      }).catch(error => {
        throw error;
      });

      if (result) {
        result = JSON.parse(JSON.stringify(result));

        console.log('2', result, currentKey, parentKey, 0);

        const resultTree = treeHelper.createTreeCheckSelect(result, currentKey, parentKey, 0, 'statisticSettings');

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
  }
};
