"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Balance extends Model {
    static associate(models) {
      Balance.belongsTo(models.User);
      Balance.belongsTo(models.Booking);
    }
  }
  Balance.init(
    {
      amount: DataTypes.INTEGER,
      BookingId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Balance",
    }
  );
  return Balance;
};
