const router = require("express").Router();
const PropertyController = require("../controllers/propertyController");
const authentication = require("../middlewares/loginAuthentication");
const uploadMulti = require("../middlewares/uploadImage");
// /my-properties has to come before /:id, or Express would read "my-properties" as an id
router.get("/my-properties", authentication, PropertyController.fetchMyProperty);
router.get("/", PropertyController.fetchProperty);
router.get("/locations", PropertyController.fetchLocation);
router.get("/:id", PropertyController.detailProperty);
// uploadMulti puts the photos on Cloudinary first, then the controller gets the links
router.put("/:id", authentication, uploadMulti(["image", "images"]), PropertyController.editProperty);
router.delete("/:id", authentication, PropertyController.removeProperty);
router.post("/", authentication, uploadMulti(["image", "images"]), PropertyController.addProperty);
module.exports = router;