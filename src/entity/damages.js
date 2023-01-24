/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'damages',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      disastersId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'disastersId'
      },
      targetsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'targetsId'
      },
      value: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: 'value'
      },
      quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: 'quantity'
      },
      wardsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'wardsId'
      }
    },
    {
      tableName: 'damages',
      timestamps: false
    }
  );
};
