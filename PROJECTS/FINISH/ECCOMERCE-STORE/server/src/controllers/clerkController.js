import { Webhook } from "svix";
import User from "../models/User.js";
import { generateAccessToken } from "../utils/generateToken.js";
import ActivityLog from "../models/ActivityLog.js";

/**
 * Handle Clerk webhooks for user sync
 * @route POST /api/webhooks/clerk
 * @access Public (verified by webhook signature)
 */
export const handleClerkWebhook = async (req, res) => {
  try {
    // Get the headers and body
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error("CLERK_WEBHOOK_SECRET is not set");
    }

    // Get the Svix headers for verification
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({
        status: "error",
        message: "Error occurred -- no svix headers",
      });
    }

    // Get the body
    const payload = JSON.stringify(req.body);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    // Verify the webhook
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return res.status(400).json({
        status: "error",
        message: "Error verifying webhook",
      });
    }

    // Handle the webhook
    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook with ID ${id} and type ${eventType}`);
    console.log("Webhook body:", evt.data);

    // Handle different event types
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;
      case "user.updated":
        await handleUserUpdated(evt.data);
        break;
      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).json({
      status: "success",
      message: "Webhook received",
    });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Handle user.created event from Clerk
 */
const handleUserCreated = async (data) => {
  try {
    const {
      id: clerkUserId,
      email_addresses,
      first_name,
      last_name,
      image_url,
      external_accounts,
    } = data;

    // Get primary email
    const primaryEmail = email_addresses.find((email) => email.id === data.primary_email_address_id);
    const email = primaryEmail?.email_address;

    if (!email) {
      console.error("No email found for Clerk user");
      return;
    }

    // Check if user already exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // Link Clerk account to existing user
      user.clerkUserId = clerkUserId;
      user.authProvider = "google";
      
      // Get Google ID if available
      const googleAccount = external_accounts?.find((acc) => acc.provider === "google");
      if (googleAccount) {
        user.googleId = googleAccount.provider_user_id;
      }

      // Update avatar if not set
      if (!user.avatar && image_url) {
        user.avatar = image_url;
      }

      await user.save();

      console.log(`Linked Clerk account to existing user: ${email}`);
    } else {
      // Create new user
      const name = `${first_name || ""} ${last_name || ""}`.trim() || email.split("@")[0];
      
      // Get Google ID if available
      const googleAccount = external_accounts?.find((acc) => acc.provider === "google");
      const googleId = googleAccount?.provider_user_id;

      user = await User.create({
        name,
        email,
        clerkUserId,
        googleId,
        authProvider: "google",
        avatar: image_url || "",
        isEmailVerified: true, // Clerk verifies emails
        password: Math.random().toString(36).slice(-8), // Random password (won't be used)
      });

      console.log(`Created new user from Clerk: ${email}`);
    }

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "social_login",
      details: {
        provider: "google",
        clerkUserId,
      },
    });
  } catch (error) {
    console.error("Error handling user.created:", error);
  }
};

/**
 * Handle user.updated event from Clerk
 */
const handleUserUpdated = async (data) => {
  try {
    const {
      id: clerkUserId,
      email_addresses,
      first_name,
      last_name,
      image_url,
    } = data;

    // Find user by Clerk ID
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      console.error(`User not found for Clerk ID: ${clerkUserId}`);
      return;
    }

    // Update user data
    const name = `${first_name || ""} ${last_name || ""}`.trim();
    if (name) {
      user.name = name;
    }

    if (image_url) {
      user.avatar = image_url;
    }

    // Update email if changed
    const primaryEmail = email_addresses.find((email) => email.id === data.primary_email_address_id);
    if (primaryEmail && primaryEmail.email_address !== user.email) {
      user.email = primaryEmail.email_address;
    }

    await user.save();

    console.log(`Updated user from Clerk: ${user.email}`);
  } catch (error) {
    console.error("Error handling user.updated:", error);
  }
};

/**
 * Handle user.deleted event from Clerk
 */
const handleUserDeleted = async (data) => {
  try {
    const { id: clerkUserId } = data;

    // Find user by Clerk ID
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      console.error(`User not found for Clerk ID: ${clerkUserId}`);
      return;
    }

    // Just unlink Clerk account, don't delete user
    user.clerkUserId = undefined;
    user.googleId = undefined;
    await user.save();

    console.log(`Unlinked Clerk account for user: ${user.email}`);
  } catch (error) {
    console.error("Error handling user.deleted:", error);
  }
};

/**
 * Link Clerk account to existing user
 * @route POST /api/auth/clerk/link
 * @access Private
 */
export const linkClerkAccount = async (req, res) => {
  try {
    const { clerkUserId, googleId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if Clerk account is already linked to another user
    const existingUser = await User.findOne({ clerkUserId });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({
        status: "error",
        message: "This Google account is already linked to another user",
      });
    }

    // Link accounts
    user.clerkUserId = clerkUserId;
    user.googleId = googleId;
    user.authProvider = "google";
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "account_linked",
      details: {
        provider: "google",
        clerkUserId,
      },
      ipAddress: req.ip,
    });

    res.status(200).json({
      status: "success",
      message: "Google account linked successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          clerkUserId: user.clerkUserId,
        },
      },
    });
  } catch (error) {
    console.error("Link Clerk account error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Unlink Clerk account from user
 * @route POST /api/auth/clerk/unlink
 * @access Private
 */
export const unlinkClerkAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if user has a password set (can't unlink if no password)
    if (!user.password || user.password === "") {
      return res.status(400).json({
        status: "error",
        message: "Please set a password before unlinking your Google account",
      });
    }

    // Unlink accounts
    user.clerkUserId = undefined;
    user.googleId = undefined;
    user.authProvider = "local";
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: user._id,
      action: "account_unlinked",
      details: {
        provider: "google",
      },
      ipAddress: req.ip,
    });

    res.status(200).json({
      status: "success",
      message: "Google account unlinked successfully",
    });
  } catch (error) {
    console.error("Unlink Clerk account error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * Get Clerk account status
 * @route GET /api/auth/clerk/status
 * @access Private
 */
export const getClerkStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        isLinked: !!user.clerkUserId,
        clerkUserId: user.clerkUserId,
        googleId: user.googleId,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("Get Clerk status error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
