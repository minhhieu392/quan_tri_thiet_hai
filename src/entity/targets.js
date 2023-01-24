/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'targets',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      targetsCode: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'targetsCode'
      },
      targetsName: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'targetsName'
      },
      finalLevel: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: 0,
        field: 'finalLevel'
      },
      valueStatus: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: 0,
        field: 'valueStatus'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'userCreatorsId'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      },
      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateUpdated'
      },
      status: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'status'
      },
      parentId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'parentId',
        defaultValue: '0'
      },
      unitName: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'unitName'
      }
    },

    {
      tableName: 'targets',
      timestamps: false
    }
  );
};
