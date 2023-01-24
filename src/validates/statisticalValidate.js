import viMessage from '../locales/vi';
import { parseSortVer2 } from '../utils/helper';
import regexPattern from '../utils/regexPattern';
import ValidateJoi, { noArguments } from '../utils/validateJoi';

export default {
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
        vulnerablePersonsId,
        status,
        FromDate,
        ToDate,
        provincesId,
        districtsId,
        wardsId,
        isActive,
        targetsId,
        FromYearOld,
        ToYearOld,
        gender,
        isVulnerablePersons
      } = JSON.parse(filter);
      const district = {
        id,
        disastersName,
        vulnerablePersonsId,
        disasterGroupsId,
        status,
        targetsId,
        FromDate,
        ToDate,
        provincesId,
        districtsId,
        wardsId,
        isActive,
        FromYearOld,
        ToYearOld,
        gender,
        isVulnerablePersons
      };

      // console.log(district)
      const SCHEMA = {
        disasterGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.disasterGroups.id'],
          regex: regexPattern.listIds
        }),
        vulnerablePersonsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.vulnerablePersons.id'],
          regex: regexPattern.listIds
        }),
        FromYearOld: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: 'độ tuổi từ'
        }),
        ToYearOld: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: 'độ tuổi đến'
        }),
        gender: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: 'gioi tinh'
        }),
        isVulnerablePersons: ValidateJoi.createSchemaProp({
          number: noArguments,
          label: viMessage['api.targets.id']
        }),
        targetsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.targets.id'],
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
  getRequestsFilter: (req, res, next) => {
    // console.log("validate authenFilter")
    const { filter, sort, range, attributes } = req.query;

    res.locals.sort = parseSortVer2(sort, 'disasters');
    res.locals.range = range ? JSON.parse(range) : [0, 49];
    res.locals.sortBy = sort ? JSON.parse(sort) : ['id', 'desc'];
    res.locals.attributes = attributes;
    if (filter) {
      const {
        id,
        disasterGroupsId,
        requestGroupsId,
        supportSourcesId,
        FromDate,
        ToDate,
        provincesId,
        districtsId,
        wardsId,
        isActive
      } = JSON.parse(filter);
      const getSumRequests = {
        id,
        disasterGroupsId,
        supportSourcesId,
        requestGroupsId,
        FromDate,
        ToDate,
        provincesId,
        districtsId,
        wardsId,
        isActive
      };

      const SCHEMA = {
        disasterGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.disasterGroups.id'],
          regex: regexPattern.listIds
        }),
        requestGroupsId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.disasterGroups.id'],
          regex: regexPattern.listIds
        }),
        supportSourcesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.disasterGroups.id'],
          regex: regexPattern.listIds
        }),

        provincesId: ValidateJoi.createSchemaProp({
          string: noArguments,
          label: viMessage['api.provinces.id'],
          regex: regexPattern.listIds
        }),

        districts: ValidateJoi.createSchemaProp({
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
      ValidateJoi.validate(getSumRequests, SCHEMA)
        .then(data => {
          if (id) {
            ValidateJoi.transStringToArray(data, 'id');
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
  }
};
