const router = require("express").Router();
const PropertyController = require("../controllers/propertyController");

router.get("/", PropertyController.fetchProperty);
router.get("/locations", PropertyController.fetchLocation);

module.exports = router;