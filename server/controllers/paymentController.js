const { Booking, Property, User } = require("../models");
const getStripe = require("../helpers/stripe");

class PaymentController {
    static async createPayment(req, res, next) {
        try {
            const findBooking = await Booking.findByPk(req.params.bookingId, { include: [Property, User] });
            if (!findBooking) {
                throw { name: "not_found" };
            }
            if (findBooking.UserId !== req.user.id) {
                throw { name: "forbidden", message: "You can only pay for your own booking" };
            }
            if (findBooking.status !== "pending") {
                throw { name: "already_paid" };
            }

            // After paying, Stripe sends the tenant back to this server
            const serverUrl = `${req.protocol}://${req.get("host")}`;
            const session = await getStripe().checkout.sessions.create({
                mode: "payment",
                customer_email: findBooking.User.email,
                line_items: [
                    {
                        price_data: {
                            currency: "aud",
                            unit_amount: findBooking.totalPrice * 100, // Stripe counts in cents
                            product_data: {
                                name: findBooking.Property ? findBooking.Property.name : "Settle booking",
                            },
                        },
                        quantity: 1,
                    },
                ],
                metadata: { bookingId: String(findBooking.id) },
                success_url: `${serverUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${serverUrl}/payments/cancel`,
            });
            res.status(201).json({ id: session.id, url: session.url });
        } catch (error) {
            next(error);
        }
    }

    static async paymentSuccess(req, res, next) {
        try {
            const { session_id } = req.query;
            if (!session_id) {
                throw { name: "not_found" };
            }
            // Ask Stripe whether this payment was really made
            const session = await getStripe().checkout.sessions.retrieve(session_id);
            if (session.payment_status !== "paid") {
                throw { name: "payment_not_completed" };
            }
            const findBooking = await Booking.findByPk(session.metadata.bookingId);
            if (!findBooking) {
                throw { name: "not_found" };
            }
            if (findBooking.status === "pending") {
                await findBooking.update({ status: "ongoing" });
            }
            res.send("<h2>Payment successful</h2><p>You can go back to the Settle app.</p>");
        } catch (error) {
            next(error);
        }
    }

    static paymentCancel(req, res) {
        res.send("<h2>Payment cancelled</h2><p>You can go back to the Settle app and try again.</p>");
    }
}

module.exports = PaymentController;