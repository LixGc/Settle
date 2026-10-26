const { Review, Property, User, Booking } = require("../models");

class ReviewController {
    static async getReviewUser(req, res, next) {
        try {
            const reviews = await Review.findAll({
                where: { UserId: req.user.id },
                include: [Property],
            });
            res.json(reviews);
        } catch (error) {
            next(error);
        }
    }

    static async getReviewProperty(req, res, next) {
        try {
            const { PropertyId } = req.params;
            const property = await Property.findByPk(PropertyId);
            if (!property) {
                throw { name: "not_found" };
            }
            const reviews = await Review.findAll({
                where: { PropertyId },
                include: [
                    {
                        model: User,
                        attributes: ["id", "fullName"],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });
            res.json(reviews);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReviewController;