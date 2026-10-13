const Portfolio = require("../models/Portfolio");


// GET ALL PORTFOLIO PROJECTS
const getPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find()
      .populate(
        "provider",
        "name email city profileImage"
      )
      .sort({ createdAt: -1 });

    res.json(portfolios);
  } catch (error) {
    console.error(
      "Get portfolios error:",
      error
    );

    res.status(500).json({
      message: "Failed to load portfolio projects",
    });
  }
};


// GET MY PORTFOLIO PROJECTS
const getMyPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({
      provider: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(portfolios);
  } catch (error) {
    console.error(
      "Get my portfolios error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load your portfolio projects",
    });
  }
};


// GET SINGLE PORTFOLIO PROJECT
const getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(
      req.params.id
    ).populate(
      "provider",
      "name email city profileImage"
    );

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio project not found",
      });
    }

    res.json(portfolio);
  } catch (error) {
    console.error(
      "Get portfolio error:",
      error
    );

    res.status(500).json({
      message: "Failed to load portfolio project",
    });
  }
};


// CREATE PORTFOLIO PROJECT
const createPortfolio = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      city,
      image,
      completionYear,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !city
    ) {
      return res.status(400).json({
        message:
          "Title, description, category and city are required",
      });
    }

    const portfolio = await Portfolio.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      city: city.trim(),
      image: image?.trim() || "",
      completionYear,
      provider: req.user.userId,
    });

    const populatedPortfolio =
      await Portfolio.findById(portfolio._id)
        .populate(
          "provider",
          "name email city profileImage"
        );

    res.status(201).json({
      message:
        "Portfolio project created successfully",
      portfolio: populatedPortfolio,
    });
  } catch (error) {
    console.error(
      "Create portfolio error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create portfolio project",
      error: error.message,
    });
  }
};


// UPDATE PORTFOLIO PROJECT
const updatePortfolio = async (req, res) => {
  try {
    const portfolio =
      await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio project not found",
      });
    }

    if (
      portfolio.provider.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to edit this project",
      });
    }

    const {
      title,
      description,
      category,
      city,
      image,
      completionYear,
    } = req.body;

    portfolio.title =
      title?.trim() || portfolio.title;

    portfolio.description =
      description?.trim() ||
      portfolio.description;

    portfolio.category =
      category?.trim() ||
      portfolio.category;

    portfolio.city =
      city?.trim() || portfolio.city;

    portfolio.image =
      image?.trim() || portfolio.image;

    if (completionYear) {
      portfolio.completionYear =
        completionYear;
    }

    await portfolio.save();

    const updatedPortfolio =
      await Portfolio.findById(portfolio._id)
        .populate(
          "provider",
          "name email city profileImage"
        );

    res.json({
      message:
        "Portfolio project updated successfully",
      portfolio: updatedPortfolio,
    });
  } catch (error) {
    console.error(
      "Update portfolio error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update portfolio project",
    });
  }
};


// DELETE PORTFOLIO PROJECT
const deletePortfolio = async (req, res) => {
  try {
    const portfolio =
      await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({
        message: "Portfolio project not found",
      });
    }

    if (
      portfolio.provider.toString() !==
      req.user.userId
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to delete this project",
      });
    }

    await Portfolio.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Portfolio project deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete portfolio error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete portfolio project",
    });
  }
};


module.exports = {
  getPortfolios,
  getMyPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
};