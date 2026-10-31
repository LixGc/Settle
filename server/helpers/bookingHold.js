const { Op } = require("sequelize");
const { Booking, Property, User } = require("../models");
const getStripe = require("./stripe");
const { sendInvoiceEmail } = require("./nodemailer");

// An unpaid booking holds the dates for 30 minutes. Opening the Stripe page gives it another 30,
// because that's the shortest time Stripe lets a payment page stay open
const HOLD_MINUTES = 30;

const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60 * 1000);

// Cancels unpaid bookings whose time ran out, so their dates can be booked again.
// It runs before every request instead of on a timer, because a free server sleeps when nobody uses it
const cancelExpiredBookings = async () => {
    const expired = await Booking.findAll({
        where: { status: "pending", expiresAt: { [Op.lt]: new Date() } },
        include: [Property, User],
    });
    for (const booking of expired) {
        try {
            // The guest may have paid just before the time ran out without the app telling us, so ask Stripe first
            if (booking.paymentSessionId) {
                const session = await getStripe().checkout.sessions.retrieve(booking.paymentSessionId);
                if (session.payment_status === "paid") {
                    const [updated] = await Booking.update({ status: "ongoing" }, { where: { id: booking.id, status: "pending" } });
                    if (updated) {
                        sendInvoiceEmail(booking, session.payment_intent).catch((error) => console.log("Invoice email failed:", error.message));
                    }
                    continue;
                }
            }
            await Booking.update({ status: "cancelled" }, { where: { id: booking.id, status: "pending" } });
        } catch (error) {
            // Stripe couldn't be reached, so leave it for now and check again on the next request
            console.log("Could not check booking " + booking.id + ":", error.message);
        }
    }
};

module.exports = { HOLD_MINUTES, minutesFromNow, cancelExpiredBookings };