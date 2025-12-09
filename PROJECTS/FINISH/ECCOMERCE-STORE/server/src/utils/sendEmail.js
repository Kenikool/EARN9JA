import nodemailer from "nodemailer";
import { emailTemplates } from "./emailTemplates.js";

// Create reusable transporter
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn("⚠️  Email not configured. Emails will be logged but not sent.");
    return null;
  }

  const port = parseInt(process.env.EMAIL_PORT) || 587;
  const isSecure = port === 465 || process.env.EMAIL_SECURE === 'true';

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: port,
    secure: isSecure, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Add timeout and retry options
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 15000, // 15 seconds
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
      minVersion: 'TLSv1.2'
    },
    debug: process.env.NODE_ENV === 'development', // Enable debug in dev
    logger: process.env.NODE_ENV === 'development' // Enable logging in dev
  });
};

// Send email with privacy preferences check
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  type = "general",
  userId = null,
}) => {
  try {
    // Check user preferences if userId provided
    if (userId) {
      const User = (await import("../models/User.js")).default;
      const user = await User.findById(userId);

      if (user && user.privacySettings) {
        // Check if marketing emails are disabled
        if (type === "marketing" && !user.privacySettings.marketingEmails) {
          console.log(`⏭️  Skipping marketing email to ${to} (user preference)`);
          return { success: true, skipped: true, reason: "user_preference" };
        }

        // Always send security alerts unless explicitly disabled
        if (type === "security" && user.privacySettings.securityAlerts === false) {
          console.log(`⏭️  Skipping security alert to ${to} (user preference)`);
          return { success: true, skipped: true, reason: "user_preference" };
        }
      }
    }

    const transporter = createTransporter();

    // If email is not configured, log and return success
    if (!transporter) {
      console.log(`📧 [DEV MODE] Email would be sent to: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Type: ${type}`);
      return { success: true, devMode: true };
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "E-Commerce Platform"}" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email error:", error.message);

    // Log email details for debugging
    console.log(`   Failed email to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Type: ${type}`);

    // Don't throw error, just return failure status
    // This prevents the server from crashing due to email issues
    return {
      success: false,
      error: error.message,
    };
  }
};

// Export email templates
export { emailTemplates };
