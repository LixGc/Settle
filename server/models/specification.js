"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Specification extends Model {
    static associate(models) {
      Specification.belongsTo(models.Property);
    }
  }
  Specification.init(
    {
      name: DataTypes.STRING,
      value: DataTypes.STRING,
      PropertyId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Specification",
    }
  );
  return Specification;
};
