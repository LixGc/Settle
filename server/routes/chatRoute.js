const router = require("express").Router();
const ChatController = require("../controllers/chatController");
const authentication = require("../middlewares/loginAuthentication");

// Token the app needs to connect to Stream chat
router.get("/token", authentication, ChatController.getToken);
// Makes sure the person you want to message exists on Stream
router.post("/users/:id", authentication, ChatController.addChatUser);

module.exports = router;