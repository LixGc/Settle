const { Booking, Property, User, UserProfile, Review, Balance } = require("../models/index");
const { Sequelize, Op } = require("sequelize");
const totalNightConverter = require("../helpers/totalNightConverter");

const bookingInclude = [
    {
        model: Property,
        include: [
            {
                model: User,
                attributes: { exclude: ["password", "otp"] },
                include: [{ model: UserProfile }],
            },
        ],
    },
    {
        model: User,
        attributes: { exclude: ["password", "otp"] },
        include: [{ model: UserProfile }],
    },
];

class BookingController {
    static async createBooking(req, res, next) {
        try {
            const { PropertyId } = req.params;
            const property = await Property.findByPk(PropertyId);
            if (!property) {
                throw { name: "not_found" };
            }
            if (property.UserId == req.user.id) {
                throw { name: "same-user" };
            }
            if (!req.body.startDate || !req.body.endDate) {
                throw { name: "date_required" };
            }
            // Turn "2026-11-01" into a date at midnight UTC, so saving and searching use the same time
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(req.body.endDate);
            const totalNight = totalNightConverter(startDate, endDate);
            if (!(totalNight >= 1)) {
                throw { name: "invalid_date" };
            }

            // Stop two bookings on the same property overlapping
            const overlapping = await Booking.findOne({
                where: {
                    PropertyId,
                    startDate: { [Op.lt]: endDate },
                    endDate: { [Op.gt]: startDate },
                },
            });
            if (overlapping) {
                throw { name: "already_booked" };
            }

            const totalPrice = totalNight * property.price;
            const booking = await Booking.create({
                PropertyId,
                startDate,
                endDate,
                UserId: req.user.id,
                ownerId: property.UserId,
                totalPrice,
            });
            res.status(201).json({ message: "Success create new booking", id: booking.id });
        } catch (error) {
            next(error);
        }
    }
    static async findAllBooking(req, res, next) {
        try {
            const bookings = await Booking.findAll({
                where: { UserId: req.user.id },
                include: bookingInclude,
                order: [["startDate", "DESC"]],
            });
            res.json(bookings);
        } catch (error) {
            next(error);
        }
    }

    static async findBookingsByOwner(req, res, next) {
        try {
            const bookings = await Booking.findAll({
                where: { ownerId: req.user.id },
                include: bookingInclude,
                order: [["startDate", "DESC"]],
            });
            res.json(bookings);
        } catch (error) {
            next(error);
        }
    }

    static async findBookingById(req, res, next) {
        try {
            const { id } = req.params;
            const booking = await Booking.findOne({
                where: { id },
                include: bookingInclude,
            });
            if (!booking) {
                throw { name: "not_found" };
            }
            if (booking.UserId !== req.user.id && booking.ownerId !== req.user.id) {
                throw { name: "forbidden", message: "You are not allowed to see this booking" };
            }
            res.json(booking);
        } catch (error) {
            next(error);
        }
    }
    static async updateBookingStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!["pending", "ongoing", "payment", "completed"].includes(status)) {
                throw { name: "invalid_status" };
            }
            const findBooking = await Booking.findByPk(id);
            if (!findBooking) {
                throw { name: "not_found" };
            }
            if (findBooking.UserId !== req.user.id && findBooking.ownerId !== req.user.id) {
                throw { name: "forbidden", message: "You are not allowed to update this booking" };
            }
            // Only the owner can complete a booking, because that pays them
            if (status === "completed" && findBooking.ownerId !== req.user.id) {
                throw { name: "forbidden", message: "Only the owner can complete this booking" };
            }

            const wasCompleted = findBooking.status === "completed";
            await findBooking.update({ status });

            if (status === "completed" && !wasCompleted) {
                await Balance.create({ BookingId: findBooking.id, UserId: findBooking.ownerId, amount: findBooking.totalPrice });
            }
            res.json({ message: `Booking status updated to ${status}` });
        } catch (error) {
            next(error);
        }
    }
    static async findAllBookingByProperty(req, res, next) {
        try {
            const { propertyId } = req.params;
            const property = await Property.findByPk(propertyId);
            if (!property) {
                throw { name: "not_found" };
            }
            // Public route, so only return the booked dates, not who booked
            const bookings = await Booking.findAll({
                where: { PropertyId: propertyId },
                attributes: ["id", "startDate", "endDate", "status"],
            });
            res.json(bookings);
        } catch (error) {
            next(error);
        }
    }

    static async fetchTrending(req, res, next) {
        try {
            const results = await Booking.findAll({
                attributes: ["PropertyId", [Sequelize.fn("COUNT", Sequelize.col("PropertyId")), "bookingCount"]],
                where: { status: "completed" },
                group: ["PropertyId"],
                order: [[Sequelize.fn("COUNT", Sequelize.col("PropertyId")), "DESC"]],
                limit: 7,
            });

            const mostBookedIds = results.map((result) => result.getDataValue("PropertyId"));
            const mostBookedProperties = await Property.findAll({
                where: { id: mostBookedIds },
                include: [Review, Booking],
            });

            const trendingData = mostBookedProperties.map((property) => {
                const { id, name, image, price, location, Reviews, Bookings } = property;
                const totalReviews = Reviews.length;
                const averageRating = totalReviews > 0 ? Reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0;
                return {
                    id,
                    name,
                    image,
                    location,
                    price,
                    totalReviews,
                    averageRating: averageRating.toFixed(1),
                    totalBookings: Bookings.length,
                };
            });
            res.json(trendingData);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BookingController;