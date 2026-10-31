"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // A list like ["wifi", "kitchen"], so places can be filtered by what they offer later
        await queryInterface.addColumn("Properties", "amenities", { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: false, defaultValue: [] });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("Properties", "amenities");
    },
};