"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Property extends Model {
    static associate(models) {
      Property.belongsTo(models.Category);
      Property.hasMany(models.Booking);
      Property.belongsTo(models.User);
      Property.hasMany(models.Review);
      Property.hasMany(models.Specification);
      Property.hasMany(models.PropertyImage);
    }
  }
  Property.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Name is required!",
          },
          notNull: {
            msg: "Name is required!",
          },
        },
      },
      CategoryId: DataTypes.INTEGER,
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Price is required!",
          },
          notNull: {
            msg: "Price is required!",
          },
          isNumeric: {
            msg: "Price must be a number!",
          },
        },
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Image is required!",
          },
          notNull: {
            msg: "Image is required!",
          },
        },
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Location is required!",
          },
          notNull: {
            msg: "Location is required!",
          },
        },
      },
      UserId: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM,
        values: ["available", "rented"],
        defaultValue: "available",
      },
    },
    {
      sequelize,
      modelName: "Property",
    }
  );
  return Property;
};
