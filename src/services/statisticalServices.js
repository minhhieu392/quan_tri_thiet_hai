/* eslint-disable no-await-in-loop */

import moment from 'moment';
import MODELS from '../models/models';
import models from '../entity/index';
// import _ from 'lodash';
// import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
// import filterHelpers from '../helpers/filterHelpers';
// import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';

const { sequelize, targets } = models;

export default {
  get_disasters_count: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;
        const result = await sequelize.query(
          'call sp_disasters_count(:in_disasterGroupsId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_disasterGroupsId: filter.disasterGroupsId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',

              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;

        resolve({
          tat_ca: result[0]['0'].countDisasters,
          dang_dien_ra: result[1]['0'].countDisasters
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),
  get_disasters_count_by_disasterGroupsId: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const result = await sequelize.query(
          'call sp_disasters_count_by_disasterGroupsId(:in_disasterGroupsId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_disasterGroupsId: filter.disasterGroupsId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',

              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;

        const rows = Object.values(result[0]);

        resolve(rows);
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),
  get_statistic_one: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const finalLevelId = [];
        const recursiveFunctions = async (targetsId = [], first = false) => {
          const where = {
            parentId: { $in: targetsId },
            status: 1
          };

          if (first && targetsId.length === 0) {
            where.parentId = 0;
          }

          let findAllTargets = await MODELS.findAll(targets, {
            where: where,
            logging: true
          });

          findAllTargets = JSON.parse(JSON.stringify(findAllTargets));

          if (findAllTargets && findAllTargets.length > 0) {
            const newTargetsId = [];

            findAllTargets.forEach(element => {
              if (Number(element.finalLevel) !== 1) {
                newTargetsId.push(element.id);
              } else {
                finalLevelId.push(element.id);
              }
            });
            if (newTargetsId.length > 0) await recursiveFunctions(newTargetsId);

            return;
          } else {
            return;
          }
        };

        if (filter.targetsId && filter.targetsId.length > 0) {
          await recursiveFunctions(filter.targetsId ? filter.targetsId.split(',') : [], true);
        }
        const result = await sequelize.query(
          'call sp_get_statistic_one(:in_targetsId,:in_disasterGroupsId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_targetsId: finalLevelId ? finalLevelId.join(',') : '',
              in_disasterGroupsId: filter.disasterGroupsId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;

        const rows = Object.values(result[0]);

        console.log('rows', rows);
        resolve({
          rows,
          count: rows.length
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),
  get_statistic_nguoi: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const result = await sequelize.query(
          'call sp_get_statistic_nguoi(:in_disasterGroupsId,:in_vulnerablePersonsId,:in_provincesId,:in_districtsId,:in_wardsId,:in_FromYearOld,:in_ToYearOld,:in_gender,:in_isVulnerablePersons ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_disasterGroupsId: filter.disasterGroupsId || '',
              in_vulnerablePersonsId: filter.vulnerablePersonsId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',
              in_FromYearOld: filter.FromYearOld || 0,
              in_ToYearOld: filter.ToYearOld || 0,
              in_gender: Number(filter.gender) === 0 ? Number(filter.gender) === 0 : filter.gender || -99,
              in_isVulnerablePersons: filter.isVulnerablePersons || 0,
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;
        delete result[1].meta;

        const rows = Object.values(result[1]);
        const total = Object.values(result[0]);

        resolve({ rows, total });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),
  get_atlas_statistic_su_kien_thien_tai: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const result = await sequelize.query(
          'call sp_get_atlas_statistic_su_kien_thien_tai(:in_disasterGroupsId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_disasterGroupsId: filter.disasterGroupsId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;

        const rows = Object.values(result[0]);

        resolve(rows);
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),
  get_atlas_statistic_nguoi: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const result = await sequelize.query(
          'call sp_get_atlas_statistic_nguoi(:in_disasterGroupsId,:in_provincesId,:in_districtsId,:in_wardsId,:in_FromYearOld,:in_ToYearOld,:in_gender,:in_isVulnerablePersons ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_disasterGroupsId: filter.disasterGroupsId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',
              in_FromYearOld: filter.FromYearOld || 0,
              in_ToYearOld: filter.ToYearOld || 0,
              in_gender: Number(filter.gender) === 0 ? Number(filter.gender) === 0 : filter.gender || -99,
              in_isVulnerablePersons: filter.isVulnerablePersons || 0,
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;

        const rows = Object.values(result[0]);

        resolve(rows);
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),
  get_atlas_statistic_kinh_te: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const finalLevelId = [];
        const recursiveFunctions = async (targetsId = [], first = false) => {
          const where = {
            parentId: { $in: targetsId },
            status: 1
          };

          if (first && targetsId.length === 0) {
            where.parentId = 0;
          }

          let findAllTargets = await MODELS.findAll(targets, {
            where: where,
            logging: true
          });

          findAllTargets = JSON.parse(JSON.stringify(findAllTargets));

          if (findAllTargets && findAllTargets.length > 0) {
            const newTargetsId = [];

            findAllTargets.forEach(element => {
              if (Number(element.finalLevel) !== 1) {
                newTargetsId.push(element.id);
              } else {
                finalLevelId.push(element.id);
              }
            });
            if (newTargetsId.length > 0) await recursiveFunctions(newTargetsId);

            return;
          } else {
            return;
          }
        };

        if (filter.targetsId && filter.targetsId.length > 0) {
          await recursiveFunctions(filter.targetsId ? filter.targetsId.split(',') : [], true);
        }
        const result = await sequelize.query(
          'call sp_get_atlas_statistic_kinh_te(:in_targetsId,:in_disasterGroupsId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_targetsId: finalLevelId ? finalLevelId.join(',') : '',
              in_disasterGroupsId: filter.in_disasterGroupsId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;

        const rows = Object.values(result[0]);

        console.log('rows', rows);
        resolve({
          rows,
          count: rows.length
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),

  get_statistic_many: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const finalLevelId = [];

        const result = await sequelize.query(
          'call sp_get_statistic_many(:in_targetsId,:in_disasterGroupsId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_targetsId: finalLevelId ? finalLevelId.join(',') : '',
              in_disasterGroupsId: filter.disasterGroupsId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;

        const findLastParent = async current => {
          if (Number(current.parentId) !== 0) {
            const findParent = await MODELS.findOne(targets, {
              where: {
                id: current.parentId
              }
            });

            if (!findParent) {
              return current;
            }
            if (Number(findParent.parentId) === 0) {
              return {
                id: findParent.id,
                targetsName: findParent.targetsName
              };
            } else {
              const result = await findLastParent(findParent);

              return result;
            }
          } else {
            return current;
          }
        };
        const list = Object.values(result[0]);
        const parentIdCheckObject = {};
        let rows = [];

        for (let i = 0; i <= list.length - 1; i++) {
          const targetsElement = list[i];

          console.log('targetsElement', targetsElement);
          if (!parentIdCheckObject[targetsElement.parentId + '-' + targetsElement.id]) {
            const findParent = await findLastParent({
              parentId: targetsElement.parentId,
              targetsName: targetsElement.targetsName
            });

            console.log('findParent', findParent);
            if (!findParent) {
              reject(ErrorHelpers.errorReject('không tìm thấy thông tin', 'getListError', 'statisticalServices'));
            } else {
              parentIdCheckObject[targetsElement.parentId + '-' + targetsElement.id] = {
                id: targetsElement.id,
                parentId: findParent.id,
                disasterGroupsName: targetsElement.disasterGroupsName,
                value: targetsElement.value,
                quantity: targetsElement.quantity,
                targetsName: findParent.targetsName
              };

              parentIdCheckObject[findParent.id + '-' + targetsElement.id] = {
                id: targetsElement.id,
                disasterGroupsName: targetsElement.disasterGroupsName,
                value: targetsElement.value,
                quantity: targetsElement.quantity,
                targetsName: findParent.targetsName,
                targetsId: findParent.id
              };
              rows.push(parentIdCheckObject[findParent.id + '-' + targetsElement.id]);
            }
          } else {
            parentIdCheckObject[
              parentIdCheckObject[targetsElement.parentId + '-' + targetsElement.id].parentId + '-' + targetsElement.id
            ].value =
              parentIdCheckObject[
                parentIdCheckObject[targetsElement.parentId + '-' + targetsElement.id].parentId +
                  '-' +
                  targetsElement.id
              ].value + targetsElement.value;
            parentIdCheckObject[
              parentIdCheckObject[targetsElement.parentId + '-' + targetsElement.id].parentId + '-' + targetsElement.id
            ].quantity =
              parentIdCheckObject[
                parentIdCheckObject[targetsElement.parentId + '-' + targetsElement.id].parentId +
                  '-' +
                  targetsElement.id
              ].quantity + targetsElement.quantity;
          }
        }
        console.log('parentIdCheckObject', parentIdCheckObject);

        rows = rows.reduce((newList, current) => {
          const findTargetsId = newList.find(e => e.targetsId === current.targetsId);

          if (!findTargetsId) {
            newList.push({
              targetsId: current.targetsId,
              targetsName: current.targetsName,
              value: current.value,
              quantity: current.quantity,
              detail: [
                {
                  id: current.id,
                  disasterGroupsName: current.disasterGroupsName,
                  value: current.value,
                  quantity: current.quantity
                }
              ]
            });
          } else {
            findTargetsId.value = findTargetsId.value + current.value;
            findTargetsId.quantity = findTargetsId.quantity + current.quantity;
            findTargetsId.detail.push({
              id: current.id,
              disasterGroupsName: current.disasterGroupsName,
              value: current.value,
              quantity: current.quantity
            });
          }

          return newList;
        }, []);
        resolve({
          rows
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),
  get_damage_sum_by_province: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const result = await sequelize.query(
          'call sp_damages_sum(:in_disasterGroupsId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_disasterGroupsId: filter.in_disasterGroupsId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;

        const rows = Object.values(result[0]);

        resolve({
          rows,
          count: rows.length
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),

  get_count_humanDamage: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const result = await sequelize.query(
          'call sp_humanDamages_count(:in_disasterGroupsId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_disasterGroupsId: filter.in_disasterGroupsId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;
        const rows = Object.values(result[0]);

        resolve({
          rows,
          count: rows.length
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),

  get_request_sum: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const result = await sequelize.query(
          'call thiethai.sp_request_sum(:in_disasterGroupsId,:in_requestGroupsId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_disasterGroupsId: filter.disasterGroupsId || '',
              in_requestGroupsId: filter.requestGroupsId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;
        const rows = Object.values(result[0]);

        resolve({
          rows,
          count: rows.length
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),
  get_response_sum: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const result = await sequelize.query(
          'call thiethai.sp_responses_sum(:in_disasterGroupsId,:in_requestGroupsId,:in_supportSourcesId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_disasterGroupsId: filter.disasterGroupsId || '',
              in_requestGroupsId: filter.requestGroupsId || '',
              in_supportSourcesId: filter.supportSourcesId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;
        const rows = Object.values(result[0]);

        resolve({
          rows,
          count: rows.length
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),
  get_request_detail: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const result = await sequelize.query(
          'call thiethai.sp_request_province_details(:in_disasterGroupsId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_disasterGroupsId: filter.disasterGroupsId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;
        const rows = Object.values(result[0]);

        resolve({
          rows,
          count: rows.length
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    }),

  get_responses_detail: param =>
    new Promise(async (resolve, reject) => {
      try {
        const { filter } = param;

        const result = await sequelize.query(
          'call thiethai.sp_responses_province_details(:in_disasterGroupsId,:in_supportSourcesId,:in_provincesId,:in_districtsId,:in_wardsId ,:in_FromDate,:in_ToDate);',
          {
            replacements: {
              in_disasterGroupsId: filter.disasterGroupsId || '',
              in_supportSourcesId: filter.supportSourcesId || '',
              in_provincesId: filter.provincesId || '',
              in_districtsId: filter.districtsId || '',
              in_wardsId: filter.wardsId || '',
              in_FromDate: filter.FromDate ? moment(filter.FromDate).format('YYYY-MM-DD') : '',
              in_ToDate: filter.ToDate ? moment(filter.ToDate).format('YYYY-MM-DD') : ''
            },
            type: sequelize.QueryTypes.SELECT
          }
        );

        delete result[0].meta;
        const rows = Object.values(result[0]);

        resolve({
          rows,
          count: rows.length
        });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'getListError', 'statisticalServices'));
      }
    })
};
