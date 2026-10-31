const { Review, Property, User, Booking, UserProfile } = require("../models");

class ReviewController {
    // GET /reviews: reviews I've written
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

    // GET /reviews/my-properties: reviews of the places I host, newest first
    static async getReviewMyProperties(req, res, next) {
        try {
            const reviews = await Review.findAll({
                include: [
                    {
                        model: Property,
                        // Only reviews of places I own
                        where: { UserId: req.user.id },
                    },
                    {
                        model: User,
                        attributes: ["id", "fullName"],
                        include: [{ model: UserProfile, attributes: ["profilePicture"] }],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });
            res.json(reviews);
        } catch (error) {
            next(error);
        }
    }

    // GET /reviews/:PropertyId: all reviews of one place
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
    // POST /reviews/:PropertyId: leave a review
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