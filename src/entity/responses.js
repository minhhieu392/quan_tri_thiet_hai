module.exports = function(sequelize, DataTypes) {
  return sequelize.define('responses', {
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
    },
    supportSourcesId: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      field: 'supportSourcesId'
    },
    dateCreated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'dateCreated'
    },
  }, {
    tableName: 'responses',
    timestamps: false
  });
};
