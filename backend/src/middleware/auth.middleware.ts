import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt.js";
import { User } from "../models/User.js";

interface JWTPayload {
  id: string;
  email: string;
  roles: string[];
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    console.log(
      "🔐 Auth middleware - Header:",
      authHeader?.substring(0, 30) + "..."
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No token provided or invalid format");
      res.status(401).json({
        success: false,
        error: "No token provided",
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as JWTPayload;

    console.log("✅ Token verified for user:", decoded.email);

    // Fetch full user document
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("❌ User not found");
      res.status(401).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("❌ Token expired");
      res.status(401).json({
        success: false,
        error: "Token expired",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      console.log("❌ Invalid token:", error.message);
      res.status(401).json({
        success: false,
        error: "Invalid token",
      });
      return;
    }

    console.log("❌ Authentication failed:", error);
    res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    const hasRole = roles.some((role) => req.user?.roles.includes(role as any));

    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
    return;
  }

  if (!req.user.roles.includes("admin")) {
    res.status(403).json({
      success: false,
      error: "Admin access required",
    });
    return;
  }

  next();
};
