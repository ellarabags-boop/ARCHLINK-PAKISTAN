const ServiceRequest = require("../models/ServiceRequest");
const Service = require("../models/Service");
const Notification = require("../models/Notification");

// ==========================================
// CREATE SERVICE REQUEST
// ==========================================
const createServiceRequest = async (req, res) => {
  try {
    const { serviceId, message } = req.body;

    if (req.user.role !== "client") {
      return res.status(403).json({
        message: "Only clients can submit service requests",
      });
    }

    if (!serviceId || !message) {
      return res.status(400).json({
        message: "Service and message are required",
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    // Providers cannot request their own services
    if (service.provider.toString() === req.user.userId) {
      return res.status(400).json({
        message: "You cannot request your own service",
      });
    }

    const configuredRate = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 10);
    const commissionPercent = Number.isFinite(configuredRate) && configuredRate >= 0 && configuredRate <= 100
      ? configuredRate
      : 10;
    const servicePrice = Number(service.price || 0);
    const platformFee = Number((servicePrice * commissionPercent / 100).toFixed(2));
    const providerAmount = Number((servicePrice - platformFee).toFixed(2));

    const request = await ServiceRequest.create({
      service: service._id,
      client: req.user.userId,
      provider: service.provider,
      message,
      commissionPercent,
      platformFee,
      providerAmount,
    });

   // Create notification for the service provider
try {
  await Notification.create({
    recipient: service.provider,
    title: "New Service Request",
    message: `A client has requested your "${service.title}" service.`,
    type: "service_request",
    relatedId: request._id,
  });
} catch (notificationError) {
  
  console.error(
    "Notification creation failed:",
    notificationError.message
  );
}

    const populatedRequest = await ServiceRequest.findById(
      request._id
    )
      .populate("service", "title category city price")
      .populate("client", "name email city")
      .populate("provider", "name email city");

    res.status(201).json({
      message: "Service request sent successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create service request",
      error: error.message,
    });
  }
};


// ==========================================
// GET PROVIDER REQUESTS
// ==========================================
const getProviderRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      provider: req.user.userId,
    })
      .populate("service", "title category city price")
      .populate("client", "name email city phone")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch provider requests",
      error: error.message,
    });
  }
};


// ==========================================
// GET CLIENT REQUESTS
// ==========================================
const getClientRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      client: req.user.userId,
    })
      .populate("service", "title category city price")
      .populate("provider", "name email city")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your requests",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE REQUEST STATUS
// ==========================================
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "accepted",
      "rejected",
      "completed",
    ];
   
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const request = await ServiceRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    // Only provider who received the request
    // can change its status
    if (
      request.provider.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message: "You can only manage your own requests",
      });
    }

    request.status = status;

    await request.save();
  // Notify the client when the provider accepts or rejects
try {
  if (
    request.status === "accepted" ||
    request.status === "rejected"
  ) {
    await Notification.create({
      recipient: request.client,
      title:
        request.status === "accepted"
          ? "Service Request Accepted"
          : "Service Request Rejected",
      message:
        request.status === "accepted"
          ? "The provider has accepted your service request."
          : "The provider has rejected your service request.",
      type:
        request.status === "accepted"
          ? "request_accepted"
          : "request_rejected",
      relatedId: request._id,
    });
  }
} catch (notificationError) {
  console.error(
    "Status notification creation failed:",
    notificationError.message
  );
}
    const updatedRequest =
      await ServiceRequest.findById(request._id)
        .populate("service", "title category city price")
        .populate("client", "name email city phone")
        .populate("provider", "name email city");

    res.json({
      message: "Request status updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update request status",
      error: error.message,
    });
  }
};


module.exports = {
  createServiceRequest,
  getProviderRequests,
  getClientRequests,
  updateRequestStatus,
};