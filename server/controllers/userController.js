const User = require("../models/User");

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role city profileImage bio verificationStatus createdAt");
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get single user
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email role city profileImage bio verificationStatus createdAt");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

const getProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: "provider" })
      .select("name city profileImage bio verificationStatus createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(providers);
  } catch (error) {
    console.error("Get providers error:", error);
    return res.status(500).json({
      message: "Failed to load providers",
    });
  }
};



const getMyVerification = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can access verification details" });
    }

    const provider = await User.findOne({ _id: req.user.userId, role: "provider" })
      .select("verificationAuthority registrationNumber verificationStatus verificationNotes");

    if (!provider) {
      return res.status(404).json({ message: "Provider account not found" });
    }

    return res.json(provider);
  } catch (error) {
    console.error("Get own verification error:", error);
    return res.status(500).json({ message: "Failed to load verification details" });
  }
};

const submitProviderVerification = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can submit verification details" });
    }

    const authority = typeof req.body.authority === "string" ? req.body.authority.trim() : "";
    const registrationNumber = typeof req.body.registrationNumber === "string" ? req.body.registrationNumber.trim() : "";

    if (!authority || !registrationNumber) {
      return res.status(400).json({ message: "Authority and registration number are required" });
    }

    const provider = await User.findOneAndUpdate(
      { _id: req.user.userId, role: "provider" },
      {
        verificationAuthority: authority,
        registrationNumber,
        verificationStatus: "pending",
        verificationNotes: "",
      },
      { new: true, runValidators: true }
    ).select("name email city verificationAuthority registrationNumber verificationStatus verificationNotes");

    if (!provider) {
      return res.status(404).json({ message: "Provider account not found" });
    }

    return res.json({ message: "Verification details submitted for review", provider });
  } catch (error) {
    console.error("Submit provider verification error:", error);
    return res.status(500).json({ message: "Failed to submit verification details" });
  }
};

const getProviderProfile = async (req, res) => {
  try {
    const provider = await User.findOne({
      _id: req.params.id,
      role: "provider",
    }).select("name email city profileImage bio verificationStatus createdAt");

    if (!provider) {
      return res.status(404).json({
        message: "Provider not found",
      });
    }

    res.json(provider);
  } catch (error) {
    console.error("Get provider profile error:", error);

    res.status(500).json({
      message: "Failed to load provider profile",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  getProviderProfile,
  getProviders,
  submitProviderVerification,
  getMyVerification,
};