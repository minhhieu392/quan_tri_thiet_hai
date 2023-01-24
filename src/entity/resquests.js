module.exports = function(sequelize, DataTypes) {
  return sequelize.define('requests', {
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
    requestGroupsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'requestGroupsId'
    },
    wardsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'wardsId'
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      field: 'amount'
    }
  }, {
    tableName: 'requests',
    timestamps: false
  });
};
