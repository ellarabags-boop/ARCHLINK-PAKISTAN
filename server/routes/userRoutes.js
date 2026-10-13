const express = require("express");

const {
  getUsers,
  getUserById,
  getProviderProfile,
  getProviders,
  submitProviderVerification,
  getMyVerification,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/providers", getProviders);
router.get("/verification/me", protect, getMyVerification);
router.post("/verification", protect, submitProviderVerification);
router.get("/providers/:id", getProviderProfile);
router.get("/", protect, adminOnly, getUsers);
router.get("/:id", protect, adminOnly, getUserById);

module.exports = router;
