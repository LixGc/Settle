"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.Property);
      Booking.belongsTo(models.User);
      Booking.hasMany(models.Balance);
    }
  }
  Booking.init(
    {
      status: {
        type: DataTypes.ENUM,
        values: ["pending", "ongoing", "payment", "completed"],
        defaultValue: "pending",
      },
      PropertyId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: { msg: "Start date required" },
          notEmpty: { msg: "Start date required" },
        },
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: { msg: "End date required" },
          notEmpty: { msg: "End date required" },
        },
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Owner Id required" },
          notEmpty: { msg: "Owner Id required" },
        },
      },
      totalPrice: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "Booking",
    }
  );
  return Booking;
};
