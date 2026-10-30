"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Properties", "latitude", { type: Sequelize.FLOAT });
        await queryInterface.addColumn("Properties", "longitude", { type: Sequelize.FLOAT });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("Properties", "latitude");
        await queryInterface.removeColumn("Properties", "longitude");
    },
};