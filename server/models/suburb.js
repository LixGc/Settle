"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Suburb extends Model {
        static associate(models) { }
    }
    // The Sydney suburbs hosts pick from, with where each one is on the map
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