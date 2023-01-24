/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'disasters',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      disastersName: {
        type: DataTypes.STRING(300),
        allowNull: false,
        field: 'disastersName'
      },

      point: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'point'
      },
      disasterTimeStart: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'disasterTimeStart'
      },
      disasterTimeEnd: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'disasterTimeEnd'
      },
      address: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'address'
      },

      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
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
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'status'
      }
    },
    {
      tableName: 'disasters',
      timestamps: false
    }
  );
};
