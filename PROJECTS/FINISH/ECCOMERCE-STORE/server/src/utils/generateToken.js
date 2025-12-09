import jwt from "jsonwebtoken";

// Generate JWT access token
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Generate JWT refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Generate email verification token
export const generateEmailToken = () => {
  return jwt.sign(
    { purpose: "email-verification" },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// Generate password reset token
export const generatePasswordResetToken = () => {
  return jwt.sign(
    { purpose: "password-reset" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};
