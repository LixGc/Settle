"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Bookings", "expiresAt", { type: Sequelize.DATE });
        await queryInterface.addColumn("Bookings", "paymentSessionId", { type: Sequelize.STRING });
        // Postgres keeps the allowed statuses in a type of its own, so the new one is added there
        await queryInterface.sequelize.query(`ALTER TYPE "enum_Bookings_status" ADD VALUE IF NOT EXISTS 'cancelled'`);
        // Bookings that were already unpaid get no extra time, so they stop blocking their dates
        await queryInterface.sequelize.query(`UPDATE "Bookings" SET "expiresAt" = NOW() WHERE status = 'pending'`);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("Bookings", "expiresAt");
        await queryInterface.removeColumn("Bookings", "paymentSessionId");
        // Postgres can't take a value back out of a type, so 'cancelled' stays
    },
};