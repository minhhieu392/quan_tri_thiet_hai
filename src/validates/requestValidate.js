import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  disastersId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.disasters.id']
  }),

  requestGroupsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.requestGroups.id']
  }),
  wardsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.wards.id']
  }),
  amount: ValidateJoi.createSchemaProp({
    number: noArguments
    // label: viMessage.status
  }),
  supportSourcesId: ValidateJoi.createSchemaProp({
    number: noArguments
    // label: viMessage.status
  })
};

export default {
  authenCreate: (req, res, next) => {
    const { disastersId, requestGroupsId, wardsId, amount, supportSourcesId } = req.body;
    const request = {
      disastersId,
      requestGroupsId,
      wardsId,
      amount,
      supportSourcesId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        disastersId: {
          required: noArguments
        },

        requestGroupsId: {
          required: noArguments
        },
        wardsId: {
          required: noArguments
        }
      }),
      {}
    );

    ValidateJoi.validate(request, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    const { disastersId, requestGroupsId, wardsId, amount, supportSourcesId } = req.body;
    const request = {
      disastersId,
      requestGroupsId,
      wardsId,
      amount,
      supportSourcesId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        requestGroupsId: {}
      }),
      {}
    );

    ValidateJoi.validate(request, SCHEMA)
      .then(data => {
        console.log('data  ', data);
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    const { sort, range, attributes, filter } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;

    if (filter) {
      const {
        id,
        disastersId,
        requestGroupsId,
        wardsId,
        amount,
        supportSourcesId,
        FromDate,
        provincesId,
        districtsId,
        ToDate
      } = JSON.parse(filter);
      const request = {
        id,
        disastersId,
        requestGroupsId,
        provincesId,
        districtsId,
        wardsId,
        amount,
        supportSourcesId,
        FromDate,
        ToDate
      };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.requestGroups.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        wardsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.wardsId,
          regex: regexPattern.listIds
        }),
        provincesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.provincesId,
          regex: regexPattern.listIds
        }),
        districtsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.districtsId,
          regex: regexPattern.listIds
        }),
        userCreatorsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.userCreatorsId,
          regex: regexPattern.listIds
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        })
      };

      ValidateJoi.validate(request, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (wardsId) {
            ValidateJoi.transStringToArray(data, 'wardsId');
          }
          if (districtsId) {
            ValidateJoi.transStringToArray(data, 'districtsId');
          }
          if (provincesId) {
            ValidateJoi.transStringToArray(data, 'provincesId');
          }

          res.locals.filter = data;
          // console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: 'Định dạng gửi đi không đúng' });
        });
    } else {
      res.locals.filter = {};
      next();
    }
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")

    const { status } = req.body;
    const userGroup = { status };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status
      })
    };

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  }
};
