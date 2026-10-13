const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gateway: { type: String, default: "safepay" },
  trackerToken: { type: String, unique: true, sparse: true },
  currency: { type: String, default: "PKR" },
  grossAmount: { type: Number, required: true, min: 0 },
  commissionPercent: { type: Number, required: true, min: 0, max: 100 },
  platformFee: { type: Number, required: true, min: 0 },
  providerAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  paidAt: Date,
  gatewayEventId: String,
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
