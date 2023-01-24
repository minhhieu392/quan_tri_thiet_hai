import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';

import regexPattern from '../utils/regexPattern';
import { parseSort } from '../utils/helper';

const LIST_SCHEMA_T1 = ValidateJoi.createArraySchema({
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
  vulnerablePersonsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    required: noArguments
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
    // label: viMessage.groupUserId,
  }),

  gender: ValidateJoi.createSchemaProp({
    number: noArguments,
    required: noArguments,
    // label: viMessage.groupUserId,
  })
});
const LIST_SCHEMA_T2 = ValidateJoi.createArraySchema({
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
  vulnerablePersonsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    required: noArguments
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
  }),
  gender: ValidateJoi.createSchemaProp({
    number: noArguments,
    required: noArguments,
    // label: viMessage.groupUserId,
  })
});

const DEFAULT_SCHEMA = {
  fullname: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.humanDamages.name']
  }),

  yearOfBirth: ValidateJoi.createSchemaProp({
    number: noArguments,
  }),
  disastersId: ValidateJoi.createSchemaProp({
    number: noArguments,
    // label: viMessage.createDate
  }),
  vulnerablePersonsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    // label: viMessage.status
  }),
  address: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage.status
  }),
  ethnic: ValidateJoi.createSchemaProp({
    string: noArguments,
    // label: viMessage.status
  }),
  note: ValidateJoi.createSchemaProp({
    string: noArguments,
    // label: viMessage.status
  }),
  reason: ValidateJoi.createSchemaProp({
    string: noArguments,
    // label: viMessage.status
  }),
  type: ValidateJoi.createSchemaProp({
    number: noArguments,
    // label: viMessage.status
  }),
  wardsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    // label: viMessage.status
  }),
  gender: ValidateJoi.createSchemaProp({
    number: noArguments,
    // label: viMessage.status
  })
};

export default {

  authenCreate: (req, res, next) => {

    const {
      fullname,
      yearOfBirth,
      disastersId,
      vulnerablePersonsId,
      address,
      ethnic,
      note,
      reason,
      type,
      wardsId,
      gender
    } = req.body;
    const humanDamages = {
      fullname,
      yearOfBirth,
      vulnerablePersonsId,
      disastersId,
      address,
      ethnic,
      note,
      reason,
      type,
      wardsId,
      gender
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {

        fullname: {
          required: noArguments
        },
        disastersId: {
          required: noArguments
        },
        vulnerablePersonsId: {
          required: noArguments
        },
        wardsId: {
          required: noArguments
        },
        gender: {
          required: noArguments
        },
      }),
      {}
    );

    ValidateJoi.validate(humanDamages, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {

    const {
      fullname,
      yearOfBirth,
      vulnerablePersonsId,
      disastersId,
      address,
      ethnic,
      note,
      reason,
      type
    } = req.body;
    const humanDamages = {
      fullname,
      yearOfBirth,
      disastersId,
      vulnerablePersonsId,
      address,
      ethnic,
      note,
      reason,
      type
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        fullname: {
          max: 100
        },
        address: {
          max: 100
        },
        note: {
          max: 200
        },
        reason: {
          max: 200
        }
      }),
      {}
    );

    ValidateJoi.validate(humanDamages, SCHEMA)
      .then(data => {
        console.log('data  ', data);
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenbulkCreate_t1: (req, res, next) => {

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
      list: LIST_SCHEMA_T1
    });

    ValidateJoi.validate(dataWrap, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenbulkCreate_t2: (req, res, next) => {

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
      list: LIST_SCHEMA_T2
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
        fullname,
        yearOfBirth,
        disastersId,
        vulnerablePersonsId,
        address,
        ethnic,
        note,
        reason,
        type,
        wardsId,
        gender,
        FromDate,
        ToDate,
      } = JSON.parse(filter);
      const request = {
        id,
        fullname,
        yearOfBirth,
        vulnerablePersonsId,
        disastersId,
        address,
        ethnic,
        note,
        reason,
        type,
        wardsId,
        gender,
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

      ValidateJoi.validate(request, SCHEMA)
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
