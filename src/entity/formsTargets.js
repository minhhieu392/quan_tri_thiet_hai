/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'formsTargets',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      formsId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'formsId'
      },
      targetsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'targetsId'
      }
    },
    {
      tableName: 'formsTargets',
      timestamps: false
    }
  );
};
