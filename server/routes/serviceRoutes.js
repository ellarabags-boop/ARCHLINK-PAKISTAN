const express = require("express");

const {
  getServices,
  getServiceById,
  getMyServices,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const { protect } = require("../middleware/authMiddleware");
const { providerOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

// Public routes
router.get("/", getServices);

// Must be before /:id so "my-services" is not treated as an ID
router.get("/my-services", protect, providerOnly, getMyServices);

router.get("/:id", getServiceById);

// Provider routes
router.post(
  "/",
  protect,
  providerOnly,
  createService
);

router.put(
  "/:id",
  protect,
  providerOnly,
  updateService
);

router.delete(
  "/:id",
  protect,
  providerOnly,
  deleteService
);

module.exports = router;