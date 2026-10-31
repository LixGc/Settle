"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Property);
    }
  }
  Category.init(
    {
      // Room, Studio, Apartment, House or Townhouse
      name: DataTypes.STRING,
      specifications: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Category",
    }
  );
  return Category;
};
