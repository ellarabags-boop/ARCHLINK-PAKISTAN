
const User = require("../models/User");
const Service = require("../models/Service");
const Portfolio = require("../models/Portfolio");
const ServiceRequest = require("../models/ServiceRequest");
const Review = require("../models/Review");
const Notification = require("../models/Notification");

const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      totalClients,
      totalServices,
      totalPortfolios,
      totalRequests,
      pendingRequests,
      totalReviews,
      pendingVerifications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "provider" }),
      User.countDocuments({ role: "client" }),
      Service.countDocuments(),
      Portfolio.countDocuments(),
      ServiceRequest.countDocuments(),
      ServiceRequest.countDocuments({ status: "pending" }),
      Review.countDocuments(),
      User.countDocuments({ role: "provider", verificationStatus: "pending" }),
    ]);

    return res.json({
      stats: {
        totalUsers,
        totalProviders,
        totalClients,
        totalServices,
        totalPortfolios,
        totalRequests,
        pendingRequests,
        totalReviews,
        pendingVerifications,
      },
    });
  } catch (error) {
    console.error("Admin statistics error:", error);

    return res.status(500).json({
      message: "Failed to load administrator statistics",
    });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role city verificationStatus createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({ users });
  } catch (error) {
    console.error("Admin users error:", error);

    return res.status(500).json({
      message: "Failed to load users",
    });
  }
};


const getPendingVerifications = async (req, res) => {
  try {
    const providers = await User.find({
      role: "provider",
      verificationStatus: "pending",
    })
      .select("name email city verificationAuthority registrationNumber verificationStatus createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ providers });
  } catch (error) {
    console.error("Pending verification list error:", error);
    return res.status(500).json({ message: "Failed to load verification requests" });
  }
};

const updateProviderVerification = async (req, res) => {
  try {
    const { status, notes = "" } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }

    const provider = await User.findOneAndUpdate(
      { _id: req.params.id, role: "provider" },
      { verificationStatus: status, verificationNotes: String(notes).trim().slice(0, 500) },
      { new: true, runValidators: true }
    ).select("name email verificationStatus verificationNotes");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    try {
      await Notification.create({
        recipient: provider._id,
        title: status === "approved" ? "Verification Approved" : "Verification Update",
        message: status === "approved"
          ? "Your provider verification has been approved by ArchLink administration."
          : `Your provider verification was not approved. ${provider.verificationNotes || "Please review your details and submit them again."}`,
        type: "general",
        relatedId: provider._id,
      });
    } catch (notificationError) {
      console.error("Verification notification failed:", notificationError.message);
    }

    return res.json({ message: `Provider verification ${status}`, provider });
  } catch (error) {
    console.error("Update provider verification error:", error);
    return res.status(500).json({ message: "Failed to update provider verification" });
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
  getPendingVerifications,
  updateProviderVerification,
};
