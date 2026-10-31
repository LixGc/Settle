const router = require("express").Router();
const BookingController = require("../controllers/bookingController");
const authentication = require("../middlewares/loginAuthentication");

// Everything here starts with /bookings. authentication = you need to be logged in
router.get("/", authentication, BookingController.findAllBooking);
router.get("/owner", authentication, BookingController.findBookingsByOwner);
// Booked dates of a place, so the calendar can block them
router.get("/property/:propertyId", BookingController.findAllBookingByProperty);
router.get("/:id", authentication, BookingController.findBookingById);
router.post("/:PropertyId", authentication, BookingController.createBooking);
// The host changes the status, like marking a stay as completed
router.patch("/:id", authentication, BookingController.updateBookingStatus);
module.exports = router;