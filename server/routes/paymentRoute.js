const router = require("express").Router();
const PaymentController = require("../controllers/paymentController");
const authentication = require("../middlewares/loginAuthentication");

router.get("/success", PaymentController.paymentSuccess);
router.get("/cancel", PaymentController.paymentCancel);
router.post("/:bookingId", authentication, PaymentController.createPayment);

module.exports = router;