const router = require("express").Router();
const BookingController = require("../controllers/bookingController");
const authentication = require("../middlewares/loginAuthentication");

router.post("/:PropertyId", authentication, BookingController.createBooking);

module.exports = router;