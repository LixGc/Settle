const router = require("express").Router();
const ReviewController = require("../controllers/reviewController");
const authentication = require("../middlewares/loginAuthentication");

router.get("/", authentication, ReviewController.getReviewUser);
// Same as properties: /my-properties before /:PropertyId
router.get("/my-properties", authentication, ReviewController.getReviewMyProperties);
router.get("/:PropertyId", ReviewController.getReviewProperty);
router.post("/:PropertyId", authentication, ReviewController.postReview);
module.exports = router;