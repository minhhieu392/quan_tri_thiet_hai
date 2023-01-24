import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const LIST_SCHEMA_t2 = ValidateJoi.createArraySchema({
  targetsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    required: noArguments
  }),
  value: ValidateJoi.createSchemaProp({
    number: noArguments,
    allow: ['', null]
  }),
  address: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage['api.humanDamages.address'],
    allow: ['', null]
  }),

  quantity: ValidateJoi.createSchemaProp({
    number: noArguments,
    allow: ['', null]
  }),
});
const LIST_SCHEMA_t1 = ValidateJoi.createArraySchema({
  targetsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    required: noArguments
  }),
  value: ValidateJoi.createSchemaProp({
    number: noArguments,
    allow: ['', null]
  }),
  address: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage['api.humanDamages.address'],
    allow: ['', null]
  }),

  quantity: ValidateJoi.createSchemaProp({
    number: noArguments,
    allow: ['', null]
  }),
});


const DEFAULT_SCHEMA = {
  targetsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    // label: viMessage['api.humanDamages.name']
  }),

  value: ValidateJoi.createSchemaProp({
    number: noArguments,
  }),
  disastersId: ValidateJoi.createSchemaProp({
    number: noArguments,
    // label: viMessage.createDate
  }),
  quantity: ValidateJoi.createSchemaProp({
    number: noArguments,
    // label: viMessage.status
  }),
  wardsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  })
};

export default {

  authenCreate: (req, res, next) => {

    const {
      disastersId,
      targetsId,
      value,
      quantity,
      wardsId
    } = req.body;
    const Damages = {
      disastersId,
      targetsId,
      value,
      quantity,
      wardsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {

        disastersId: {
          required: noArguments
        },
        targetsId: {
          required: noArguments
        },
        wardsId: {
          required: noArguments
        },
      }),
      {}
    );

    ValidateJoi.validate(Damages, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {

    const {
      disastersId,
      targetsId,
      value,
      quantity,
      wardsId
    } = req.body;
    const Damages = {
      disastersId,
      targetsId,
      value,
      quantity,
      wardsId
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      }),
      {}
    );

    ValidateJoi.validate(Damages, SCHEMA)
      .then(data => {
        console.log('data  ', data);
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenbulkCreate_t2: (req, res, next) => {

    const { list,disastersId } = req.body;
    const datadamage = {
      list,
      disastersId
    };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA,
      {
        disastersId: {  
          required: noArguments
        }
      }), {
      list: LIST_SCHEMA_t2
    });

    ValidateJoi.validate(datadamage, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenbulkCreate_t1: (req, res, next) => {

    const { list,disastersId } = req.body;
    const datadamage = {
      list,
      disastersId
    };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA,
      {
        disastersId: {
          required: noArguments
        }
      }), {
      list: LIST_SCHEMA_t1
    });

    ValidateJoi.validate(datadamage, SCHEMA)
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
        disastersId,
        targetsId,
        value,
        quantity,
        wardsId,
        FromDate,
        ToDate,
      } = JSON.parse(filter);
      const damages = {
        id,
        disastersId,
        targetsId,
        value,
        quantity,
        wardsId,
        FromDate,
        ToDate
      };

      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.humanDamages.id'],
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

      ValidateJoi.validate(damages, SCHEMA)
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
    const humanDamages = { status };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status
      })
    };

    ValidateJoi.validate(humanDamages, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  }
};
