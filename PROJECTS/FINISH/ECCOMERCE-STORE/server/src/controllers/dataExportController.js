import {
  generateExportFile,
  getExportFile,
  deleteExportFile,
} from "../utils/dataExport.js";
import ActivityLog from "../models/ActivityLog.js";
import { sendEmail } from "../utils/sendEmail.js";

// @desc    Request data export
// @route   POST /api/auth/account/export-data
// @access  Private
export const requestDataExport = async (req, res) => {
  try {
    const userId = req.user._id;

    // Generate export file
    const exportInfo = await generateExportFile(userId);

    // Log activity
    await ActivityLog.create({
      user: userId,
      action: "data_export_requested",
      details: { filename: exportInfo.filename },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send email with download link
    const downloadLink = `${process.env.CLIENT_URL}/download-data?token=${exportInfo.token}`;
    
    await sendEmail({
      to: req.user.email,
      subject: "Your Data Export is Ready",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Data Export is Ready</h2>
          <p>Hi ${req.user.name},</p>
          <p>Your personal data export has been generated and is ready for download.</p>
          <p>
            <a href="${downloadLink}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Download Your Data
            </a>
          </p>
          <p><strong>Important:</strong> This link will expire in 7 days for security reasons.</p>
          <p>The export includes:</p>
          <ul>
            <li>Your profile information</li>
            <li>Order history</li>
            <li>Reviews and ratings</li>
            <li>Activity logs</li>
            <li>Login history</li>
            <li>Security settings</li>
          </ul>
          <p>If you didn't request this export, please contact our support team immediately.</p>
          <p>Best regards,<br>The Team</p>
        </div>
      `,
      text: `Hi ${req.user.name}, Your data export is ready. Download it here: ${downloadLink}. This link expires in 7 days.`,
    });

    res.status(200).json({
      status: "success",
      message: "Data export generated successfully. Check your email for the download link.",
      data: {
        expiresAt: exportInfo.expiresAt,
        size: exportInfo.size,
      },
    });
  } catch (error) {
    console.error("Request data export error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate data export",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Download data export
// @route   GET /api/auth/account/download-data
// @access  Private
export const downloadDataExport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Export token is required",
      });
    }

    // Get export file
    const exportFile = await getExportFile(token, userId);

    if (!exportFile) {
      return res.status(404).json({
        status: "error",
        message: "Export file not found or has expired",
      });
    }

    // Log download
    await ActivityLog.create({
      user: userId,
      action: "data_export_downloaded",
      details: { filename: exportFile.filename },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Send file
    res.download(exportFile.filepath, exportFile.filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).json({
            status: "error",
            message: "Failed to download file",
          });
        }
      }
    });
  } catch (error) {
    console.error("Download data export error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to download data export",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get export status
// @route   GET /api/auth/account/export-status
// @access  Private
export const getExportStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { token } = req.query;

    const exportFile = await getExportFile(token, userId);

    if (!exportFile) {
      return res.status(404).json({
        status: "success",
        data: {
          exists: false,
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        exists: true,
        filename: exportFile.filename,
        size: exportFile.size,
        createdAt: exportFile.createdAt,
      },
    });
  } catch (error) {
    console.error("Get export status error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get export status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default {
  requestDataExport,
  downloadDataExport,
  getExportStatus,
};
