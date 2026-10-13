const crypto = require("crypto");
const safepayFactory = require("@sfpy/node-core");
const Payment = require("../models/Payment");
const Settlement = require("../models/Settlement");
const ServiceRequest = require("../models/ServiceRequest");

const isConfigured = () => Boolean(process.env.SAFEPAY_SECRET_KEY && process.env.SAFEPAY_API_KEY);
const gatewayHost = () => process.env.SAFEPAY_ENV === "live" ? "https://api.getsafepay.com" : "https://sandbox.api.getsafepay.com";
const gateway = () => safepayFactory(process.env.SAFEPAY_SECRET_KEY, { authType: "secret", host: gatewayHost() });
const frontendUrl = () => (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
const money = (n) => Number(Number(n || 0).toFixed(2));

async function markPaymentPaid(payment, eventId) {
  if (!payment || payment.status === "paid") return payment;
  payment.status = "paid";
  payment.paidAt = new Date();
  if (eventId) payment.gatewayEventId = String(eventId);
  await payment.save();
  await ServiceRequest.findByIdAndUpdate(payment.serviceRequest, {
    paymentStatus: "paid",
    paymentId: payment._id,
  });
  return payment;
}

exports.createCheckout = async (req, res) => {
  try {
    if (req.user.role !== "client") return res.status(403).json({ message: "Only clients can make payments." });
    if (!isConfigured()) return res.status(503).json({ message: "Payment gateway is not configured. Add SAFEPAY_API_KEY and SAFEPAY_SECRET_KEY in the backend environment." });
    const request = await ServiceRequest.findById(req.params.requestId).populate("service", "title price");
    if (!request) return res.status(404).json({ message: "Service request not found." });
    if (String(request.client) !== String(req.user.userId)) return res.status(403).json({ message: "You cannot pay for this request." });
    if (request.status !== "accepted" && request.status !== "completed") return res.status(400).json({ message: "The provider must accept this request before payment." });
    if (request.paymentStatus === "paid") return res.status(409).json({ message: "This request has already been paid." });
    const grossAmount = money(request.service?.price);
    if (!Number.isFinite(grossAmount) || grossAmount <= 0) return res.status(400).json({ message: "This service does not have a valid price." });
    const configuredRate = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 10);
    const commissionPercent = Number.isFinite(configuredRate) && configuredRate >= 0 && configuredRate <= 100 ? configuredRate : 10;
    const platformFee = money(grossAmount * commissionPercent / 100);
    const providerAmount = money(grossAmount - platformFee);

    let payment = await Payment.findOne({ serviceRequest: request._id });
    if (payment?.status === "paid") return res.status(409).json({ message: "This request has already been paid." });
    if (!payment) {
      payment = await Payment.create({ serviceRequest: request._id, client: request.client, provider: request.provider, grossAmount, commissionPercent, platformFee, providerAmount, currency: "PKR" });
    } else {
      payment.grossAmount = grossAmount;
      payment.commissionPercent = commissionPercent;
      payment.platformFee = platformFee;
      payment.providerAmount = providerAmount;
      payment.status = "pending";
    }

    const sfpy = gateway();
    const session = await sfpy.payments.session.setup({
      merchant_api_key: process.env.SAFEPAY_API_KEY,
      intent: process.env.SAFEPAY_INTENT || "CYBERSOURCE",
      mode: "payment",
      entry_mode: "raw",
      currency: "PKR",
      amount: Math.round(grossAmount * 100),
      metadata: { order_id: String(payment._id), service_request_id: String(request._id) },
      include_fees: false,
    });
    const trackerToken = session?.data?.tracker?.token;
    if (!trackerToken) throw new Error("Payment gateway did not return a tracker token.");
    payment.trackerToken = trackerToken;
    await payment.save();
    const auth = await sfpy.auth.passport.create();
    const tbt = auth?.data;
    if (!tbt) throw new Error("Payment gateway did not return a checkout token.");
    const checkoutUrl = sfpy.checkouts.payment.create({
      tracker: trackerToken,
      tbt,
      environment: process.env.SAFEPAY_ENV === "live" ? "production" : "sandbox",
      source: "hosted",
      redirect_url: `${frontendUrl()}/payment-result?requestId=${request._id}`,
      cancel_url: `${frontendUrl()}/payment-result?requestId=${request._id}&cancelled=1`,
    });
    res.json({ checkoutUrl, paymentId: payment._id });
  } catch (error) {
    console.error("Payment checkout error:", error.message);
    res.status(500).json({ message: error.message || "Unable to start checkout." });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Service request not found." });
    if (![String(request.client), String(request.provider)].includes(String(req.user.userId)) && req.user.role !== "admin") {
      return res.status(403).json({ message: "You cannot view this payment." });
    }
    const payment = await Payment.findOne({ serviceRequest: request._id });
    if (!payment) return res.json({ status: "unpaid", payment: null });
    if (payment.status !== "paid" && payment.trackerToken && isConfigured()) {
      try {
        const report = await gateway().reporter.payments.fetch(payment.trackerToken);
        if (report?.data?.tracker?.state === "TRACKER_ENDED") await markPaymentPaid(payment, report?.data?.action?.token);
      } catch (error) {
        console.warn("Payment status refresh deferred:", error.message);
      }
    }
    const current = await Payment.findById(payment._id);
    res.json({ status: current.status, payment: current });
  } catch (error) {
    res.status(500).json({ message: "Unable to check payment status." });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const filter = req.user.role === "provider" ? { provider: req.user.userId } : { client: req.user.userId };
    const [payments, settlements] = await Promise.all([
      Payment.find(filter).populate("serviceRequest", "status message").sort({ createdAt: -1 }),
      Settlement.find(req.user.role === "provider" ? { provider: req.user.userId } : { provider: req.user.userId }).populate("serviceRequest", "status").sort({ createdAt: -1 }),
    ]);
    res.json({ payments, settlements });
  } catch (error) {
    res.status(500).json({ message: "Unable to load payment records." });
  }
};

exports.requestSettlement = async (req, res) => {
  try {
    if (req.user.role !== "provider") return res.status(403).json({ message: "Only providers can request settlement." });
    const { paymentId } = req.body;
    const payment = await Payment.findOne({ _id: paymentId, provider: req.user.userId, status: "paid" });
    if (!payment) return res.status(404).json({ message: "Paid provider balance not found." });
    const request = await ServiceRequest.findById(payment.serviceRequest);
    if (!request || request.status !== "completed") return res.status(400).json({ message: "Settlement is available after the service request is marked completed." });
    const existing = await Settlement.findOne({ payment: payment._id });
    if (existing) return res.status(409).json({ message: "A settlement request already exists for this payment." });
    const settlement = await Settlement.create({ provider: req.user.userId, serviceRequest: request._id, payment: payment._id, amount: payment.providerAmount });
    res.status(201).json({ message: "Settlement request submitted for admin processing.", settlement });
  } catch (error) {
    res.status(500).json({ message: "Unable to request settlement." });
  }
};

exports.getAdminSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find().populate("provider", "name email").populate("serviceRequest", "status").populate("payment", "grossAmount platformFee providerAmount status").sort({ createdAt: -1 });
    res.json({ settlements });
  } catch (error) {
    res.status(500).json({ message: "Unable to load settlements." });
  }
};

exports.updateSettlement = async (req, res) => {
  try {
    const { status, transferReference, adminNotes } = req.body;
    if (!['paid', 'rejected'].includes(status)) return res.status(400).json({ message: "Settlement status must be paid or rejected." });
    if (status === "paid" && !String(transferReference || "").trim()) return res.status(400).json({ message: "Enter the bank transfer reference before marking settlement as paid." });
    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) return res.status(404).json({ message: "Settlement not found." });
    if (settlement.status !== "requested") return res.status(409).json({ message: "This settlement has already been processed." });
    settlement.status = status;
    settlement.transferReference = String(transferReference || "").trim();
    settlement.adminNotes = String(adminNotes || "").trim();
    settlement.processedAt = new Date();
    await settlement.save();
    res.json({ message: status === "paid" ? "Settlement recorded. Ensure the bank transfer has actually been sent." : "Settlement request rejected.", settlement });
  } catch (error) {
    res.status(500).json({ message: "Unable to update settlement." });
  }
};

exports.safepayWebhook = async (req, res) => {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
    const signature = req.headers["x-sfpy-signature"];
    const secret = process.env.SAFEPAY_WEBHOOK_SECRET;
    if (!secret || !signature) return res.status(400).json({ message: "Webhook signature configuration is missing." });
    const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(String(signature));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(400).json({ message: "Invalid webhook signature." });
    const event = JSON.parse(rawBody.toString("utf8"));
    const tracker = event?.data?.tracker || event?.data?.tracker_token;
    if (!tracker) return res.status(200).json({ received: true, ignored: true });
    const payment = await Payment.findOne({ trackerToken: tracker });
    if (!payment) return res.status(200).json({ received: true, unmatched: true });
    if (event.type === "payment.succeeded" || event.type === "payment.completed") {
      await markPaymentPaid(payment, event.token || event.id);
    } else if (event.type === "payment.failed") {
      if (payment.status !== "paid") { payment.status = "failed"; await payment.save(); }
    }
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Safepay webhook error:", error.message);
    res.status(400).json({ message: "Invalid webhook payload." });
  }
};
