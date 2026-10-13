const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    commissionPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 10,
    },

    platformFee: {
      type: Number,
      min: 0,
      default: 0,
    },

    providerAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },

    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);