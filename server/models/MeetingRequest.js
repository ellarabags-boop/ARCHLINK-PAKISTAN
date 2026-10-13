const mongoose = require("mongoose");

const meetingRequestSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
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
    proposedAt: {
      type: Date,
      required: true,
    },
    mode: {
      type: String,
      enum: ["online", "public_place", "provider_office"],
      required: true,
    },
    meetingDetails: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MeetingRequest", meetingRequestSchema);
