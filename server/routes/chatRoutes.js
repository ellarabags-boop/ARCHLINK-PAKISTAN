const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { listConversations, getMessages, saveMessage } = require("../controllers/chatController");
const router = express.Router();
router.use(protect);
router.get("/conversations", listConversations);
router.get("/:requestId/messages", getMessages);
router.post("/:requestId/messages", saveMessage);
module.exports = router;
