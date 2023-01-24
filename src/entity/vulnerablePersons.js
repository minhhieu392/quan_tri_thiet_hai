/* jshint indent: 1 */
module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'vulnerablePersons',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      vulnerablePersonsName: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'vulnerablePersonsName'
      },
      userCreatorsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'userCreatorsId'
      },
      status: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: 'status'
      },
      dateUpdated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateUpdated'
      },
      dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'dateCreated'
      }
    },
    {
      tableName: 'vulnerablePersons',
      timestamps: false
    }
  );
};
