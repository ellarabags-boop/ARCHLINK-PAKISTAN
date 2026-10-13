
const express = require("express");

const {
  getAdminStats,
  getAdminUsers,
  getPendingVerifications,
  updateProviderVerification,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const { getAdminSettlements, updateSettlement } = require("../controllers/paymentController");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.get("/verifications/pending", getPendingVerifications);
router.patch("/users/:id/verification", updateProviderVerification);
router.get("/settlements", getAdminSettlements);
router.patch("/settlements/:id", updateSettlement);

module.exports = router;
