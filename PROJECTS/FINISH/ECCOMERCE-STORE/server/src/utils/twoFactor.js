import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Generate a TOTP secret for 2FA
 * @param {string} userEmail - User's email
 * @returns {Object} Secret object with base32 and otpauth_url
 */
export const generateTOTPSecret = (userEmail) => {
  const secret = speakeasy.generateSecret({
    name: `E-Commerce (${userEmail})`,
    issuer: "E-Commerce Platform",
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
  };
};

/**
 * Generate QR code image from otpauth URL
 * @param {string} otpauth_url - The otpauth URL
 * @returns {Promise<string>} Base64 encoded QR code image
 */
export const generateQRCode = async (otpauth_url) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauth_url);
    return qrCodeDataURL;
  } catch (error) {
    console.error("QR Code generation error:", error);
    throw new Error("Failed to generate QR code");
  }
};

/**
 * Verify TOTP code
 * @param {string} token - The 6-digit code from user
 * @param {string} secret - The user's TOTP secret
 * @returns {boolean} True if valid
 */
export const verifyTOTP = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2, // Allow 2 time steps before/after for clock drift
  });
};

/**
 * Generate backup codes for 2FA recovery
 * @param {number} count - Number of codes to generate (default 10)
 * @returns {Promise<Object>} Object with plain codes and hashed codes
 */
export const generateBackupCodes = async (count = 10) => {
  const codes = [];
  const hashedCodes = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(code);

    // Hash the code for storage
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(code, salt);
    hashedCodes.push(hashedCode);
  }

  return {
    plainCodes: codes,
    hashedCodes,
  };
};

/**
 * Verify a backup code
 * @param {string} code - The backup code from user
 * @param {Array<string>} hashedCodes - Array of hashed backup codes
 * @returns {Promise<Object>} Object with isValid and matchedIndex
 */
export const verifyBackupCode = async (code, hashedCodes) => {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isMatch = await bcrypt.compare(code.toUpperCase(), hashedCodes[i]);
    if (isMatch) {
      return {
        isValid: true,
        matchedIndex: i,
      };
    }
  }

  return {
    isValid: false,
    matchedIndex: -1,
  };
};

/**
 * Generate a 6-digit OTP for email/SMS
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Get encryption key with proper validation
 * @returns {Buffer} 32-byte encryption key
 * @throws {Error} If encryption key is not properly configured
 */
const getEncryptionKey = () => {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  
  if (!encryptionKey) {
    throw new Error(
      "ENCRYPTION_KEY environment variable is required for 2FA encryption. " +
      "Generate one using: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }

  // Ensure key is exactly 32 bytes for AES-256
  if (encryptionKey.length !== 64) { // 32 bytes = 64 hex characters
    throw new Error(
      "ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters). " +
      "Current length: " + encryptionKey.length
    );
  }

  return Buffer.from(encryptionKey, "hex");
};

/**
 * Encrypt sensitive data (like 2FA secret)
 * Uses AES-256-GCM for authenticated encryption
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text with format: iv:authTag:encrypted
 * @throws {Error} If encryption fails
 */
export const encrypt = (text) => {
  try {
    const algorithm = "aes-256-gcm";
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get authentication tag for GCM mode
    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encrypted
    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data: " + error.message);
  }
};

/**
 * Decrypt sensitive data
 * Uses AES-256-GCM for authenticated decryption
 * @param {string} encryptedText - Encrypted text with format: iv:authTag:encrypted
 * @returns {string} Decrypted text
 * @throws {Error} If decryption fails or data is tampered
 */
export const decrypt = (encryptedText) => {
  try {
    const algorithm = "aes-256-gcm";
    const key = getEncryptionKey();

    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data. Data may be corrupted or tampered with.");
  }
};
