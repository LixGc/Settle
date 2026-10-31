const router = require("express").Router();
const UserController = require("../controllers/userController");
const authentication = require("../middlewares/loginAuthentication");
const uploadMulti = require("../middlewares/uploadImage");

// /profiles routes, all for the logged in user
router.get("/", authentication, UserController.getProfile);
// The profile photo and ID card get uploaded to Cloudinary first
router.post("/", authentication, uploadMulti(["profilePicture", "idCard"]), UserController.createProfile);
router.put("/", authentication, uploadMulti(["profilePicture", "idCard"]), UserController.editProfile);
router.delete("/", authentication, UserController.deleteUser);

module.exports = router;