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
      address: DataTypes.STRING,
      latitude: DataTypes.FLOAT,
      longitude: DataTypes.FLOAT,
      description: {
        type: DataTypes.TEXT,
        validate: {
          len: {
            args: [0, 1000],
            msg: "Description can't be longer than 1000 characters",
          },
        },
      },
      amenities: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
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
      // The street address and the exact map spot are private, so every query leaves them out.
      // Use Property.scope("withAddress") only where they are allowed to be seen
      defaultScope: {
        attributes: { exclude: ["address", "latitude", "longitude"] },
      },
      scopes: {
        withAddress: {},
      },
    }
  );
  return Property;
};
