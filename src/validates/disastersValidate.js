import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
  disastersName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.disasters.disastersName']
  }),
  address: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.disasters.address'],
    allow: ['', null]
  }),
  disasterGroupsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.disasterGroups.id']
  }),
  point: ValidateJoi.createSchemaProp({
    object: noArguments,
    label: viMessage['api.disasters.point'],
    allow: [null]
  }),

  disasterTimeStart: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.disasters.disasterTimeStart'],
    allow: [null]
  }),
  disasterTimeEnd: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage['api.disasters.disasterTimeEnd'],
    allow: [null]
  }),

  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId
  }),
  dateCreated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.createDate
  }),
  dateUpdated: ValidateJoi.createSchemaProp({
    date: noArguments,
    label: viMessage.dateUpdated,
    allow: ['', null]
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status
  })
};

const DISASTERGROUPS_SCHEMA = ValidateJoi.createArraySchema({
  id: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.disasterGroups.id'],
    required: noArguments
  })
});

const DISASTERSAFFECTEDAREASSCHEMA = ValidateJoi.createArraySchema({
  provincesId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.provinces.id'],
    allow: [null]
  }),
  districtsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.district.id'],
    allow: [null]
  }),
  wardsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage['api.wards.id'],
    allow: [null]
  })
});

export default {
  authenCreate: (req, res, next) => {
    // console.log("validate authenCreate")
    const userCreatorsId = req.auth.userId;

    const {
      disastersName,
      address,
      disasterTimeStart,
      disasterTimeEnd,
      disasterGroups,
      point,
      provincesId,
      districtsId,
      wardsId,
      dateCreated,
      dateUpdated,
      status,
      disastersAffectedAreas
    } = req.body;
    const district = {
      disastersName,
      address,
      disasterTimeStart,
      disasterTimeEnd,
      disasterGroups,
      point,
      provincesId,
      districtsId,
      wardsId,

      dateCreated,
      dateUpdated,
      status,
      userCreatorsId,
      disastersAffectedAreas
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        disastersName: {
          max: 200,
          required: noArguments
        },
        status: {
          required: noArguments
        }
      }),
      {
        disasterGroups: DISASTERGROUPS_SCHEMA,
        disastersAffectedAreas: DISASTERSAFFECTEDAREASSCHEMA
      }
    );

    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate: (req, res, next) => {
    // console.log("validate authenUpdate")

    const {
      disastersName,
      address,
      disasterTimeStart,
      disasterTimeEnd,
      disasterGroups,
      point,
      provincesId,
      districtsId,
      wardsId,

      dateCreated,
      dateUpdated,
      status,
      disastersAffectedAreas
    } = req.body;
    const district = {
      disastersName,
      address,
      disasterTimeStart,
      disasterTimeEnd,
      disasterGroups,
      point,
      provincesId,
      districtsId,
      wardsId,

      dateCreated,
      dateUpdated,
      status,
      disastersAffectedAreas
    };

    const SCHEMA = Object.assign(
      ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
        disastersName: {
          max: 200
        }
      }),
      {
        disasterGroups: DISASTERGROUPS_SCHEMA,
        disastersAffectedAreas: DISASTERSAFFECTEDAREASSCHEMA
      }
    );

    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenUpdate_status: (req, res, next) => {
    // console.log("validate authenCreate")
    // const userCreatorsId = req.auth.userId;

    const { status, dateUpdated } = req.body;
    const userGroup = { status, dateUpdated };

    const SCHEMA = ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      status: {
        required: noArguments
      },
      dateUpdated: {
        required: noArguments
      }
    });

    ValidateJoi.validate(userGroup, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
  authenFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort, 'disasters');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.sortBy = sort ? JSON.parse(sort) : ['id', 'desc'];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        disastersName,
        disasterGroupsId,
        status,
        FromDate,
        ToDate,
        provincesId,
        districtsId,
        wardsId,
        isActive
      } = JSON.parse(filter);
      const district = {
        id,
        disastersName,
        disasterGroupsId,
        status,
        FromDate,
        ToDate,
        provincesId,
        districtsId,
        wardsId,
        isActive
      };

      // console.log(district)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.district.id'],
          regex: regexPattern.listIds
        }),
        isActive: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: 'isActive'
        }),
        ...DEFAULT_SCHEMA,

        disasterGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.disasterGroups.id'],
          regex: regexPattern.listIds
        }),

        provincesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.provinces.id'],
          regex: regexPattern.listIds
        }),

        districtsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.district.id'],
          regex: regexPattern.listIds
        }),

        wardsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.wards.id'],
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

      // console.log('input: ', input);
      ValidateJoi.validate(district, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }

          // if (disasterGroupsId) {
          //   ValidateJoi.transStringToArray(data, 'disasterGroupsId');
          // }

          // if (provincesId) {
          //   ValidateJoi.transStringToArray(data, 'provincesId');
          // }
          // if (districtsId) {
          //   ValidateJoi.transStringToArray(data, 'districtsId');
          // }
          // if (wardsId) {
          //   ValidateJoi.transStringToArray(data, 'wardsId');
          // }

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
  authenFilterInCircle: (req, res, next) => {
    // console.log("validate authenFilter")

    const filter = req.query.filter || '{}';

    const { disasterGroupsId, active, radius, centerLatitude, centerLongitude, FromDate, ToDate } = JSON.parse(filter);

    const district = {
      disasterGroupsId,
      active,
      radius,
      centerLatitude,
      centerLongitude,
      FromDate,
      ToDate
    };
    // console.log(district)
    const SCHEMA = {
      disasterGroupsId: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: viMessage['api.disasterGroups.id']
      }),
      active: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: 'active'
      }),
      radius: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: 'bán kính',
        required: noArguments
      }),
      centerLatitude: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: 'Tọa độ ',
        required: noArguments
      }),
      centerLongitude: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: 'Tọa độ',
        required: noArguments
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

    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        res.locals.filter = data;
        // console.log('locals.filter', res.locals.filter);
        next();
      })
      .catch(error => {
        next({ ...error, message: 'Định dạng gửi đi không đúng' });
      });
  },
  authenFilterInPolygon: (req, res, next) => {
    // console.log("validate authenFilter")

    const filter = req.query.filter || '{}';

    const { disasterGroupsId, active, points, FromDate, ToDate } = JSON.parse(filter);

    const district = {
      disasterGroupsId,
      active,
      points,
      FromDate,
      ToDate
    };
    // console.log(district)
    const SCHEMA = {
      disasterGroupsId: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: viMessage['api.disasterGroups.id']
      }),
      active: ValidateJoi.createSchemaProp({
        number: noArguments,
        label: 'active'
      }),
      points: ValidateJoi.createSchemaProp({
        array: noArguments,
        label: 'Tọa độ các điểm',
        required: noArguments
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

    // console.log('input: ', input);
    ValidateJoi.validate(district, SCHEMA)
      .then(data => {
        res.locals.filter = data;
        // console.log('locals.filter', res.locals.filter);
        next();
      })
      .catch(error => {
        next({ ...error, message: 'Định dạng gửi đi không đúng' });
      });
  }
};
