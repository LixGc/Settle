const router = require("express").Router();
const BookingController = require("../controllers/bookingController");
const authentication = require("../middlewares/loginAuthentication");

router.get("/", authentication, BookingController.findAllBooking);
router.get("/owner", authentication, BookingController.findBookingsByOwner);
router.get("/:id", authentication, BookingController.findBookingById);
router.post("/:PropertyId", authentication, BookingController.createBooking);
router.patch("/:id", authentication, BookingController.updateBookingStatus);
module.exports = router;