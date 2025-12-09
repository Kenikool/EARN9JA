import bcrypt from "bcryptjs";
import User from "../models/User.js";
import LoginAttempt from "../models/LoginAttempt.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateEmailToken,
  generatePasswordResetToken,
} from "../utils/generateToken.js";
import { sendEmail, emailTemplates } from "../utils/sendEmail.js";
import {
  isAccountLocked,
  getRemainingLockoutTime,
  incrementFailedAttempts,
  resetFailedAttempts,
} from "../utils/accountSecurity.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, adminCode, isEmailVerified, referralCode } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide name, email, and password",
      });
    }

    // Check if registering as admin
    const isAdminRegistration = role === "admin" && adminCode;
    
    // Verify admin code if admin registration
    if (isAdminRegistration) {
      const ADMIN_REGISTRATION_CODE = process.env.ADMIN_REGISTRATION_CODE || "ADMIN2024";
      if (adminCode !== ADMIN_REGISTRATION_CODE) {
        return res.status(403).json({
          status: "error",
          message: "Invalid admin registration code",
        });
      }

      // Limit to 2 super-admins via registration
      const MAX_SUPER_ADMINS = 2;
      const adminCount = await User.countDocuments({ role: "admin" });
      
      if (adminCount >= MAX_SUPER_ADMINS) {
        return res.status(403).json({
          status: "error",
          message: `Maximum of ${MAX_SUPER_ADMINS} super-admins allowed via registration. Contact an existing admin to be promoted.`,
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token (only if not admin)
    const emailVerificationToken = isAdminRegistration ? null : generateEmailToken();

    // Validate email template exists before creating user
    if (!isAdminRegistration) {
      if (typeof emailTemplates.emailVerification !== 'function') {
        return res.status(500).json({
          status: "error",
          message: "Email system is not configured properly. Please contact support.",
        });
      }
    }

    let user = null;
    let emailSent = false;

    try {
      // Create user
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: isAdminRegistration ? "admin" : "user",
        isEmailVerified: isAdminRegistration ? true : false, // Auto-verify admins
        emailVerificationToken: isAdminRegistration ? null : emailVerificationToken,
        emailVerificationExpires: isAdminRegistration ? null : Date.now() + 24 * 60 * 60 * 1000,
      });

      // For non-admin users, send verification email BEFORE proceeding
      if (!isAdminRegistration) {
        try {
          const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;
          const emailContent = emailTemplates.emailVerification(
            user.name,
            verificationLink
          );
          
          // Send email synchronously - if this fails, we rollback
          await sendEmail({
            to: user.email,
            ...emailContent,
          });
          
          emailSent = true;
          console.log(`Verification email sent successfully to ${user.email}`);
        } catch (emailError) {
          console.error("Failed to send verification email:", emailError);
          // Delete the user since email failed
          await User.deleteOne({ _id: user._id });
          
          return res.status(500).json({
            status: "error",
            message: "Failed to send verification email. Please try again or contact support if the problem persists.",
            error: process.env.NODE_ENV === "development" ? emailError.message : undefined,
          });
        }
      }

      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Handle referral code if provided (only after successful email)
      if (referralCode && !isAdminRegistration) {
        try {
          console.log(`Processing referral code: ${referralCode} for user: ${user.email}`);
          
          const Referral = (await import('../models/Referral.js')).default;
          const LoyaltyPoints = (await import('../models/LoyaltyPoints.js')).default;

          const referral = await Referral.findOne({ code: referralCode, referred: null });

          if (!referral) {
            console.log(`Referral code ${referralCode} not found or already used`);
          } else if (referral.referrer.toString() === user._id.toString()) {
            console.log(`User cannot use their own referral code`);
          } else {
            console.log(`Valid referral found. Referrer: ${referral.referrer}`);
            
            // Update referral
            referral.referred = user._id;
            referral.status = 'completed';
            referral.reward = 100;
            await referral.save();
            console.log(`Referral record updated`);

            // Award points to referrer
            let referrerPoints = await LoyaltyPoints.findOne({ user: referral.referrer });
            if (!referrerPoints) {
              referrerPoints = await LoyaltyPoints.create({ user: referral.referrer });
            }
            referrerPoints.addPoints(100, 'Referral reward');
            await referrerPoints.save();
            console.log(`Awarded 100 points to referrer`);

            // Award points to new user
            let userPoints = await LoyaltyPoints.findOne({ user: user._id });
            if (!userPoints) {
              userPoints = await LoyaltyPoints.create({ user: user._id });
              console.log(`Created new loyalty points account for new user`);
            }
            userPoints.addPoints(50, 'Sign up bonus via referral');
            await userPoints.save();
            console.log(`Awarded 50 points to new user ${user.email}`);
          }
        } catch (referralError) {
          console.error('Referral processing error:', referralError);
          // Don't fail registration due to referral issues
        }
      }

      res.status(201).json({
        status: "success",
        message: isAdminRegistration 
          ? "Admin account created successfully. You can now login."
          : "Registration successful. Please check your email for verification instructions.",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken,
          refreshToken,
          emailSent: isAdminRegistration ? false : emailSent,
        },
      });
    } catch (innerError) {
      // If anything fails after user creation, delete the user
      if (user && user._id) {
        try {
          await User.deleteOne({ _id: user._id });
          console.log(`Rolled back user creation for ${user.email} due to error`);
        } catch (deleteError) {
          console.error("Failed to rollback user creation:", deleteError);
        }
      }
      throw innerError; // Re-throw to outer catch
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      status: "error",
      message: "Registration failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide email and password",
      });
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      // Log failed attempt even if user doesn't exist (for security monitoring)
      await LoginAttempt.create({
        email: email.toLowerCase(),
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        success: false,
        failureReason: "Invalid credentials",
      });

      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Check if account is locked
    if (isAccountLocked(user)) {
      const remainingMinutes = getRemainingLockoutTime(user);

      // Log failed attempt
      await LoginAttempt.create({
        user: user._id,
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        success: false,
        failureReason: "Account locked",
      });

      return res.status(423).json({
        status: "error",
        message: `Account is locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minutes.`,
        data: {
          locked: true,
          remainingMinutes,
        },
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      await incrementFailedAttempts(user);

      // Log failed attempt
      await LoginAttempt.create({
        user: user._id,
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        success: false,
        failureReason: "Invalid password",
      });

      // Check if account is now locked
      if (isAccountLocked(user)) {
        const remainingMinutes = getRemainingLockoutTime(user);

        // Send lockout email (non-blocking)
        sendEmail({
          to: user.email,
          subject: "Account Locked - Security Alert",
          html: `<p>Hi ${user.name},</p><p>Your account has been locked for 30 minutes due to multiple failed login attempts.</p><p>If this wasn't you, please secure your account immediately.</p>`,
          text: `Hi ${user.name}, Your account has been locked for 30 minutes due to multiple failed login attempts.`,
        }).catch(error => {
          console.error("Failed to send lockout email:", error);
        });

        return res.status(423).json({
          status: "error",
          message: `Account locked due to multiple failed attempts. Please try again in ${remainingMinutes} minutes.`,
          data: {
            locked: true,
            remainingMinutes,
          },
        });
      }

      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
        data: {
          attemptsRemaining: 5 - user.failedLoginAttempts,
        },
      });
    }

    // Reset failed attempts on successful password verification
    await resetFailedAttempts(user);

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: "error",
        message: "Please verify your email before logging in. Check your inbox for the verification link.",
      });
    }

    // Check for password expiry or force password change
    const { isPasswordExpired, getDaysUntilExpiry } = await import("../utils/passwordSecurity.js");
    
    if (user.forcePasswordChange) {
      return res.status(403).json({
        status: "error",
        message: "You must change your password before logging in",
        code: "PASSWORD_CHANGE_REQUIRED",
        data: {
          requiresPasswordChange: true,
          userId: user._id,
        },
      });
    }

    if (isPasswordExpired(user)) {
      return res.status(403).json({
        status: "error",
        message: "Your password has expired. Please change your password to continue.",
        code: "PASSWORD_EXPIRED",
        data: {
          requiresPasswordChange: true,
          userId: user._id,
        },
      });
    }

    // Warn if password is expiring soon
    const daysUntilExpiry = getDaysUntilExpiry(user);
    let passwordExpiryWarning = null;
    if (daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 7) {
      passwordExpiryWarning = `Your password will expire in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}. Please change it soon.`;
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        status: "success",
        message: "2FA required",
        data: {
          requires2FA: true,
          userId: user._id,
          twoFactorMethod: user.twoFactorMethod,
          passwordExpiryWarning,
        },
      });
    }

    // Log successful login attempt
    await LoginAttempt.create({
      user: user._id,
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      success: true,
      twoFactorPassed: user.twoFactorEnabled ? false : true, // Will be updated after 2FA
    });

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Check device trust and detect suspicious activity
    const { checkTrustedDevice, detectSuspiciousDevice, sendDeviceTrustNotification, updateDeviceLastSeen } = await import("../utils/deviceTrust.js");
    
    const trustedDevice = await checkTrustedDevice(user._id, req);
    const suspicionAnalysis = await detectSuspiciousDevice(user._id, req);
    
    // Send suspicious activity notification
    if (suspicionAnalysis.isSuspicious && !trustedDevice) {
      await sendDeviceTrustNotification(user, {
        ...suspicionAnalysis.deviceInfo,
        location: suspicionAnalysis.location,
      }, "suspicious");
    }
    
    // Update device last seen if trusted
    if (trustedDevice) {
      await updateDeviceLastSeen(user._id, req);
    }

    // Create session record
    const { createSession } = await import("../utils/sessionManager.js");
    const session = await createSession(user, req, accessToken, refreshToken);
    
    // Update session trust status
    if (trustedDevice) {
      session.isTrusted = true;
      await session.save();
    }

    res.status(200).json({
      status: "success",
      message: "Login successful",
      ...(passwordExpiryWarning && { warning: passwordExpiryWarning }),
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Login failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          addresses: user.addresses,
          wishlist: user.wishlist,
          isEmailVerified: user.isEmailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Please provide current and new password",
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to change password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Please provide email address",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "No user found with this email address",
      });
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    // Send reset email (non-blocking)
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const emailContent = emailTemplates.passwordReset(user.name, resetLink);
    sendEmail({
      to: user.email,
      ...emailContent,
    }).catch(error => {
      console.error("Failed to send password reset email:", error);
    });

    res.status(200).json({
      status: "success",
      message: "If an account with that email exists, we've sent a password reset link.",
      data: {
        emailSent: true, // Indicate that email sending was attempted
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide new password",
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password reset successful. You can now login.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to reset password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: "error",
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        status: "error",
        message: "Invalid or expired refresh token",
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(decoded.id);

    res.status(200).json({
      status: "success",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to refresh token",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    console.log(`Email verification attempt with token: ${token?.substring(0, 10)}...`);

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Verification token is required",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log(`No user found with token or token expired`);
      
      // Check if user exists but already verified
      const verifiedUser = await User.findOne({ emailVerificationToken: token });
      if (!verifiedUser) {
        // Check if there's a user with this email that's already verified
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired verification token. The link may have already been used or has expired.",
        });
      }
      
      // User exists but token expired
      return res.status(400).json({
        status: "error",
        message: "Verification token has expired. Please request a new verification email.",
      });
    }

    console.log(`Verifying email for user: ${user.email}`);

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    console.log(`Email verified successfully for: ${user.email}`);

    // Send welcome email after successful verification (non-blocking)
    const welcomeContent = emailTemplates.welcome(user);
    sendEmail({
      to: user.email,
      ...welcomeContent,
    }).catch(error => {
      console.error("Failed to send welcome email:", error);
    });

    res.status(200).json({
      status: "success",
      message: "Email verified successfully! You can now login.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to verify email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "No user found with this email address",
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        status: "error",
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const emailVerificationToken = generateEmailToken();
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email (non-blocking)
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;
    const emailContent = emailTemplates.emailVerification(
      user.name,
      verificationLink
    );
    sendEmail({
      to: user.email,
      ...emailContent,
    }).catch(error => {
      console.error("Failed to send verification email:", error);
    });

    res.status(200).json({
      status: "success",
      message: "Verification email sent successfully. Please check your inbox.",
      data: {
        emailSent: true, // Indicate that email sending was attempted
      },
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to resend verification email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update user preferences (currency, language)
// @route   PUT /api/auth/preferences
// @access  Private
export const updatePreferences = async (req, res) => {
  try {
    const { preferredCurrency, preferredLanguage } = req.body;
    
    const updateData = {};
    if (preferredCurrency) updateData.preferredCurrency = preferredCurrency;
    if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      status: "success",
      message: "Preferences updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update preferences",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
