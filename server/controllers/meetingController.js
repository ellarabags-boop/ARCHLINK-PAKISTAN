const MeetingRequest = require("../models/MeetingRequest");
const ServiceRequest = require("../models/ServiceRequest");
const Notification = require("../models/Notification");

const getMyMeetings = async (req, res) => {
  try {
    const filter = req.user.role === "provider"
      ? { provider: req.user.userId }
      : { client: req.user.userId };

    if (!["client", "provider"].includes(req.user.role)) {
      return res.status(403).json({ message: "Meeting access is restricted to clients and providers" });
    }

    const meetings = await MeetingRequest.find(filter)
      .populate({
        path: "serviceRequest",
        populate: { path: "service", select: "title category city price" },
      })
      .populate("client", "name email city")
      .populate("provider", "name email city")
      .sort({ createdAt: -1 });

    return res.json(meetings);
  } catch (error) {
    console.error("Get meetings error:", error);
    return res.status(500).json({ message: "Failed to load meeting requests" });
  }
};

const createMeeting = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can request meetings" });
    }

    const { serviceRequestId, proposedAt, mode, meetingDetails = "", message = "" } = req.body;
    if (!serviceRequestId || !proposedAt || !mode) {
      return res.status(400).json({ message: "Service request, proposed time, and meeting mode are required" });
    }

    const meetingDate = new Date(proposedAt);
    if (Number.isNaN(meetingDate.getTime()) || meetingDate <= new Date()) {
      return res.status(400).json({ message: "Choose a valid future meeting time" });
    }

    if (!["online", "public_place", "provider_office"].includes(mode)) {
      return res.status(400).json({ message: "Invalid meeting mode" });
    }

    const serviceRequest = await ServiceRequest.findOne({
      _id: serviceRequestId,
      client: req.user.userId,
      status: { $in: ["accepted", "completed"] },
    });

    if (!serviceRequest) {
      return res.status(404).json({ message: "An accepted service request was not found" });
    }

    const existingPending = await MeetingRequest.findOne({
      serviceRequest: serviceRequest._id,
      status: "pending",
    });

    if (existingPending) {
      return res.status(409).json({ message: "A pending meeting request already exists for this service request" });
    }

    const meeting = await MeetingRequest.create({
      serviceRequest: serviceRequest._id,
      client: serviceRequest.client,
      provider: serviceRequest.provider,
      proposedAt: meetingDate,
      mode,
      meetingDetails: String(meetingDetails).trim().slice(0, 250),
      message: String(message).trim().slice(0, 500),
    });

    try {
      await Notification.create({
        recipient: serviceRequest.provider,
        title: "New Meeting Request",
        message: "A client has proposed a meeting for an accepted service request.",
        type: "general",
        relatedId: meeting._id,
      });
    } catch (notificationError) {
      console.error("Meeting notification failed:", notificationError.message);
    }

    return res.status(201).json({ message: "Meeting request submitted successfully", meeting });
  } catch (error) {
    console.error("Create meeting error:", error);
    return res.status(500).json({ message: "Failed to create meeting request" });
  }
};

const updateMeetingStatus = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can update meeting requests" });
    }

    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be accepted or rejected" });
    }

    const meeting = await MeetingRequest.findOne({
      _id: req.params.id,
      provider: req.user.userId,
      status: "pending",
    });

    if (!meeting) {
      return res.status(404).json({ message: "Pending meeting request not found" });
    }

    meeting.status = status;
    await meeting.save();

    try {
      await Notification.create({
        recipient: meeting.client,
        title: status === "accepted" ? "Meeting Confirmed" : "Meeting Request Declined",
        message: status === "accepted"
          ? "The provider accepted your proposed meeting time. Review the meeting details in ArchLink."
          : "The provider declined your proposed meeting time. You can submit a new proposal.",
        type: "general",
        relatedId: meeting._id,
      });
    } catch (notificationError) {
      console.error("Meeting status notification failed:", notificationError.message);
    }

    return res.json({ message: "Meeting status updated successfully", meeting });
  } catch (error) {
    console.error("Update meeting status error:", error);
    return res.status(500).json({ message: "Failed to update meeting status" });
  }
};

const cancelMeeting = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only the requesting client can cancel a meeting" });
    }

    const meeting = await MeetingRequest.findOneAndUpdate(
      { _id: req.params.id, client: req.user.userId, status: "pending" },
      { status: "cancelled" },
      { new: true, runValidators: true }
    );

    if (!meeting) {
      return res.status(404).json({ message: "Pending meeting request not found" });
    }

    return res.json({ message: "Meeting request cancelled", meeting });
  } catch (error) {
    console.error("Cancel meeting error:", error);
    return res.status(500).json({ message: "Failed to cancel meeting request" });
  }
};

module.exports = { getMyMeetings, createMeeting, updateMeetingStatus, cancelMeeting };
