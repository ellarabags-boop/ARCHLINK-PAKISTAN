const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createCheckout, getPaymentStatus, getMyPayments, requestSettlement } = require("../controllers/paymentController");
const router = express.Router();
router.post("/checkout/:requestId", protect, createCheckout);
router.get("/status/:requestId", protect, getPaymentStatus);
router.get("/mine", protect, getMyPayments);
router.post("/settlements", protect, requestSettlement);
module.exports = router;
