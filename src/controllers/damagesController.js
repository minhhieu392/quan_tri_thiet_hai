import * as ApiErrors from '../errors';
import loggerHelpers from '../helpers/loggerHelpers';
import damageService from '../services/damageService';
import { recordStartTime } from '../utils/loggerFormat';

export default {
  get_list: (req, res, next) => {
    recordStartTime.call(req);

    try {
      const { sort, range, filter, attributes } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes
      };

      damageService
        .get_list(param)
        .then(data => {
          const dataOutput = {
            result: {
              list: data.rows,
              pagination: {
                current: data.page,
                pageSize: data.perPage,
                total: data.count
              }
            },
            success: true,
            errors: [],
            messages: []
          };

          res.header('Content-Range', `sclSocialAccounts ${range}/${data.count}`);
          res.send(dataOutput);
          // write log
          recordStartTime.call(res);
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
          });
        })
        .catch(error => {
          error.dataQuery = req.query;
          next(error);
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  get_targets_tree: (req, res, next) => {
    recordStartTime.call(req);

    console.log('req.auth=', req.auth);
    console.log('locals', res.locals);
    try {
      const { wardsId, disastersId } = req.query;
      const param = {
        wardsId,
        disastersId
      };

      damageService
        .get_targets_tree(param)
        .then(data => {
          const dataOutput = {
            result: {
              list: data.rows
            },
            success: true,
            errors: [],
            messages: []
          };

          res.send(dataOutput);
          // write log
          recordStartTime.call(res);
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: dataOutput
          });
        })
        .catch(error => {
          error.dataQuery = req.query;
          next(error);
        });
    } catch (error) {
      error.dataQuery = req.query;
      next(error);
    }
  },
  get_one: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params;
      const { attributes } = req.query;
      const param = { id, attributes };

      damageService
        .get_one(param)
        .then(data => {
          res.send(data);

          recordStartTime.call(res);
          loggerHelpers.logVIEWED(req, res, {
            dataReqBody: req.body,
            dataReqQuery: req.query,
            dataRes: data
          });
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      error.dataParams = req.params;
      next(error);
    }
  },
  create: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log('Request-Body:', req.body);
      const entity = res.locals.body;
      const param = { entity };

      damageService
        .create(param)
        .then(data => {
          if (data && data.result) {
            const dataOutput = {
              result: data.result,
              success: true,
              errors: [],
              messages: []
            };

            res.send(dataOutput);
            recordStartTime.call(res);
            loggerHelpers.logCreate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: dataOutput
            });
          }
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      next(error);
    }
  },
  bulk_create_t1: (req, res, next) => {
    recordStartTime.call(req);
    try {
      
      const entity = res.locals.body;

      entity.usersCreatorId = req.auth.userId;
      const param = { entity };


      damageService
        .bulk_create_t1(param)
        .then(data => {
          if (data && data.result) {
            const dataOutput = {
              result: data.result,
              success: true,
              errors: [],
              messages: []
            };

            res.send(dataOutput);
            recordStartTime.call(res);
            loggerHelpers.logCreate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: dataOutput
            });
          } else {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted'
            });
          }
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      next(error);
    }
  },
  bulk_create_t2: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log('Request-Body create:', res.locals.body);
      const entity = res.locals.body;

      entity.usersCreatorId = req.auth.userId;
      const param = { entity };

      damageService
        .bulk_create_t2(param)
        .then(data => {
          if (data && data.result) {
            const dataOutput = {
              result: data.result,
              success: true,
              errors: [],
              messages: []
            };

            res.send(dataOutput);
            recordStartTime.call(res);
            loggerHelpers.logCreate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: dataOutput
            });
          } else {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted'
            });
          }
        })
        .catch(error => {
          next(error);
        });
    } catch (error) {
      next(error);
    }
  },
  
  update: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log('update Controllers');
      const { id } = req.params;
      const entity = res.locals.body;
      // const entity = req.body
      const param = { id, entity };

      damageService
        .update(param)
        .then(data => {
          if (data && data.result) {
            const dataOutput = {
              result: data.result,
              success: true,
              errors: [],
              messages: []
            };

            res.send(dataOutput);

            recordStartTime.call(res);
            loggerHelpers.logUpdate(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: dataOutput
            });
          }
        })
        .catch(error => {
          error.dataInput = req.body;
          error.dataParams = req.params;
          next(error);
        });
    } catch (error) {
      error.dataInput = req.body;
      error.dataParams = req.params;
      next(error);
    }
  },
  delete: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { id } = req.params;
      const param = { id };

      damageService
        .delete(param)
        .then(data => {
          if (data && data.status === 1) {
            const dataOutput = {
              result: null,
              success: true,
              errors: [],
              messages: ['Delete success']
            };

            res.send(dataOutput);

            recordStartTime.call(res);
            loggerHelpers.logDelete(req, res, {
              dataReqBody: req.body,
              dataReqQuery: req.query,
              dataRes: dataOutput
            });
          } else {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              type: 'deleteError'
            });
          }
        })
        .catch(error => {
          error.dataParams = req.params;
          next(error);
        });
    } catch (error) {
      error.dataParams = req.params;
      next(error);
    }
  }
};
