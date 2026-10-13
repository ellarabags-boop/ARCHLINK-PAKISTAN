const express = require("express");

const {
  getPortfolios,
  getMyPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} = require("../controllers/portfolioController");

const { protect } = require("../middleware/authMiddleware");
const { providerOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getPortfolios);

router.get(
  "/my-projects",
  protect,
  providerOnly,
  getMyPortfolios
);

router.get("/:id", getPortfolioById);

router.post(
  "/",
  protect,
  providerOnly,
  createPortfolio
);

router.put(
  "/:id",
  protect,
  providerOnly,
  updatePortfolio
);

router.delete(
  "/:id",
  protect,
  providerOnly,
  deletePortfolio
);

module.exports = router;