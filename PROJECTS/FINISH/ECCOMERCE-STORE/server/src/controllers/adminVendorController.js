import Vendor from "../models/Vendor.js";
import VendorPayout from "../models/VendorPayout.js";
import { sendEmail } from "../utils/sendEmail.js";

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private/Admin
export const getAllVendors = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { businessEmail: { $regex: search, $options: "i" } },
      ];
    }

    const vendors = await Vendor.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Vendor.countDocuments(query);

    res.status(200).json({
      status: "success",
      data: {
        vendors,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all vendors error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get vendors",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Approve vendor
// @route   PUT /api/admin/vendors/:id/approve
// @access  Private/Admin
export const approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate("user");

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor not found",
      });
    }

    vendor.status = "active";
    vendor.isVerified = true;
    await vendor.save();

    // Send approval email
    try {
      await sendEmail({
        to: vendor.businessEmail || vendor.user.email,
        subject: "Vendor Account Approved",
        html: `
          <h1>Congratulations!</h1>
          <p>Your vendor account has been approved.</p>
          <p>You can now start selling on our platform.</p>
          <p>Business Name: ${vendor.businessName}</p>
          <a href="${process.env.CLIENT_URL}/vendor/dashboard">Go to Dashboard</a>
        `,
        text: `Your vendor account has been approved. You can now start selling on our platform.`,
      });
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

    res.status(200).json({
      status: "success",
      message: "Vendor approved successfully",
      data: { vendor },
    });
  } catch (error) {
    console.error("Approve vendor error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to approve vendor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Suspend vendor
// @route   PUT /api/admin/vendors/:id/suspend
// @access  Private/Admin
export const suspendVendor = async (req, res) => {
  try {
    const { reason } = req.body;

    const vendor = await Vendor.findById(req.params.id).populate("user");

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor not found",
      });
    }

    vendor.status = "suspended";
    await vendor.save();

    // Send suspension email
    try {
      await sendEmail({
        to: vendor.businessEmail || vendor.user.email,
        subject: "Vendor Account Suspended",
        html: `
          <h1>Account Suspended</h1>
          <p>Your vendor account has been suspended.</p>
          ${reason ? `<p>Reason: ${reason}</p>` : ""}
          <p>Please contact support for more information.</p>
        `,
        text: `Your vendor account has been suspended. ${reason ? `Reason: ${reason}` : ""} Please contact support.`,
      });
    } catch (emailError) {
      console.error("Failed to send suspension email:", emailError);
    }

    res.status(200).json({
      status: "success",
      message: "Vendor suspended successfully",
      data: { vendor },
    });
  } catch (error) {
    console.error("Suspend vendor error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to suspend vendor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update vendor commission
// @route   PUT /api/admin/vendors/:id/commission
// @access  Private/Admin
export const updateCommission = async (req, res) => {
  try {
    const { commission } = req.body;

    if (commission < 0 || commission > 100) {
      return res.status(400).json({
        status: "error",
        message: "Commission must be between 0 and 100",
      });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        status: "error",
        message: "Vendor not found",
      });
    }

    vendor.commission = commission;
    await vendor.save();

    res.status(200).json({
      status: "success",
      message: "Commission updated successfully",
      data: { vendor },
    });
  } catch (error) {
    console.error("Update commission error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update commission",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Process vendor payouts
// @route   POST /api/admin/vendors/payouts/process
// @access  Private/Admin
export const processPayouts = async (req, res) => {
  try {
    const { payoutIds } = req.body;

    if (!payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Payout IDs are required",
      });
    }

    const payouts = await VendorPayout.find({
      _id: { $in: payoutIds },
      status: "pending",
    }).populate("vendor");

    if (payouts.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No pending payouts found",
      });
    }

    // Process each payout
    const processed = [];
    const failed = [];

    for (const payout of payouts) {
      try {
        // Here you would integrate with actual payment gateway
        // For now, we'll just mark as completed
        payout.status = "completed";
        payout.processedAt = new Date();
        payout.transactionId = `TXN-${Date.now()}-${payout._id}`;
        await payout.save();

        // Send confirmation email
        await sendEmail({
          to: payout.vendor.businessEmail,
          subject: "Payout Processed",
          html: `
            <h1>Payout Processed</h1>
            <p>Your payout of $${payout.amount} has been processed.</p>
            <p>Transaction ID: ${payout.transactionId}</p>
          `,
          text: `Your payout of $${payout.amount} has been processed. Transaction ID: ${payout.transactionId}`,
        });

        processed.push(payout._id);
      } catch (error) {
        console.error(`Failed to process payout ${payout._id}:`, error);
        payout.status = "failed";
        await payout.save();
        failed.push(payout._id);
      }
    }

    res.status(200).json({
      status: "success",
      message: `Processed ${processed.length} payouts, ${failed.length} failed`,
      data: {
        processed,
        failed,
      },
    });
  } catch (error) {
    console.error("Process payouts error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process payouts",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all payouts
// @route   GET /api/admin/vendors/payouts
// @access  Private/Admin
export const getAllPayouts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const payouts = await VendorPayout.find(query)
      .populate("vendor", "businessName businessEmail")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await VendorPayout.countDocuments(query);

    res.status(200).json({
      status: "success",
      data: {
        payouts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all payouts error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get payouts",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
