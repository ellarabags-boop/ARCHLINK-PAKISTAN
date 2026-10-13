
const Service = require("../models/Service");

// ==========================================
// 1. GET ALL SERVICES
// ==========================================
const getServices = async (req, res) => {
  try {
    const { search = "", city = "", category = "" } = req.query;
    const filter = {};

    if (search.trim()) {
      const safeSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (city.trim()) {
      const safeCity = city
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.city = {
        $regex: `^${safeCity}$`,
        $options: "i",
      };
    }

    if (category.trim()) {
      const safeCategory = category
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.category = {
        $regex: `^${safeCategory}$`,
        $options: "i",
      };
    }

    const services = await Service.find(filter)
      .populate("provider", "name email city")
      .sort({ createdAt: -1 });

    return res.json(services);
  } catch (error) {
    console.error("Get services error:", error);

    return res.status(500).json({
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

// ==========================================
// 2. GET SINGLE SERVICE
// ==========================================
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("provider", "name email city");

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    return res.json(service);
  } catch (error) {
    console.error("Get service error:", error);

    return res.status(500).json({
      message: "Failed to fetch service",
      error: error.message,
    });
  }
};

// ==========================================
// 3. GET MY SERVICES
// ==========================================
const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({
      provider: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.json(services);
  } catch (error) {
    console.error("Get my services error:", error);

    return res.status(500).json({
      message: "Failed to fetch your services",
      error: error.message,
    });
  }
};

// ==========================================
// 4. CREATE SERVICE
// ==========================================
const createService = async (req, res) => {
  try {
    const serviceData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      city: req.body.city,
      price: req.body.price,
      image: req.body.image || "",
      provider: req.user.userId,
    };

    const service = await Service.create(serviceData);

    return res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);

    return res.status(400).json({
      message: "Failed to create service",
      error: error.message,
    });
  }
};

// ==========================================
// 5. UPDATE SERVICE
// ==========================================
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    if (service.provider.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only update your own services",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "city",
      "price",
      "image",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).populate("provider", "name email city");

    return res.json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Update service error:", error);

    return res.status(400).json({
      message: "Failed to update service",
      error: error.message,
    });
  }
};

// ==========================================
// 6. DELETE SERVICE
// ==========================================
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    if (service.provider.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only delete your own services",
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    return res.json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    return res.status(500).json({
      message: "Failed to delete service",
      error: error.message,
    });
  }
};

module.exports = {
  getServices,
  getServiceById,
  getMyServices,
  createService,
  updateService,
  deleteService,
};
