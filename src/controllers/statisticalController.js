// import * as ApiErrors from '../errors';
import loggerHelpers from '../helpers/loggerHelpers';
import statisticalServices from '../services/statisticalServices';
import { recordStartTime } from '../utils/loggerFormat';

export default {
  get_disasters_count: (req, res, next) => {
    recordStartTime.call(req);

    console.log('req.auth=', req.auth);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        sortBy,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_disasters_count(param)
        .then(data => {
          const dataOutput = {
            result: {
              data: data
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
  get_disasters_count_by_disasterGroupsId: (req, res, next) => {
    recordStartTime.call(req);

    console.log('req.auth=', req.auth);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        sortBy,
        filter,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_disasters_count_by_disasterGroupsId(param)
        .then(data => {
          const dataOutput = {
            result: {
              list: data
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
  get_statistic_one: (req, res, next) => {
    recordStartTime.call(req);

    console.log('req.auth=', req.auth);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        sortBy,
        filter,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_statistic_one(param)
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
  get_atlas_statistic_kinh_te: (req, res, next) => {
    recordStartTime.call(req);

    console.log('req.auth=', req.auth);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        sortBy,
        filter,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_atlas_statistic_kinh_te(param)
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
  get_statistic_nguoi: (req, res, next) => {
    recordStartTime.call(req);

    console.log('req.auth=', req.auth);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        sortBy,
        filter,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_statistic_nguoi(param)
        .then(data => {
          console.log(data);
          const dataOutput = {
            result: {
              list: data.rows,
              total: data.total
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
  get_atlas_statistic_su_kien_thien_tai: (req, res, next) => {
    recordStartTime.call(req);

    console.log('req.auth=', req.auth);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        sortBy,
        filter,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_atlas_statistic_su_kien_thien_tai(param)
        .then(data => {
          const dataOutput = {
            result: {
              list: data
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
  get_atlas_statistic_nguoi: (req, res, next) => {
    recordStartTime.call(req);

    console.log('req.auth=', req.auth);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        sortBy,
        filter,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_atlas_statistic_nguoi(param)
        .then(data => {
          const dataOutput = {
            result: {
              list: data
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
  get_statistic_many: (req, res, next) => {
    recordStartTime.call(req);

    console.log('req.auth=', req.auth);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        sortBy,
        filter,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_statistic_many(param)
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
  individualsBySpeciesGroups: (req, res, next) => {
    recordStartTime.call(req);

    console.log('req.auth=', req.auth);
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

      statisticalServices
        .individualsBySpeciesGroups(param)
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

  get_damage_sum_by_province: (req, res, next) => {
    recordStartTime.call(req);

    console.log('req.auth=', req.auth);
    console.log('locals', res.locals);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        sortBy,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_damage_sum_by_province(param)
        .then(data => {
          const dataOutput = {
            result: {
              data: data.rows
            },
            count: data.count,
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

  get_count_humanDamage: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        sortBy,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_count_humanDamage(param)
        .then(data => {
          const dataOutput = {
            result: {
              data: data.rows
            },
            count: data.count,
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
  get_request_sum: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        sortBy,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_request_sum(param)
        .then(data => {
          const dataOutput = {
            result: {
              data: data.rows
            },
            count: data.count,
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
  get_response_sum: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        sortBy,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_response_sum(param)
        .then(data => {
          const dataOutput = {
            result: {
              data: data.rows
            },
            count: data.count,
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

  get_request_detail: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        sortBy,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_request_detail(param)
        .then(data => {
          const dataOutput = {
            result: {
              data: data.rows
            },
            count: data.count,
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

  get_responses_detail: (req, res, next) => {
    recordStartTime.call(req);
    try {
      const { sort, range, filter, attributes, sortBy } = res.locals;
      const param = {
        sort,
        range,
        filter,
        sortBy,
        auth: req.auth,
        attributes
      };

      statisticalServices
        .get_responses_detail(param)
        .then(data => {
          const dataOutput = {
            result: {
              data: data.rows
            },
            count: data.count,
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
  }
};
