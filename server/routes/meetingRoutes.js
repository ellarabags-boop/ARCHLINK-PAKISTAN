const express = require("express");
const {
  getMyMeetings,
  createMeeting,
  updateMeetingStatus,
  cancelMeeting,
} = require("../controllers/meetingController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/mine", getMyMeetings);
router.post("/", createMeeting);
router.patch("/:id/status", updateMeetingStatus);
router.patch("/:id/cancel", cancelMeeting);

module.exports = router;
