/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'disastersAffectedAreas',
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
      zone: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'zone'
      },
      provincesId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'provincesId',
        defaultValue: 0
      },
      districtsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'districtsId',
        defaultValue: 0
      },
      wardsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'wardsId',
        defaultValue: 0
      }
    },
    {
      tableName: 'disastersAffectedAreas',
      timestamps: false
    }
  );
};
