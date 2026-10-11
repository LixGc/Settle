const router = require("express").Router();
const PropertyController = require("../controllers/propertyController");
const authentication = require("../middlewares/loginAuthentication");
const uploadMulti = require("../middlewares/uploadImage");
router.get("/my-properties", authentication, PropertyController.fetchMyProperty);
router.get("/", PropertyController.fetchProperty);
router.get("/locations", PropertyController.fetchLocation);
router.get("/:id", PropertyController.detailProperty);

router.post("/", authentication, uploadMulti(["image", "images"]), PropertyController.addProperty);
module.exports = router;