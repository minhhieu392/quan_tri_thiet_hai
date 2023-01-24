import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const DEFAULT_SCHEMA = {
  vulnerablePersonsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.vulnerablePersons.name']
  }),

  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    // label: viMessage['api.v.name']
  }),

  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  })
};

export default {
  authenCreate: (req, res, next) => {

    const {
      vulnerablePersonsName,
      userCreatorsId,
      status
    } = req.body;
    const vulnerablePersons = {
      vulnerablePersonsName,
      userCreatorsId,
      status
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        vulnerablePersonsName: {
          required: noArguments,
          max: 100,
        },
        status: {
          required: noArguments
        }
      }),
      {}
    );

    ValidateJoi.validate(vulnerablePersons, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {

    const {
      vulnerablePersonsName,
      userCreatorsId,
      status
    } = req.body;
    const vulnerablePersons = {
      vulnerablePersonsName,
      userCreatorsId,
      status
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        vulnerablePersonsName: {
          max: 100,
        }
      }),
      {}
    );

    ValidateJoi.validate(vulnerablePersons, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    const {
      sort, range, attributes, filter
    } = req.query;

    res.locals.sort = parseSort(sort);
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.attributes = attributes;

    if (filter) {
      const {
        id,
        vulnerablePersonsName,
        status,
        FromDate,
        ToDate,
      } = JSON.parse(filter);
      const vulnerablePersons = {
        id,
        vulnerablePersonsName,
        status,
        FromDate,
        ToDate
      };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.vulnerablePersons.id'],
          regex: regexPattern.listIds
        }),

        ...DEFAULT_SCHEMA,

        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate
        })
      };

      ValidateJoi.validate(vulnerablePersons, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }

          res.locals.filter = data;
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

    const { status } = req.body;
    const vulnerablePersons = { status };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status
      })
    };

    ValidateJoi.validate(vulnerablePersons, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  }
};
