const Project = require("../models/Project");

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("architect", "name email city profileImage")
      .sort({ createdAt: -1 });
    return res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({ message: "Failed to fetch projects" });
  }
};

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ architect: req.user.userId })
      .sort({ createdAt: -1 });
    return res.json(projects);
  } catch (error) {
    console.error("Get my projects error:", error);
    return res.status(500).json({ message: "Failed to fetch your projects" });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("architect", "name email city profileImage");
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json(project);
  } catch (error) {
    console.error("Get project error:", error);
    return res.status(400).json({ message: "Invalid project ID or request" });
  }
};

const createProject = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can publish projects" });
    }

    const { title, description, category, city, image = "", status = "available" } = req.body;
    if (!title || !description || !category || !city) {
      return res.status(400).json({ message: "Title, description, category, and city are required" });
    }

    const project = await Project.create({
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      city: String(city).trim(),
      image: typeof image === "string" ? image.trim() : "",
      status,
      architect: req.user.userId,
    });

    return res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(400).json({ message: "Failed to create project", error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.architect.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only update your own projects" });
    }

    const allowedFields = ["title", "description", "category", "city", "image", "status"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    }
    await project.save();
    const updatedProject = await Project.findById(project._id)
      .populate("architect", "name email city profileImage");
    return res.json({ message: "Project updated successfully", project: updatedProject });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(400).json({ message: "Failed to update project", error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.architect.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only delete your own projects" });
    }
    await project.deleteOne();
    return res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(400).json({ message: "Failed to delete project", error: error.message });
  }
};

module.exports = { getProjects, getMyProjects, getProjectById, createProject, updateProject, deleteProject };
