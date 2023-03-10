/* eslint-disable camelcase */
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import MODELS from '../models/models';
import sendEmailService from './sendEmailService';
import CONFIG from '../config';
// import groupUsersModel from '../models/groupUsers';
import models from '../entity/index';
import { md5 } from '../utils/crypto';
// import errorCode from '../utils/errorCode';
import Promise from '../utils/promise';
import * as ApiErrors from '../errors';
import ErrorHelpers from '../helpers/errorHelpers';
import filterHelpers from '../helpers/filterHelpers';
import tokenSerivce from './tokenSerivce';
import preCheckHelpers, { TYPE_CHECK } from '../helpers/preCheckHelpers';
import moment from 'moment';
import viMessage from '../locales/vi';
import otpService from './otp/otpService';

const {
  users,
  userGroups,
  sequelize,

  userTokens
} = models;

export default {
  get_list: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort, attributes } = param;
      // console.log(filter);
      let whereFilter = _.omit(filter, ['placesId', 'villagesId', 'provincesId', 'districtsId', 'wardsId']);
      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);

      console.log('attributes', attributes);

      const villagesId = Number(filter.villagesId) || 0;
      const provincesId = Number(filter.provincesId) || 0;
      const districtsId = Number(filter.districtsId) || 0;
      const wardsId = Number(filter.wardsId) || 0;

      let att = filterHelpers.atrributesHelper(attributes);

      att = att && att.length > 0 ? att : ['id', 'dateCreated'];
      att = att.filter(e => e !== 'password');

      console.log('sort', sort);
      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      whereFilter = await filterHelpers.makeStringFilterRelatively(
        ['username', 'fullname', 'email', 'mobile', 'address'],
        whereFilter,
        'users'
      );

      console.log('whereFilter', whereFilter, attributes);
      const result = await Promise.all([
        MODELS.findAndCountAll(users, {
          // subQuery: false,
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          attributes: att,
          distinct: true,
          logging: true,
          include: [{ model: userGroups, as: 'userGroups', required: true, attributes: ['id', 'userGroupName'] }]
        })
      ]).catch(error => {
        ErrorHelpers.errorThrow(error, 'getListError', 'UserServices');
      });

      // console.log(result);

      finnalyResult = {
        rows: result[0].rows,
        count: result[0].count,
        page: page + 1,
        perPage
      };
    } catch (error) {
      // reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'))
      ErrorHelpers.errorThrow(error, 'getListError', 'UserServices');
    }

    return finnalyResult;
  },
  get_list_withSellerAndBuyer: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort, attributes, auth } = param;
      // console.log(filter);
      let whereFilter = _.omit(filter, 'placesId');
      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage);
      const att = filterHelpers.atrributesHelper(attributes, ['password']);

      try {
        whereFilter = filterHelpers.combineFromDateWithToDate(whereFilter);
      } catch (error) {
        throw error;
      }

      whereFilter = await filterHelpers.makeStringFilterRelatively(
        ['username', 'fullname', 'email', 'mobile', 'address'],
        whereFilter,
        'users'
      );

      console.log('auth===', JSON.stringify(auth));

      if (
        auth &&
        (Number(auth.userGroupsId) === 3 || Number(auth.userGroupsId) === 10 || Number(auth.userGroupsId) === 11)
      ) {
        console.log('v??o check ', JSON.stringify(auth));
        whereFilter = {
          ...whereFilter,
          ...{
            $and: sequelize.literal(`fn_checkAddressUsersChildLocations(${auth.userId},users.id,1)>0`)
          }
        };
      }

      const result = await Promise.all([
        MODELS.findAndCountAll(users, {
          // subQuery: false,
          where: whereFilter,
          order: sort,
          offset: range[0],
          limit: perPage,
          attributes: att,
          distinct: true,
          logging: console.log,
          include: [{ model: userGroups, as: 'userGroups', required: true, attributes: ['id', 'userGroupName'] }]
        })
      ]).catch(error => {
        ErrorHelpers.errorThrow(error, 'getListError', 'UserServices');
      });

      // console.log(result);

      finnalyResult = {
        rows: result[0].rows,
        count: result[0].count,
        page: page + 1,
        perPage
      };
    } catch (error) {
      // reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'))
      ErrorHelpers.errorThrow(error, 'getListError', 'UserServices');
    }

    return finnalyResult;
  },
  get_one: async param => {
    let finnalyResult;

    try {
      // console.log("BloArticle Model param: %o | id: ", param, param.id)
      const { id, attributes } = param;
      const whereFilter = { id };
      const att = filterHelpers.atrributesHelper(attributes, ['password']);
      const result = await MODELS.findOne(users, {
        where: whereFilter,
        attributes: att,
        logging: true,
        include: [{ model: userGroups, as: 'userGroups', attributes: ['id', 'userGroupName'] }]
      }).catch(error => {
        ErrorHelpers.errorThrow(error, 'getInfoError', 'UserServices');
      });

      finnalyResult = result;
      if (!finnalyResult) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      // console.log("error: ", error)
      ErrorHelpers.errorThrow(error, 'getInfoError', 'UserServices');
    }

    return finnalyResult;
  },
  find_one: param =>
    new Promise((resolve, reject) => {
      try {
        MODELS.findOne(users, {
          where: {
            username: param.userName
          },
          include: [
            {
              model: userGroups,
              as: 'userGroups',
              attributes: ['id', 'userGroupName']
            }
          ],
          logging: true
        })
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'));
          });
      } catch (error) {
        reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'));
      }
    }),
  find: param =>
    new Promise((resolve, reject) => {
      try {
        MODELS.findOne(users, {
          where: param,
          attributes: {
            // include: [],
            exclude: ['password']
          },
          include: [
            {
              model: userGroups,
              as: 'userGroups',
              attributes: ['id', 'userGroupName']
            }
          ]
        })
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'));
          });
      } catch (error) {
        reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'));
      }
    }),
  create: async param => {
    let finnalyResult;

    try {
      let { entity } = param;

      // console.log('User create: ', entity);

      const whereFilter = {
        username: entity.username
      };
      const whereFilterEmail = {
        email: entity.email || ''
      };

      const whereFilterMobile = {
        mobile: entity.mobile || ''
      };
      // whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'users');

      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(users, { attributes: ['id'], where: whereFilter }),
            entity.username ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.users.username' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(users, { attributes: ['id'], where: whereFilterEmail }),
            entity.email ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.users.email' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(users, { attributes: ['id'], where: whereFilterMobile }),
            entity.mobile ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.users.mobile' }
          )
        ])
      );

      if (!preCheckHelpers.check(infoArr)) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Kh??ng x??c th???c ???????c th??ng tin g???i l??n'
        });
      }

      const passMd5 = md5(entity.password);

      entity = Object.assign(param.entity, { password: passMd5 });

      // console.log('entity ', entity);
      finnalyResult = await MODELS.create(users, entity).catch(err => {
        // console.log('create user err: ', err);
        throw err;
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({ statusCode: 202, message: 'T???o m???i th???t b???i' });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'UserServices');
    }

    return { result: finnalyResult, status: 1 };
  },
  register: async param => {
    let finnalyResult;

    try {
      let { entity } = param;

      console.log('User register entity: ', entity);

      const whereFilter = {
        username: entity.username
      };
      const whereFilterEmail = {
        email: entity.email || ''
      };

      const whereFilterMobile = {
        mobile: entity.mobile || ''
      };
      // whereFilter = await filterHelpers.makeStringFilterAbsolutely(['name'], whereFilter, 'users');
      //  console.log('User register whereFilterEmail: ', whereFilterEmail);
      const infoArr = Array.from(
        await Promise.all([
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(users, { attributes: ['id'], where: whereFilter }),
            entity.username ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.users.username' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(users, { attributes: ['id'], where: whereFilterEmail }),
            entity.email ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.users.email' }
          ),
          preCheckHelpers.createPromiseCheckNew(
            MODELS.findOne(users, { attributes: ['id'], where: whereFilterMobile }),
            entity.mobile ? true : false,
            TYPE_CHECK.CHECK_DUPLICATE,
            { parent: 'api.users.mobile' }
          )
        ])
      );

      if (!preCheckHelpers.check(infoArr)) {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'getInfoError',
          message: 'Kh??ng x??c th???c ???????c th??ng tin g???i l??n'
        });
      }

      const passMd5 = md5(entity.password);

      if (entity.idSocial) {
        entity = Object.assign(_.omit(param.entity, ['status']), { password: passMd5, status: 1 });
      } else {
        entity = Object.assign(_.omit(param.entity, ['status']), { password: passMd5, status: 0 });
      }

      console.log('entity ', entity);
      finnalyResult = await MODELS.create(users, entity).catch(err => {
        console.log('create user err: ', err);
        throw err;
      });

      if (!finnalyResult) {
        throw new ApiErrors.BaseError({ statusCode: 202, message: 'T???o m???i th???t b???i' });
      } else {
        if (finnalyResult.email && !finnalyResult.idSocial) {
          const usercode = Math.floor(1000 + Math.random() * 9000);

          const userToken = await MODELS.create(userTokens, {
            userTokenCode: usercode,
            usersId: finnalyResult.id,
            type: 1,
            dateExpired: moment(new Date()).add(5, 'minutes'),
            status: 1
          }).catch(err => {
            // console.log('create user err: ', err);
            throw err;
          });

          if (!userToken) {
            throw new ApiErrors.BaseError({ statusCode: 202, message: 'T???o m???i th???t b???i' });
          } else {
            tokenSerivce.createToken({ usercode: usercode }).then(data => {
              sendEmailService.sendGmail({
                emailTo: finnalyResult.email,
                subject: 'K??CH HO???T T??I KHO???N CHOSO.VN',
                sendTypeMail: 'html',
                body:
                  'Xin chao ' +
                  finnalyResult.fullname +
                  ' <br/> B???n ???? ????ng k?? t??i kho???n tr??n CHOSO.VN. <br/> M?? x??c th???c c???a b???n l?? ' +
                  usercode +
                  ' ho???c k??ch ho???t t??i kho???n vui l??ng click v??o link d?????i <a href="' +
                  CONFIG['WEB_LINK_CLIENT'] +
                  'active-user?token=' +
                  data.token +
                  '">????y</a>.'
              });
            });
          }
        } else if (finnalyResult.mobile && !finnalyResult.idSocial) {
          const usercode = Math.floor(1000 + Math.random() * 9000);

          const userToken = await MODELS.create(userTokens, {
            userTokenCode: usercode,
            usersId: finnalyResult.id,
            type: 2,
            resultId: -1,
            dateExpired: moment(new Date()).add(5, 'minutes'),
            status: 0
          }).catch(err => {
            // console.log('create user err: ', err);
            throw err;
          });

          if (!userToken) {
            throw new ApiErrors.BaseError({ statusCode: 202, message: 'T???o m???i th???t b???i' });
          } else {
            tokenSerivce.createToken({ usercode: usercode }).then(async data => {
              const resutlSendOtp = await otpService.sendOtp({
                msisdn: finnalyResult.mobile,
                message:
                  'Choso.vn: Chuc mung ban da dang ky tai khoan thanh cong tren Choso. Ma OTP kich hoat tai khoan cua ban la ' +
                  usercode
              });

              console.log('resutlSendOtp=', resutlSendOtp);
              if (resutlSendOtp && resutlSendOtp.status === 1) {
                await MODELS.update(
                  userTokens,
                  {
                    resultId: resutlSendOtp.result,
                    status: 1
                  },
                  {
                    where: {
                      id: userToken.id
                    }
                  }
                );
              }
            });
          }
        }
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'UserServices');
    }

    return { result: finnalyResult, status: 1 };
  },
  createNewOtp: async param => {
    let finnalyResult;

    try {
      let { usersId } = param;

      console.log('User register entity: ', usersId);
      const userInfo = await MODELS.findOne(users, {
        where: {
          id: usersId
        }
      }).catch(err => {
        // console.log('create user err: ', err);
        throw err;
      });

      if (!userInfo) {
        throw new ApiErrors.BaseError({ statusCode: 202, message: 'Kh??ng t???n t???i th??ng tin ng?????i d??ng ' });
      }
      const usercode = Math.floor(1000 + Math.random() * 9000);

      const userToken = await MODELS.create(userTokens, {
        userTokenCode: usercode,
        usersId: userInfo.id,
        type: userInfo.email ? 1 : 2,
        resultId: userInfo.email ? 0 : -1,
        status: userInfo.email ? 1 : 0,
        dateExpired: moment(new Date()).add(5, 'minutes')
      }).catch(err => {
        // console.log('create user err: ', err);
        throw err;
      });

      if (!userToken) {
        throw new ApiErrors.BaseError({ statusCode: 202, message: 'T???o m???i th???t b???i' });
      } else if (userInfo.email) {
        tokenSerivce.createToken({ usercode: usercode }).then(data => {
          sendEmailService.sendGmail({
            emailTo: userInfo.email,
            subject: 'K??CH HO???T T??I KHO???N CHOSO.VN',
            sendTypeMail: 'html',
            body:
              'Xin chao ' +
              userInfo.fullname +
              ' <br/> B???n ???? ????ng k?? t??i kho???n tr??n CHOSO.VN. <br/> M?? x??c th???c c???a b???n l?? ' +
              usercode +
              ' ho???c k??ch ho???t t??i kho???n vui l??ng click v??o link d?????i <a href="' +
              CONFIG['WEB_LINK_CLIENT'] +
              'active-user?token=' +
              data.token +
              '">????y</a>.'
          });
        });
      } else if (userInfo.mobile) {
        tokenSerivce.createToken({ usercode: usercode }).then(async data => {
          const resutlSendOtp = await otpService.sendOtp({
            msisdn: userInfo.mobile,
            message: 'Choso.vn: Ma OTP tren Choso cua ban la ' + usercode
          });

          if (resutlSendOtp && resutlSendOtp.status === 1) {
            await MODELS.update(
              userTokens,
              {
                resultId: resutlSendOtp.result,
                status: 1
              },
              {
                where: {
                  id: userToken.id
                }
              }
            );
          }
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'UserServices');
    }

    return { result: finnalyResult, status: 1 };
  },
  update: async param => {
    let finnalyResult;

    try {
      const { entity } = param;

      const foundUser = await MODELS.findOne(users, {
        where: {
          id: param.id
        }
      });

      if (foundUser) {
        const whereFilter = {
          id: { $ne: param.id },
          username: entity.username || foundUser.username
        };

        const whereFilterEmail = {
          id: { $ne: param.id },
          email: entity.email || foundUser.email
        };

        const whereFilterMobile = {
          id: { $ne: param.id },
          mobile: entity.mobile || foundUser.mobile
        };
        // whereFilter = await filterHelpers.makeStringFilterRelatively(['name'], whereFilter, 'users');

        const infoArr = Array.from(
          await Promise.all([
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(users, { attributes: ['id'], where: whereFilter }),
              entity.username ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.users.username' }
            ),
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(users, { attributes: ['id'], where: whereFilterEmail }),
              entity.email ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.users.email' }
            ),
            preCheckHelpers.createPromiseCheckNew(
              MODELS.findOne(users, { attributes: ['id'], where: whereFilterMobile }),
              entity.mobile ? true : false,
              TYPE_CHECK.CHECK_DUPLICATE,
              { parent: 'api.users.mobile' }
            )
          ])
        );

        if (!preCheckHelpers.check(infoArr)) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'getInfoError',
            message: 'Kh??ng x??c th???c ???????c th??ng tin g???i l??n'
          });
        }

        await MODELS.update(users, entity, { where: { id: Number(param.id) } }).catch(error => {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo',
            error
          });
        });

        finnalyResult = await MODELS.findOne(users, {
          where: { id: param.id },
          include: [
            {
              model: userGroups,
              as: 'userGroups',
              attributes: ['id', 'userGroupName']
            }
          ]
        }).catch(err => {
          throw err;
        });

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo'
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          type: 'crudNotExisted'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'UserServices');
    }

    return { status: 1, result: finnalyResult };
  },
  update_status: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const id = param.id;
        const entity = param.entity;

        MODELS.findOne(users, {
          where: {
            id
          },
          logging: console.log
        })
          .then(findEntity => {
            // console.log("findPlace: ", findPlace)
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted'
                })
              );
            } else {
              MODELS.update(users, entity, {
                where: { id: id }
              })
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(users, { where: { id: param.id } })
                    .then(result => {
                      if (!result) {
                        reject(
                          new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                          })
                        );
                      } else resolve({ status: 1, result: result });
                    })
                    .catch(err => {
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
      }
    }),
  registerByOtp: param =>
    new Promise((resolve, reject) => {
      try {
        // console.log('block id', param.id);
        const usersId = param.usersId;
        const otp = param.otp;
        console.log('otp', usersId, otp);
        MODELS.findOne(userTokens, {
          where: {
            usersId: usersId,
            userTokenCode: otp,
            status: 1,
            dateExpired: {
              $gt: new Date()
            }
          },

          logging: console.log
        })
          .then(findEntity => {
            // console.log("findPlace: ", findPlace)
            if (!findEntity) {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  message: 'M?? Otp kh??ng h???p l???'
                })
              );
            } else {
              MODELS.update(
                users,
                { status: 1 },
                {
                  where: { id: usersId }
                }
              )
                .then(() => {
                  // console.log("rowsUpdate: ", rowsUpdate)
                  MODELS.findOne(users, {
                    where: { id: usersId },
                    attributes: ['id', 'username', 'fullname', 'image', 'mobile', 'email', 'userGroupsId']
                  })
                    .then(result => {
                      if (!result) {
                        reject(
                          new ApiErrors.BaseError({
                            statusCode: 202,
                            type: 'deleteError'
                          })
                        );
                      } else resolve({ status: 1, result: result });
                    })
                    .catch(err => {
                      reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                    });
                })
                .catch(err => {
                  reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
                });
              MODELS.update(userTokens, { status: 2 }, { where: { usersId: findEntity.usersId } }).catch(error => {
                throw new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudInfo',
                  error
                });
              });
            }
          })
          .catch(err => {
            reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
          });
      } catch (err) {
        reject(ErrorHelpers.errorReject(err, 'crudError', 'UserServices'));
      }
    }),

  changePass: param =>
    new Promise((resolve, reject) => {
      try {
        console.log('changePass param: ', param);
        let newPassMd5;
        let { entity } = param;

        if (entity.NewPassWord === undefined || entity.NewPassWord === '') {
          reject({ status: 0, message: 'M???t kh???u m???i kh??ng h???p l???' });
        }
        if (
          entity.channel === 'normal' &&
          entity.UserChanged > 1 &&
          (entity.OldPassWord === undefined || entity.OldPassWord === '')
        ) {
          reject({ status: 0, message: 'M???t kh???u c?? kh??ng h???p l???' });
        }
        if (
          entity.OldPassWord !== undefined &&
          entity.NewPassWord !== undefined &&
          entity.NewPassWord === entity.OldPassWord
        ) {
          reject({ status: 0, message: 'M???t kh???u m???i gi???ng m???t kh???u c??' });
        }

        const oldPassMd5 = md5(entity.OldPassWord);
        // const whereFiter = entity.channel !== "normal" && entity.UserChanged < 1 ? { id: param.id } : { id: param.id,password: oldPassMd5 };
        const whereFiter = { id: param.id, password: oldPassMd5 };

        console.log('whereFiter: ', whereFiter);
        MODELS.findOne(users, { where: whereFiter })
          .then(findUser => {
            if (findUser) {
              newPassMd5 = md5(entity.NewPassWord);
              entity = Object.assign(param.entity, { password: newPassMd5 });
              MODELS.update(users, entity, {
                where: { id: Number(param.id) }
                // fields: ['password']
              })
                .then(rowsUpdate => {
                  console.log('rowsUpdate: ', rowsUpdate);
                  // usersModel.findById(param.id).then(result => {

                  // })
                  if (rowsUpdate[0] > 0) {
                    resolve({ status: 1, message: 'Th??nh C??ng' });
                  } else {
                    reject({ status: 0, message: 'Thay ?????i th???t b???i' });
                  }
                })
                .catch(error => {
                  reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'));
                });
            } else {
              console.log('not found user');
              reject({ status: 0, message: 'M???t kh???u c?? kh??ng ????ng.' });
            }
          })
          .catch(error => {
            reject(ErrorHelpers.errorReject(error, 'crudError', 'UserServices'));
          });
      } catch (error) {
        console.log('error changepass:', error);
        reject({ status: 0, message: 'L???i c?? s??? d??? li???u' });
      }
    }),
  changePassByOtp: async param => {
    let finnalyResult;

    try {
      const { password, otp, usersId } = param;

      const foundUserToken = await MODELS.findOne(userTokens, {
        where: {
          usersId: usersId,
          userTokenCode: otp,
          status: 1,
          dateExpired: {
            $gt: new Date()
          }
        }
      });

      if (foundUserToken) {
        const foundUser = await MODELS.findOne(users, {
          where: {
            id: usersId
          }
        });

        if (foundUser) {
          const newPass = md5(password);

          if (foundUser.password == newPass) {
            throw new ApiErrors.BaseError({
              statusCode: 202,
              message: 'M???t kh???u  m???i gi???ng m???t kh???u c??'
            });
          } else {
            await MODELS.update(users, { password: newPass }, { where: { id: usersId } }).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudInfo',
                error
              });
            });
            await MODELS.update(userTokens, { status: 2 }, { where: { usersId: usersId } }).catch(error => {
              throw new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudInfo',
                error
              });
            });

            finnalyResult = await MODELS.findOne(users, {
              where: { id: usersId },
              attributes: ['id', 'username', 'image', 'fullname', 'mobile', 'userGroupsId', 'email']
            }).catch(err => {
              throw err;
            });
          }
        } else {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            message: 'crudNotExisted'
          });
        }

        if (!finnalyResult) {
          throw new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudInfo'
          });
        }
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'M?? Otp kh??ng h???p l???'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'UserServices');
    }

    return { status: 1, result: finnalyResult };
  },
  accessOtp: async param => {
    let finnalyResult;

    try {
      const { otp, usersId } = param;

      const foundUserToken = await MODELS.findOne(userTokens, {
        where: {
          usersId: usersId,
          userTokenCode: otp,
          dateExpired: {
            $gt: new Date()
          }
        }
      });

      if (foundUserToken) {
        finnalyResult = foundUserToken;
      } else {
        throw new ApiErrors.BaseError({
          statusCode: 202,
          message: 'M?? Otp kh??ng h???p l???'
        });
      }
    } catch (error) {
      ErrorHelpers.errorThrow(error, 'crudError', 'UserServices');
    }

    return { status: 1, result: finnalyResult };
  },
  resetPass: param =>
    new Promise(resolve => {
      try {
        console.log('param: ', param);
        let { entity } = param;

        if (entity.password === undefined || entity.password === '') {
          resolve({ status: 0, message: 'M???t kh???u kh??ng h???p l???!' });
        }
        const passMd5 = md5(entity.password);

        console.log('md5: ', passMd5);
        entity = Object.assign({}, { password: passMd5 });
        MODELS.update(users, entity, {
          where: { id: Number(param.id) }
          // fields: ['password']
        })
          .then(rowsUpdate => {
            console.log('rowsUpdate: ', rowsUpdate);
            if (rowsUpdate[0] > 0) {
              MODELS.findOne(users, { where: { id: param.id } }).then(resultUser => {
                if (resultUser) {
                  sendEmailService.sendGmail({
                    emailTo: resultUser.dataValues.email,
                    subject: 'H??? TH???NG CHOSO.VN - TH??NG B??O ?????I M???T KH???U',
                    sendTypeMail: 'html',
                    body: 'Ch??o b???n, M???t kh???u m???i c???a b???n l?? ' + entity.password
                  });
                }
              });

              resolve({ status: 1, message: 'Th??nh C??ng' });
            } else {
              resolve({ status: 0, message: 'M???t kh???u c?? gi???ng m???t kh???u m???i' });
            }
          })
          .catch(err => {
            console.log('create user err: ', err);
            resolve({ status: -2, message: err.errors.message });
          });
      } catch (error) {
        resolve({ status: -1, message: `L???i c?? s??? d??? li???u: ${error}` });
      }
    }),
  requestForgetPass: param =>
    new Promise(async (resolve, reject) => {
      let result;

      try {
        console.log('param: ', param);
        let whereFilter = {};
        let type;

        if (param.email) {
          whereFilter = { email: param.email };
          type = 1;
        } else if (param.mobile) {
          whereFilter = { mobile: param.mobile };
          type = 2;
        }
        const objectUser = await MODELS.findOne(users, {
          where: whereFilter
        });

        if (objectUser) {
          if (
            objectUser.dataValues &&
            (Number(objectUser.dataValues.status) === -1 || Number(objectUser.dataValues.status) === 0)
          ) {
            reject(
              new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudNotExisted',
                message: viMessage['api.users.notexists.status']
              })
            );
          } else if (type === 1) {
            const usercode = Math.floor(1000 + Math.random() * 9000);
            console.log('usercode', usercode);
            const userToken = await MODELS.create(userTokens, {
              userTokenCode: usercode,
              usersId: objectUser.id,
              type: type,
              status: 1,
              dateExpired: moment(new Date()).add(5, 'minutes')
            }).catch(err => {
              // console.log('create user err: ', err);
              throw err;
            });

            if (!userToken) {
              throw new ApiErrors.BaseError({ statusCode: 202, message: 'T???o m???i th???t b???i' });
            } else {
              tokenSerivce.createToken({ usercode: usercode }).then(async data => {
                await sendEmailService
                  .sendGmail({
                    emailTo: param.email,
                    subject: 'QU??N M???T KH???U H??? TH???NG CHOSO.VN',
                    sendTypeMail: 'html',
                    body:
                      'Ch??o b???n, M?? x??c th???c c???a b???n l?? ' +
                      usercode +
                      ' ho???c l???y l???i m???t kh???u vui l??ng click v??o <a href="' +
                      CONFIG['WEB_LINK_CLIENT'] +
                      'password-recovery?token=' +
                      data.token +
                      '">????y</a>!'
                  })
                  .then(() => {
                    result = { success: true, usersId: objectUser.id };
                    resolve(result);
                  })
                  .catch(error => {
                    result = { success: false, error: error };
                    resolve(result);
                  });
              });
            }
          } else if (type === 2) {
            const usercode = Math.floor(1000 + Math.random() * 9000);
            console.log('usercode', usercode);
            const userToken = await MODELS.create(userTokens, {
              userTokenCode: usercode,
              usersId: objectUser.id,
              type: type,
              status: 0,
              dateExpired: moment(new Date()).add(5, 'minutes')
            }).catch(err => {
              // console.log('create user err: ', err);
              throw err;
            });

            if (!userToken) {
              throw new ApiErrors.BaseError({ statusCode: 202, message: 'T???o m???i th???t b???i' });
            } else {
              tokenSerivce.createToken({ usercode: usercode }).then(async data => {
                await otpService
                  .sendOtp({
                    msisdn: param.mobile,
                    message: 'Choso.vn: Ma OTP tren Choso cua ban la ' + usercode
                  })
                  .then(async data => {
                    console.log('data');
                    if (data && data.status === 1) {
                      await MODELS.update(
                        userTokens,
                        {
                          resultId: data.result,
                          status: 1
                        },
                        {
                          where: {
                            id: userToken.id
                          }
                        }
                      );
                    }

                    result = { success: true, usersId: objectUser.id };
                    resolve(result);
                  })
                  .catch(error => {
                    result = { success: false, error: error };
                    resolve(result);
                  });
              });
            }
          }
        } else {
          reject(
            new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted',
              message: viMessage['api.users.notexists.email']
            })
          );
          // result = {sucess:false}
        }
      } catch (error) {
        reject(
          new ApiErrors.BaseError({
            statusCode: 202,
            type: 'ERRORS',
            message: error
          })
        );
      }
    }),
  loginByEmail: param =>
    new Promise(async (resolve, reject) => {
      try {
        console.log('param: ', param);
        let result;

        const dataVerifyToken = jwt.verify(param.token, CONFIG.JWT_SECRET);
        console.log('dataVerifyToken: ', dataVerifyToken);

        if (param.email === dataVerifyToken.email && dataVerifyToken.token === CONFIG['JWT_SECRET']) {
          await MODELS.findOne(users, { where: { email: param.email } }).then(user => {
            const dataToken = { user: user.username, userId: user.id };
            const token = jwt.sign(
              {
                ...dataToken
              },
              process.env.JWT_SECRET,
              {
                expiresIn: `${CONFIG.TOKEN_LOGIN_EXPIRE}`
                // algorithm: 'RS256'
              }
            );
            // role = [...userInfo.RoleDetails];
            // console.log("token", token)

            if (token) {
              result = { success: false, token: token };
              resolve(result);
            } else {
              reject(
                new ApiErrors.BaseError({
                  statusCode: 202,
                  type: 'crudNotExisted',
                  message: viMessage['api.users.notexists.email']
                })
              );
            }
          });
        } else {
          reject(
            new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted',
              message: viMessage['api.users.notexists.email']
            })
          );
        }
      } catch (error) {
        reject(
          new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted'
          })
        );
      }
    }),
  loginWithSocical: param =>
    new Promise(async (resolve, reject) => {
      try {
        console.log('param: ', param);
        let result;
        let objectusers;
        const dataVerifyToken = jwt.verify(param.token, CONFIG.JWT_SECRET);
        console.log('dataVerifyToken: ', dataVerifyToken);

        if (
          param.referralSocial === dataVerifyToken.referralSocial &&
          param.idSocial === dataVerifyToken.idSocial &&
          dataVerifyToken.token === CONFIG['JWT_SECRET']
        ) {
          console.log('vao login id social');
          const wherefilter = {
            referralSocial: param.referralSocial,
            idSocial: param.idSocial
          };

          objectusers = await MODELS.findOne(users, { where: wherefilter });
        }
        console.log('vao login id social', objectusers);
        if (!objectusers && param.email === dataVerifyToken.email && dataVerifyToken.token === CONFIG['JWT_SECRET']) {
          console.log('vao login email');
          objectusers = await MODELS.findOne(users, { where: { email: param.email } });
        }

        if (objectusers) {
          const dataToken = {
            user: objectusers.username,
            userId: objectusers.id,
            userGroupsId: objectusers.userGroupsId
          };
          const token = jwt.sign(
            {
              ...dataToken
            },
            process.env.JWT_SECRET,
            {
              expiresIn: `${CONFIG.TOKEN_LOGIN_EXPIRE}`
              // algorithm: 'RS256'
            }
          );

          if (token) {
            result = { success: true, token: token };
            resolve(result);
          } else {
            reject(
              new ApiErrors.BaseError({
                statusCode: 202,
                type: 'crudNotExisted',
                message: viMessage['api.users.notexists.social']
              })
            );
          }
        } else {
          console.log('user ko t???n t???i');
          reject(
            new ApiErrors.BaseError({
              statusCode: 202,
              type: 'crudNotExisted',
              message: viMessage['api.users.notexists']
            })
          );
        }
      } catch (error) {
        reject(
          new ApiErrors.BaseError({
            statusCode: 202,
            type: 'crudNotExisted'
          })
        );
      }
    }),
  getByUserGroups: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort, attributes, auth } = param;
      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage) + 1;

      console.log(JSON.stringify(filter));
      let result = await sequelize.query(
        'call sp_users_byUserGroups(:in_fullName,:in_pageIndex, :in_pageSize,:in_userGroupsId, :in_locations,:in_categories,:in_productName,:in_orderby,:in_marketsId,@out_rowCount);select @out_rowCount;',
        {
          replacements: {
            in_fullName: filter.fullName || '',
            in_pageIndex: page,
            in_pageSize: perPage,
            in_userGroupsId: filter.userGroupsId ? filter.userGroupsId : 0,
            in_locations: filter.locations ? JSON.stringify(filter.locations) : '[]',
            in_categories: filter.categories ? JSON.stringify(filter.categories) : '[]',
            in_productName: filter.productName || '',
            in_orderby: sort || 'id desc',
            in_marketsId: filter.marketsId || -99
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      delete result[0].meta;

      console.log('result===', result);
      const rows = Object.values(result[0]);

      result = result.map(e => e['0']);

      // console.log("rows===",rows)
      const outOutput = result[2]['@out_rowCount'];
      // console.log("outOutput===",outOutput)

      console.log('result2===', result);
      finnalyResult = {
        result: rows,
        page,
        perPage,
        count: outOutput
      };
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'ecommerceProductService');
    }

    return finnalyResult;
  },
  sp_usersApprovedLocations_getByUsersSellerId: async param => {
    let finnalyResult;

    try {
      const { filter, range, sort, attributes, auth } = param;
      const perPage = range[1] - range[0] + 1;
      const page = Math.floor(range[0] / perPage) + 1;

      console.log(JSON.stringify(filter));
      let result = await sequelize.query(
        'call sp_usersApprovedLocations_getByUsersSellerId(:in_usersId,:in_pageIndex, :in_pageSize,@out_rowCount);select @out_rowCount;',
        {
          replacements: {
            in_usersId: filter.usersId || 0,
            in_pageIndex: page,
            in_pageSize: perPage
          },
          type: sequelize.QueryTypes.SELECT
        }
      );

      delete result[0].meta;
      console.log('result===', result);
      const rows = Object.values(result[0]);

      result = result.map(e => e['0']);

      // console.log("rows===",rows)
      const outOutput = result[2]['@out_rowCount'];
      // console.log("outOutput===",outOutput)

      console.log('result2===', result);
      finnalyResult = {
        result: rows,
        page,
        perPage,
        count: outOutput
      };
    } catch (err) {
      ErrorHelpers.errorThrow(err, 'getListError', 'ecommerceProductService');
    }

    return finnalyResult;
  }
};
