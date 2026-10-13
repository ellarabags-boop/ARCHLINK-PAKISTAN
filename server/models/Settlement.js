const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["requested", "paid", "rejected"], default: "requested" },
  transferReference: { type: String, trim: true, maxlength: 160 },
  adminNotes: { type: String, trim: true, maxlength: 1000 },
  processedAt: Date,
}, { timestamps: true });

settlementSchema.index({ provider: 1, payment: 1 }, { unique: true });
module.exports = mongoose.model("Settlement", settlementSchema);
