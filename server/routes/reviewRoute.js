const router = require("express").Router();
const ReviewController = require("../controllers/reviewController");
const authentication = require("../middlewares/loginAuthentication");

router.get("/", authentication, ReviewController.getReviewUser);
router.get("/:PropertyId", ReviewController.getReviewProperty);
router.post("/:PropertyId", authentication, ReviewController.postReview);
module.exports = router;