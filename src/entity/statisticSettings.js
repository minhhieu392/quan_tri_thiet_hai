/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'statisticSettings',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
      },
      targetsId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'targetsId'
      }
    },
    {
      tableName: 'statisticSettings',
      timestamps: false
    }
  );
};
