"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User);
      Review.belongsTo(models.Property);
    }
  }
  Review.init(
    {
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Rating is required!",
          },
          notEmpty: {
            msg: "Rating is required!",
          },
          isNumeric: {
            msg: "Rating must be a number!",
          },
          min: {
            args: 1,
            msg: "Minimal Rating is 1",
          },
          max: {
            args: 5,
            msg: "Maximal Rating is 5!",
          },
        },
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Message is required!",
          },
          notEmpty: {
            msg: "Message is required!",
          },
        },
      },
      PropertyId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Review",
    }
  );
  return Review;
};
