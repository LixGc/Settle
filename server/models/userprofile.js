"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    static associate(models) {
      UserProfile.belongsTo(models.User);
    }
  }
  // Links to the profile photo and ID card (the files are on Cloudinary)
  UserProfile.init(
    {
      UserId: DataTypes.INTEGER,
      idCard: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "ID card is required!",
          },
          notNull: {
            msg: "ID card is required!",
          },
        },
      },
      profilePicture: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Profile picture is required!",
          },
          notNull: {
            msg: "Profile picture is required!",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "UserProfile",
    }
  );
  return UserProfile;
};
