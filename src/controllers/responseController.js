import * as ApiErrors from '../errors';
import loggerHelpers from '../helpers/loggerHelpers';
import responseService from '../services/responseService';
import { recordStartTime } from '../utils/loggerFormat';
import requestService from "../services/requestService";

export default {
  get_list: (req, res, next) => {
    recordStartTime.call(req);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes } = res.locals;
      const param = {
        sort,
        range,
        filter,
        auth: req.auth,
        attributes
      };

      responseService
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

          res.header('Content-Range', `areasController ${range}/${data.count}`);
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

      responseService
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
      const entity = res.locals.body;
      const param = { entity };

      responseService
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
  bulk_create: (req, res, next) => {
    recordStartTime.call(req);
    try {
      console.log('Request-Body create:', res.locals.body);
      const entity = res.locals.body;
      const param = { entity };

      responseService
        .bulk_create(param)
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

      responseService
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
          // else {
          //   throw new ApiErrors.BaseError({
          //     statusCode: 202,
          //     type: 'crudNotExisted',
          //   });
          // }
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

      responseService
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
  },
};
