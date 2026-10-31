"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Suburb extends Model {
        static associate(models) { }
    }
    Suburb.init(
        {
            name: DataTypes.STRING,
            latitude: DataTypes.FLOAT,
            longitude: DataTypes.FLOAT,
        },
        {
            sequelize,
            modelName: "Suburb",
        }
    );
    return Suburb;
};