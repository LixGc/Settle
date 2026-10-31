const router = require("express").Router();
const PaymentController = require("../controllers/paymentController");
const authentication = require("../middlewares/loginAuthentication");

// Stripe sends the guest back to these after paying, so they can't need a login
router.get("/success", PaymentController.paymentSuccess);
router.get("/cancel", PaymentController.paymentCancel);
router.post("/:bookingId", authentication, PaymentController.createPayment);

module.exports = router;