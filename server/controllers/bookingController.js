const { Booking, Property, User, UserProfile, Review, Balance } = require("../models/index");
const { Sequelize, Op } = require("sequelize");
const totalNightConverter = require("../helpers/totalNightConverter");

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
}

module.exports = BookingController;