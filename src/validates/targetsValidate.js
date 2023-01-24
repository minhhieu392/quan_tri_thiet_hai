/* eslint-disable camelcase */
import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  targetsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.targets.targetsName']
  }),
  targetsCode: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.targets.targetsCode'],
    allow: ['', null]
  }),
  finalLevel: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.targets.finalLevel']
  }),
  valueStatus: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.targets.valueStatus']
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.userCreatorsId
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate
  }),

  parentId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.targets.parentId']
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated,
    allow: ['', null]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  }),
  unitName: ValidateJoi.createSchemaProp({
    string: noArguments
  })
};

export default {
  authenCreate: (req, res, next) => {
    console.log('validate authenCreate');
    const userCreatorsId = req.auth.userId;

    const { targetsName, finalLevel, valueStatus, targetsCode, status, statisticalProducts, parentId,unitName } = req.body;
    const province = {
      targetsName,
      finalLevel,
      valueStatus,
      targetsCode,
      status,
      userCreatorsId,
      parentId,
      unitName,
      statisticalProducts
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        targetsName: {
          required: noArguments,
          max: 200
        },
        status: {
          required: noArguments
        }
      }),
      {}
    );

    ValidateJoi.validate(province, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },

  authenUpdate: (req, res, next) => {
    const {
      unitName,
      targetsName,
      finalLevel,
      valueStatus,
      targetsCode,
      status,
      statisticalProducts,
      parentId,
      medFacilitysId
    } = req.body;
    const province = {
      unitName,
      targetsName,
      finalLevel,
      valueStatus,
      targetsCode,
      status,
      statisticalProducts,
      parentId,
      medFacilitysId
    };
    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {}), {});

    ValidateJoi.validate(province, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => {
        next({ ...error, message: 'Định dạng gửi đi không đúng' });
      });
  },
  authenFilter: (req, res, next) => {
    console.log('validate authenFilter');
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort, 'targets');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        targetsName,
        finalLevel,
        valueStatus,
        targetsCode,
        parentId,
        unitName,
        status,
        FromDate,
        ToDate
      } = JSON.parse(filter);
      const province = {
        id,
        targetsName,
        finalLevel,
        valueStatus,
        targetsCode,
        status,
        parentId,
        unitName,
        FromDate,
        ToDate
      };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.targets.id'],
          regex: regexPattern.listIds
        }),

        ...DEFAULT_SCHEMA,
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments
        })
      };

      // console.log('input: ', input);
      ValidateJoi.validate(province, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }

          res.locals.filter = data;
          console.log('locals.filter', res.locals.filter);
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
    // const userCreatorsId = req.auth.userId || 0;

    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      status: {
        required: noArguments
      }
    });

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  }
};
