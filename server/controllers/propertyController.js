const { Property, User, Category, Review, Booking, UserProfile, Specification, PropertyImage } = require("../models/index");
const { sequelize } = require("../models/index");

class PropertyController {
    static async getCategories(req, res, next) {
        try {
            const categories = await Category.findAll();
            res.json(categories);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PropertyController;