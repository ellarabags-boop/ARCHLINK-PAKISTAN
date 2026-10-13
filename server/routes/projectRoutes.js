const express = require("express");
const {
  getProjects,
  getMyProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { providerOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getProjects);
router.get("/my-projects", protect, providerOnly, getMyProjects);
router.get("/:id", getProjectById);
router.post("/", protect, providerOnly, createProject);
router.put("/:id", protect, providerOnly, updateProject);
router.delete("/:id", protect, providerOnly, deleteProject);

module.exports = router;
