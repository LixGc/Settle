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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete("Categories", null, { truncate: true, cascade: true, restartIdentity: true });
  },
};
