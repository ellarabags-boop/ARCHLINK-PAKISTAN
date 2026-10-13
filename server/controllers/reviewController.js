const Review = require("../models/Review");
const ServiceRequest = require("../models/ServiceRequest");

// ==========================================
// CREATE REVIEW
// ==========================================

const createReview = async (req, res) => {
  try {
    const { requestId, rating, comment } =
      req.body;

    // Check required fields
    if (!requestId || !rating || !comment) {
      return res.status(400).json({
        message:
          "Request ID, rating and comment are required",
      });
    }

    // Only clients can create reviews
    if (req.user.role !== "client") {
      return res.status(403).json({
        message:
          "Only clients can submit reviews",
      });
    }

    // Validate rating
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message:
          "Rating must be a whole number between 1 and 5",
      });
    }

    // Validate comment
    const cleanComment = comment.trim();

    if (cleanComment.length < 10) {
      return res.status(400).json({
        message:
          "Review must be at least 10 characters",
      });
    }

    // Find service request
    const serviceRequest =
      await ServiceRequest.findById(requestId);

    if (!serviceRequest) {
      return res.status(404).json({
        message: "Service request not found",
      });
    }

    // Make sure this request belongs to logged-in client
    if (
      serviceRequest.client.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You can only review your own service requests",
      });
    }

    // Review only after provider accepts/completes
    if (
      serviceRequest.status !== "accepted" &&
      serviceRequest.status !== "completed"
    ) {
      return res.status(400).json({
        message:
          "You can review a service only after the provider accepts it",
      });
    }

    // Check if review already exists
    const existingReview =
      await Review.findOne({
        serviceRequest: serviceRequest._id,
      });

    if (existingReview) {
      return res.status(400).json({
        message:
          "You have already reviewed this service request",
      });
    }

    // Create review
    const review = await Review.create({
      serviceRequest: serviceRequest._id,
      service: serviceRequest.service,
      client: serviceRequest.client,
      provider: serviceRequest.provider,
      rating: numericRating,
      comment: cleanComment,
    });

    // Return populated review
    const populatedReview =
      await Review.findById(review._id)
        .populate(
          "client",
          "name email city"
        )
        .populate(
          "provider",
          "name email city"
        )
        .populate(
          "service",
          "title category city price"
        );

    res.status(201).json({
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error(
      "Create Review Error:",
      error
    );

    res.status(500).json({
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

// ==========================================
// GET PROVIDER REVIEWS
// ==========================================

const getProviderReviews = async (
  req,
  res
) => {
  try {
    const reviews = await Review.find({
      provider: req.params.id,
    })
      .populate(
        "client",
        "name email city"
      )
      .populate(
        "service",
        "title category city"
      )
      .sort({
        createdAt: -1,
      });

    res.json(reviews);
  } catch (error) {
    console.error(
      "Get Provider Reviews Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load provider reviews",
    });
  }
};

// ==========================================
// GET REVIEW FOR SERVICE REQUEST
// ==========================================

const getReviewByRequest = async (
  req,
  res
) => {
  try {
    const review = await Review.findOne({
      serviceRequest: req.params.requestId,
    })
      .populate(
        "client",
        "name email city"
      )
      .populate(
        "provider",
        "name email city"
      )
      .populate(
        "service",
        "title category city"
      );

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.json(review);
  } catch (error) {
    console.error(
      "Get Review Error:",
      error
    );

    res.status(500).json({
      message: "Failed to load review",
    });
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  getReviewByRequest,
};