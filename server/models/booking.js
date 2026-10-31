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
      // pending = not paid yet, ongoing = paid, completed = the stay is over,
      // cancelled = it wasn't paid in time (see helpers/bookingHold.js)
      status: {
        type: DataTypes.ENUM,
        values: ["pending", "ongoing", "payment", "completed", "cancelled"],
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
      // The host's id, saved here so finding a host's bookings is easy
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Owner Id required" },
          notEmpty: { msg: "Owner Id required" },
        },
      },
      // Nights x price per night, worked out when booking
      totalPrice: {
        type: DataTypes.INTEGER,
      },
      // An unpaid booking holds the dates until this time
      expiresAt: DataTypes.DATE,
      // The last Stripe payment page opened for it, so the server can ask Stripe if it was paid
      paymentSessionId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Booking",
    }
  );
  return Booking;
};
