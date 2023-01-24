/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'humanDamages',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      fullname: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'fullname'
      },
      yearOfBirth: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'yearOfBirth'
      },
      disastersId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'disastersId'
      },
      vulnerablePersonsId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'vulnerablePersonsId'
      },
      address: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'address'
      },
      ethnic: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'ethnic'
      },
      note: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'note'
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'reason'
      },
      time: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'time'
      },
      type: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'type'
      },
      wardsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'wardsId'
      },
      gender: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'gender'
      }
    },
    {
      tableName: 'humanDamages',
      timestamps: false
    }
  );
};
