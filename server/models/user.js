"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // A user can host places, book places and write reviews, and has one profile
    static associate(models) {
      User.hasMany(models.Property);
      User.hasOne(models.UserProfile);
      User.hasMany(models.Review);
      User.hasMany(models.Booking);
      User.hasMany(models.Balance);
    }
  }
  User.init(
    {
      fullName: {
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: "Email has already registered" },
        validate: {
          notEmpty: {
            msg: "Email is required!",
          },
          notNull: {
            msg: "Email is required!",
          },
          isEmail: {
            msg: "Invalid email format!",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required!",
          },
          notNull: {
            msg: "Password is required!",
          },
          len: {
            args: [8],
            msg: "Minimum password character is 8!",
          },
          // At least 1 capital, 1 number and 1 thing that isn't a letter or number
          is: {
            args: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/,
            msg: "Password needs at least 1 capital letter, 1 number and 1 special character!",
          },
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Phone Number is required!",
          },
          notNull: {
            msg: "Phone Number is required!",
          },
        },
      },
      // otp = the login code while it's waiting to be used
      otp: DataTypes.STRING,
      expoToken: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  // Hash the password before it's saved
  User.beforeCreate((el) => {
    el.password = hashPassword(el.password);
  });
  return User;
};
