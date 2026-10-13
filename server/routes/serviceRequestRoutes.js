const express = require("express");

const {
  createServiceRequest,
  getProviderRequests,
  getClientRequests,
  updateRequestStatus,
} = require("../controllers/serviceRequestController");

const { protect } = require("../middleware/authMiddleware");
const { providerOnly } = require("../middleware/roleMiddleware");

const router = express.Router();


// Client creates request
router.post(
  "/",
  protect,
  createServiceRequest
);


// Provider gets received requests
router.get(
  "/provider",
  protect,
  providerOnly,
  getProviderRequests
);


// Client gets sent requests
router.get(
  "/client",
  protect,
  getClientRequests
);


// Provider accepts/rejects request
router.put(
  "/:id/status",
  protect,
  providerOnly,
  updateRequestStatus
);


module.exports = router;