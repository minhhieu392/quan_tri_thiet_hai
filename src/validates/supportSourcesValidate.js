import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const LIST_SCHEMA = ValidateJoi.createArraySchema({
  fullname: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.humanDamages.name'],
    required: noArguments
  }),
  yearOfBirth: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.humanDamages.dob'],
    required: noArguments
  }),
  vulnerablePersons: ValidateJoi.createSchemaProp({
    object: noArguments,
    allow: ['', null]
  }),
  address: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage['api.humanDamages.address'],
    allow: ['', null]
  }),
  ethnic: ValidateJoi.createSchemaProp({
    string: noArguments,
    allow: ['', null]
  }),
  note: ValidateJoi.createSchemaProp({
    string: noArguments,
    allow: [null]
  }),
  reason: ValidateJoi.createSchemaProp({
    string: noArguments,
    allow: [null]
  }),
  type: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.groupUserId,
  })
});

const DEFAULT_SCHEMA = {
  supportSourcesName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.supportSources.name']
  }),

  status: ValidateJoi.createSchemaProp({
    number: noArguments,
  }),
};

export default {

  authenCreate: (req, res, next) => {

    const {
      supportSourcesName,
      status
    } = req.body;
    const supportSources = {
      supportSourcesName,
      status
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {

        supportSourcesName: {
          max: 200,
          required: noArguments
        }
      }),
      {}
    );

    ValidateJoi.validate(supportSources, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {

    const {
      supportSourcesName,
      status
    } = req.body;
    const supportSources = {
      supportSourcesName,
      status
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        supportSourcesName: {
          max: 200
        }
      }),
      {}
    );

    ValidateJoi.validate(supportSources, SCHEMA)
      .then(data => {
        console.log('data  ', data);
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenbulkCreate: (req, res, next) => {

    const { list,disastersId } = req.body;
    const dataWrap = {
      list,
      disastersId
    };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA,
      {
        disastersId: {
          required: noArguments
        }
      }), {
      list: LIST_SCHEMA
    });

    ValidateJoi.validate(dataWrap, SCHEMA)
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
        supportSourcesName,
        status,
        FromDate,
        ToDate,
      } = JSON.parse(filter);
      const supportSources = {
        id,
        supportSourcesName,
        status,
        FromDate,
        ToDate
      };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.supportSources.id'],
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

      ValidateJoi.validate(supportSources, SCHEMA)
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
    const supportSources = { status };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status
      })
    };

    ValidateJoi.validate(supportSources, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  }
};
