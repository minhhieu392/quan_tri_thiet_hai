/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'disasterGroupsDisasters',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      disastersId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'disastersId'
      },
      disasterGroupsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'disasterGroupsId'
      }
    },
    {
      tableName: 'disasterGroupsDisasters',
      timestamps: false
    }
  );
};
