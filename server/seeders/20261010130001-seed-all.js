"use strict";

const { hashPassword } = require("../helpers/bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = require("../data/users.json");
    const dataUsers = users.map((el) => {
      el.password = hashPassword(el.password);
      el.createdAt = el.updatedAt = new Date();
      return el;
    });
    await queryInterface.bulkInsert("Users", dataUsers, {});

    const profiles = require("../data/userProfile.json");
    const dataProfiles = profiles.map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    });
    await queryInterface.bulkInsert("UserProfiles", dataProfiles, {});

    const categories = require("../data/category.json");
    const dataCategories = categories.map((el) => {
      el.createdAt = el.updatedAt = new Date();
      el.specifications = JSON.stringify(el.specifications);
      return el;
    });
    await queryInterface.bulkInsert("Categories", dataCategories, {});

    const properties = require("../data/property.json");
    const dataProperties = properties.map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    });
    await queryInterface.bulkInsert("Properties", dataProperties, {});

    const specs = require("../data/specification.json");
    const dataSpecs = specs.map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    });
    await queryInterface.bulkInsert("Specifications", dataSpecs, {});

    const images = require("../data/propertyImage.json");
    const dataImages = images.map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    });
    await queryInterface.bulkInsert("PropertyImages", dataImages, {});


    const bookings = require("../data/booking.json");
    const dataBookings = bookings.map((el) => {
      el.startDate = new Date(el.startDate);
      el.endDate = new Date(el.endDate);
      el.createdAt = el.updatedAt = new Date();
      return el;
    });
    await queryInterface.bulkInsert("Bookings", dataBookings, {});

    const dataBalances = dataBookings.map((el, index) => {
      return { BookingId: index + 1, UserId: el.ownerId, amount: el.totalPrice, createdAt: new Date(), updatedAt: new Date() };
    });
    await queryInterface.bulkInsert("Balances", dataBalances, {});

    const reviews = require("../data/review.json");
    const dataReviews = reviews.map((el) => {
      el.createdAt = el.updatedAt = new Date(el.createdAt);
      return el;
    });
    await queryInterface.bulkInsert("Reviews", dataReviews, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete("Categories", null, { truncate: true, cascade: true, restartIdentity: true });
  },
};
