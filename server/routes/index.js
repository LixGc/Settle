const router = require("express").Router();
const UserController = require("../controllers/userController");
const user = require("./userRoute");
router.post("/register", UserController.register);
router.post("/otp", UserController.getOTP);
router.post("/login", UserController.login);
router.use("/profiles", user);
module.exports = router;