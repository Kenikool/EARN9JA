import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verify JWT token and authenticate user
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Not authorized. Please login to access this resource.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "User not found. Token is invalid.",
      });
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token. Please login again.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      status: "error",
      message: "Not authorized. Authentication failed.",
    });
  }
};

// Check if user is admin
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      status: "error",
      message: "Access denied. Admin privileges required.",
    });
  }
};

// Check if user is vendor
export const authorizeVendor = (req, res, next) => {
  if (req.user && (req.user.role === "vendor" || req.user.role === "admin")) {
    next();
  } else {
    return res.status(403).json({
      status: "error",
      message: "Access denied. Vendor privileges required.",
    });
  }
};

// Check if user is admin or vendor
export const authorizeAdminOrVendor = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "vendor")
  ) {
    next();
  } else {
    return res.status(403).json({
      status: "error",
      message: "Access denied. Admin or vendor privileges required.",
    });
  }
};

// Aliases for convenience
export const protect = authenticate;
export const admin = authorizeAdmin;
export const vendor = authorizeVendor;
export const adminOrVendor = authorizeAdminOrVendor;
