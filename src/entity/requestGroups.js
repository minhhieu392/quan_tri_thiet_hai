module.exports = function(sequelize, DataTypes) {
  return sequelize.define('requestGroups', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    requestGroupsName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'requestGroupsName'
    },
    userCreatorsId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'userCreatorsId'
    },
    status: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'status',
      defaultValue: 1
    },
    unitName: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'unitName'
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
    },
  }, {
    tableName: 'requestGroups',
    timestamps: false
  });
};
