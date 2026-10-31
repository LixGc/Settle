const router = require("express").Router();
const UserController = require("../controllers/userController");
const PropertyController = require("../controllers/propertyController");
const user = require("./userRoute");
const property = require("./propertyRoute");
const BookingController = require("../controllers/bookingController");
const booking = require("./bookingRoute");
const review = require("./reviewRoute");
const payment = require("./paymentRoute");
const chat = require("./chatRoute");
// Sign up, then log in in two steps: /otp emails a code, /login checks it
router.post("/register", UserController.register);
router.post("/otp", UserController.getOTP);
router.post("/login", UserController.login);
// The rest have their own route files
router.use("/profiles", user);
router.use("/properties", property);
router.get("/categories", PropertyController.getCategories);
router.get("/suburbs", PropertyController.searchSuburbs);
router.use("/bookings", booking);
router.get("/trending", BookingController.fetchTrending);
router.use("/reviews", review);
router.use("/payments", payment);
router.use("/chat", chat);
module.exports = router;