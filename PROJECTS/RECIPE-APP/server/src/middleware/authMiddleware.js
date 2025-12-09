import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({
        message: "Not authorized to access this route - No token provided",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        console.log("❌ User not found for token");
        return res.status(401).json({
          message: "Not authorized - User not found",
        });
      }

      console.log("✅ Auth successful for user:", req.user.email);
      next();
    } catch (error) {
      console.log("❌ Token verification failed:", error.message);
      return res.status(401).json({
        message: "Not authorized - Invalid token",
        error: error.message,
      });
    }
  } catch (error) {
    console.log("❌ Server error in auth middleware:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
