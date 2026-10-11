const router = require("express").Router();
const PropertyController = require("../controllers/propertyController");
const authentication = require("../middlewares/loginAuthentication");

router.get("/my-properties", authentication, PropertyController.fetchMyProperty);
router.get("/", PropertyController.fetchProperty);
router.get("/locations", PropertyController.fetchLocation);
router.get("/:id", PropertyController.detailProperty);

module.exports = router;