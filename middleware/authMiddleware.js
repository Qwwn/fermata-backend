const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const admin = async (req, res, next) => {
  try {
    if (
      !req.user ||
      !req.user.user_type ||
      req.user.user_type.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized as admin" });
    }
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({ message: "Admin check failed" });
  }
};

const teacher = async (req, res, next) => {
  try {
    if (
      !req.user ||
      !req.user.user_type ||
      !["admin", "teacher"].includes(req.user.user_type.role)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized as teacher or admin" });
    }
    next();
  } catch (error) {
    console.error("Teacher middleware error:", error);
    return res.status(500).json({ message: "Teacher check failed" });
  }
};

module.exports = { protect, admin, teacher };
