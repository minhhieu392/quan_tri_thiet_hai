import ValidateJoi, { noArguments } from '../utils/validateJoi';
import viMessage from '../locales/vi';
// import { sequelize } from '../db/db';
import regexPattern from '../utils/regexPattern';
import { parseSortVer2 } from '../utils/helper';
const DEFAULT_SCHEMA = {
    requestGroupsName: ValidateJoi.createSchemaProp({
    string: noArguments,
    label: viMessage['api.requestGroups.name'],
  }),
  userCreatorsId: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.usersCreatorId,
  }),
  status: ValidateJoi.createSchemaProp({
    number: noArguments,
    label: viMessage.status,
  }),
  unitName: ValidateJoi.createSchemaProp({
    string: noArguments,
    allow: ['', null],
  })
};

const PROFILE_SCHEMA =ValidateJoi.createArraySchema(
  ValidateJoi.createObjectSchema({
    hotline: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage['api.siteProfile.hotline'],
      allow: ['', null],
    }),
    socialChannelFacebookId: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage['api.siteProfile.socialChannelFacebook'],
      allow: ['', null],
    }),
    socialChannelZaloId: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage['api.siteProfile.socialChannelZalo'],
      allow: ['', null],
    }),
    email: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage.email,
      allow: ['', null],
    }),
    address: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage.address,
      allow: ['', null],
    }),
    chatbox: ValidateJoi.createSchemaProp({
      string: noArguments,
      label: viMessage.chatbox,
      allow: ['', null],
    }),
    employee: ValidateJoi.createSchemaProp({
      array: noArguments,
      label: viMessage['api.siteProfile.employee'],
      allow: ['', null],
    }),
    addressHere: ValidateJoi.createSchemaProp({
      array: noArguments,
      label: viMessage.addressHere,
      allow: ['', null],
    }),
    languagesId: ValidateJoi.createSchemaProp({
      number: noArguments,
      label: viMessage['api.languages.id']
    })
  }))
;

export default {
  authenCreate: (req, res, next) => {

    console.log("validate authenCreate");
    // const usersCreatorId = req.auth.userId;

    const { requestGroupsName,  status, unitName
    } = req.body;
    const requestGroups = {
      requestGroupsName, unitName, status
    };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      requestGroupsName: {
        max: 100,
        required: noArguments
      },
      status: {
        required: noArguments
      },
      unitName: {
        max: 100,
        required: noArguments
      }

    }), {});

    ValidateJoi.validate(requestGroups, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenUpdate: (req, res, next) => {
    console.log("validate authenUpdate")

    const { requestGroupsName,  status, unitName
    } = req.body;
    const requestGroups = {
      requestGroupsName, unitName, status
    };

    const SCHEMA = Object.assign(ValidateJoi.assignSchema(DEFAULT_SCHEMA, {
      requestGroupsName: {
        max: 100,
      },
      status: {
      },
      unitName: {
        max: 100,
      }
    }), {});

    ValidateJoi.validate(requestGroups, SCHEMA)
      .then((data) => {
        res.locals.body = data;
        next()
      })
      .catch(error => next({ ...error, message: "Định dạng gửi đi không đúng" }
      ));
  },
  authenFilter: (req, res, next) => {
    console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort,'requestGroups');
    res.locals.range = range ? JSON.parse(range) : [0, 10];
    res.locals.attributes = attributes;
    if (filter) {
      const { id, requestGroupsName, status, usersCreatorId ,FromDate,ToDate} = JSON.parse(filter);
      const groupRequest = { id, status, usersCreatorId,requestGroupsName ,FromDate,ToDate};

      console.log(groupRequest)
      const SCHEMA = {
        id: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.requestGroups.id'],
          regex: regexPattern.listIds
        }),
        ...DEFAULT_SCHEMA,
        usersCreatorId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage.usersCreatorId,
          regex: regexPattern.listIds
        }),
        FromDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.FromDate,
        }),
        ToDate: ValidateJoi.createSchemaProp({
          date: noArguments,
          label: viMessage.ToDate,
        }),
      };

      ValidateJoi.validate(groupRequest, SCHEMA)
        .then((data) => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
          }
          if (usersCreatorId) {
            ValidateJoi.transStringToArray(data, 'usersCreatorId');
          }

          res.locals.filter = data;
          console.log('locals.filter', res.locals.filter);
          next();
        })
        .catch(error => {
          next({ ...error, message: "Định dạng gửi đi không đúng" })
        });
    } else {
      res.locals.filter = {};
      next()
    }
  },
  authenUpdate_status: (req, res, next) => {

    const usersCreatorsId = req.auth.userId;

    console.log("validate authenCreate",usersCreatorsId)
    const { status } = req.body;
    const requestGroups = { status, usersCreatorsId };

    const SCHEMA = {
      status: ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.status,
      }),
      usersCreatorsId:ValidateJoi.createSchemaProp({
        number: noArguments,
        required: noArguments,
        label: viMessage.usersCreatorId,
      }),
    };

    ValidateJoi.validate(requestGroups, SCHEMA)
      .then(data => {
        res.locals.body = data;
        next();
      })
      .catch(error => next({ ...error, message: 'Định dạng gửi đi không đúng' }));
  },
}
