const providerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (req.user.role !== "provider") {
    return res.status(403).json({
      message: "Only providers can perform this action",
    });
  }

  next();
};

module.exports = {
  providerOnly,
};