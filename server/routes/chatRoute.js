const router = require("express").Router();
const ChatController = require("../controllers/chatController");
const authentication = require("../middlewares/loginAuthentication");

router.get("/token", authentication, ChatController.getToken);
router.post("/users/:id", authentication, ChatController.addChatUser);

module.exports = router;