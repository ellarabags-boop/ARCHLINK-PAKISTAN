const express = require("express");

const {
  createReview,
  getProviderReviews,
  getReviewByRequest,
} = require("../controllers/reviewController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create review
router.post(
  "/",
  protect,
  createReview
);

// Get all reviews of provider
router.get(
  "/provider/:id",
  getProviderReviews
);

// Get review for a service request
router.get(
  "/request/:requestId",
  protect,
  getReviewByRequest
);

module.exports = router;