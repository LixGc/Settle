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
    static async postReview(req, res, next) {
        try {
            const { PropertyId } = req.params;
            const { message, rating } = req.body;
            const property = await Property.findByPk(PropertyId);
            if (!property) {
                throw { name: "not_found" };
            }
            // Only someone who has stayed there can review it
            const completedBooking = await Booking.findOne({
                where: { PropertyId, UserId: req.user.id, status: "completed" },
            });
            if (!completedBooking) {
                throw { name: "review_not_allowed" };
            }
            await Review.create({
                message,
                rating,
                UserId: req.user.id,
                PropertyId,
            });
            res.status(201).json({ message: "Review success!" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReviewController;