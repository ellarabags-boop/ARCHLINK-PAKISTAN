const ChatMessage = require("../models/ChatMessage");
const ServiceRequest = require("../models/ServiceRequest");

async function getParticipantRequest(requestId, user) {
  const request = await ServiceRequest.findById(requestId);
  if (!request) return { error: { status: 404, message: "Service request not found." } };
  const participant = [String(request.client), String(request.provider)].includes(String(user.userId));
  if (!participant) return { error: { status: 403, message: "You are not a participant in this conversation." } };
  if (request.status === "rejected") return { error: { status: 403, message: "Chat is unavailable for rejected requests." } };
  return { request };
}

exports.listConversations = async (req, res) => {
  try {
    const field = req.user.role === "provider" ? "provider" : "client";
    const requests = await ServiceRequest.find({ [field]: req.user.userId, status: { $ne: "rejected" } })
      .populate("service", "title")
      .populate("client", "name")
      .populate("provider", "name")
      .sort({ updatedAt: -1 });
    res.json({ conversations: requests });
  } catch (error) {
    res.status(500).json({ message: "Unable to load conversations." });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const result = await getParticipantRequest(req.params.requestId, req.user);
    if (result.error) return res.status(result.error.status).json({ message: result.error.message });
    const messages = await ChatMessage.find({ serviceRequest: req.params.requestId })
      .populate("sender", "name role")
      .sort({ createdAt: 1 }).limit(500);
    await ChatMessage.updateMany({ serviceRequest: req.params.requestId, sender: { $ne: req.user.userId }, readBy: { $ne: req.user.userId } }, { $addToSet: { readBy: req.user.userId } });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Unable to load chat messages." });
  }
};

exports.saveMessage = async (req, res) => {
  try {
    const result = await getParticipantRequest(req.params.requestId, req.user);
    if (result.error) return res.status(result.error.status).json({ message: result.error.message });
    const text = String(req.body.text || "").trim();
    if (!text || text.length > 3000) return res.status(400).json({ message: "Message must contain 1 to 3000 characters." });
    const message = await ChatMessage.create({ serviceRequest: req.params.requestId, sender: req.user.userId, text, readBy: [req.user.userId] });
    const populated = await ChatMessage.findById(message._id).populate("sender", "name role");
    req.app.get("io").to(`request:${req.params.requestId}`).emit("chat:new-message", populated);
    res.status(201).json({ message: populated });
  } catch (error) {
    res.status(500).json({ message: "Unable to send message." });
  }
};

exports.authorizeSocketRequest = getParticipantRequest;
