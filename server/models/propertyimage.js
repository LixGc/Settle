"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PropertyImage extends Model {
    static associate(models) {
      PropertyImage.belongsTo(models.Property);
    }
  }
  // Extra photos of a place. The main photo is saved on the Property itself
  PropertyImage.init(
    {
      imageUrl: {
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
      PropertyId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "PropertyImage",
    }
  );
  return PropertyImage;
};
