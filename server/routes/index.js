const router = require("express").Router();
const UserController = require("../controllers/userController");

router.post("/register", UserController.register);

module.exports = router;