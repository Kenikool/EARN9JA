# Enterprise Authentication System - Implementation Tasks

## Phase 1: Core Security Features (2FA, Account Lockout, Rate Limiting)

- [x] 1. Database Models & Schema Updates

- [x] 1.1 Update User model with 2FA fields

  - Add twoFactorEnabled, twoFactorSecret, twoFactorBackupCodes fields
  - Add twoFactorMethod enum field
  - Add phoneNumber and phoneVerified fields

  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.2 Update User model with security fields

  - Add failedLoginAttempts, accountLockedUntil fields
  - Add passwordHistory array field
  - Add passwordChangedAt, passwordExpiresAt fields

  - Add forcePasswordChange boolean field
  - _Requirements: 2.1, 2.2, 6.1, 6.2_

- [x] 1.3 Create Session model

  - Define schema with user, token, deviceInfo, ipAddress fields
  - Add location, isTrusted, lastActivity fields

  - Create indexes on user, token, expiresAt

  - _Requirements: 4.1, 4.2, 7.1_

- [x] 1.4 Create LoginAttempt model

  - Define schema for tracking login attempts

  - Add success, failureReason, flaggedAsSuspicious fields
  - Create indexes on user, timestamp, ipAddress

  - _Requirements: 3.1, 3.2, 15.1_

- [x] 1.5 Create TrustedDevice model

  - Define schema for device fingerprinting

  - Add deviceFingerprint, trustedAt, expiresAt fields

  - Create indexes on user, deviceFingerprint

  - _Requirements: 7.1, 7.2, 7.3_

- [x] 1.6 Create ActivityLog model

  - Define schema for user activity tracking

  - Add action enum, details, ipAddress fields
  - Create indexes on user, timestamp, action
  - _Requirements: 3.4, 14.1, 14.2_

- [x] 2. Two-Factor Authentication (2FA) Implementation

- [x] 2.1 Install and configure 2FA dependencies

  - Install speakeasy for TOTP generation
  - Install qrcode for QR code generation
  - Install twilio for SMS OTP (optional)
  - _Requirements: 1.1, 1.4_

- [x] 2.2 Create 2FA utility functions

  - generateTOTPSecret() - Generate secret key
  - generateQRCode() - Generate QR code image
  - verifyTOTP() - Verify TOTP code

  - generateBackupCodes() - Generate 10 backup codes

  - verifyBackupCode() - Verify and invalidate backup code
  - _Requirements: 1.1, 1.2, 1.7_

- [x] 2.3 Create 2FA controller - Enable 2FA

  - POST /api/auth/2fa/enable endpoint
  - Generate TOTP secret

  - Return QR code and manual entry key

  - Store encrypted secret temporarily
  - _Requirements: 1.1_

- [x] 2.4 Create 2FA controller - Verify Setup

  - POST /api/auth/2fa/verify-setup endpoint
  - Verify user-provided OTP

  - Generate and store backup codes
  - Enable 2FA on user account

  - Send confirmation email
  - _Requirements: 1.2, 1.3_

- [x] 2.5 Create 2FA controller - Verify Login

  - POST /api/auth/2fa/verify-login endpoint
  - Verify OTP during login
  - Track failed attempts (max 3)
  - Lock 2FA for 15 minutes after 3 failures

  - Create session on success

  - _Requirements: 1.3, 1.6_

- [x] 2.6 Create 2FA controller - Disable 2FA

  - POST /api/auth/2fa/disable endpoint
  - Require password confirmation
  - Clear 2FA secret and backup codes
  - Send security alert email

  - _Requirements: 14.3_

- [x] 2.7 Create 2FA controller - Backup Codes

  - POST /api/auth/2fa/regenerate-backup endpoint
  - Generate new backup codes

  - Invalidate old codes
  - POST /api/auth/2fa/verify-backup-code endpoint
  - _Requirements: 1.7_

- [x] 2.8 Create 2FA controller - Send OTP

  - POST /api/auth/2fa/send-otp endpoint

  - Support email and SMS methods
  - Generate 6-digit OTP
  - Store in Redis with 10-minute expiry
  - Send via email or SMS

  - _Requirements: 1.4, 1.5_

- [x] 2.9 Update login flow for 2FA

  - Check if user has 2FA enabled after password verification
  - Return 2FA_REQUIRED status

  - Don't create session until 2FA verified

  - _Requirements: 1.3_

- [x] 2.10 Create 2FA frontend pages

  - 2FA Setup page with QR code display
  - 2FA Verification page during login

  - 2FA Settings page (enable/disable, backup codes)

  - Backup codes display and download
  - _Requirements: 1.1, 1.2, 1.7_

- [ ] 3. Account Lockout Protection
- [ ] 3.1 Create account lockout utility functions

  - incrementFailedAttempts() - Increment counter

  - lockAccount() - Set lockout timestamp
  - isAccountLocked() - Check if locked

  - getRemainingLockoutTime() - Calculate remaining time

  - resetFailedAttempts() - Reset on successful login

  - _Requirements: 2.1, 2.3, 2.5_

- [ ] 3.2 Update login controller with lockout logic

  - Check if account is locked before authentication

  - Increment failed attempts on wrong password

  - Lock account after 5 failed attempts
  - Return lockout time remaining

  - _Requirements: 2.1, 2.3_

- [ ] 3.3 Create account unlock functionality

  - POST /api/auth/unlock-account endpoint

  - Send unlock link via email
  - Verify unlock token
  - Reset failed attempts and unlock
  - _Requirements: 2.4_

- [x] 3.4 Create lockout notification email template

  - Design security alert email
  - Include lockout reason and duration
  - Provide unlock link

  - Add security tips
  - _Requirements: 2.2_

- [ ] 3.5 Update frontend login page

  - Display lockout message with countdown timer

  - Show "Unlock via email" button
  - Handle lockout errors gracefully
  - _Requirements: 2.3_

- [ ] 4. IP-Based Rate Limiting
- [x] 4.1 Install and configure Redis

  - Install redis and ioredis packages
  - Configure Redis connection
  - Set up Redis client singleton

  - _Requirements: 5.1, 5.2_

- [ ] 4.2 Create rate limiter middleware

  - Implement sliding window rate limiting
  - Track requests per IP address
  - Support different limits per endpoint
  - Store counters in Redis
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4.3 Configure rate limits for auth endpoints

  - Login: 10 attempts per minute

  - Registration: 5 attempts per hour
  - Password reset: 3 attempts per hour
  - 2FA verification: 3 attempts per 15 minutes
  - _Requirements: 5.1, 5.2_

- [x] 4.4 Create IP whitelist functionality

  - Store whitelisted IPs in database
  - Check whitelist before applying rate limits
  - Admin endpoint to manage whitelist
  - _Requirements: 5.5_

- [x] 4.5 Implement rate limit response handling

  - Return 429 status code
  - Include Retry-After header
  - Log rate limit violations
  - Send alert for repeated violations
  - _Requirements: 5.3, 5.4_

- [ ] 4.6 Create rate limit monitoring dashboard
  - Admin page to view rate limit violations
  - Display blocked IPs
  - Show violation statistics
  - _Requirements: 5.4_

## Phase 2: Session Management & Activity Logging

- [ ] 5. Active Session Management
- [x] 5.1 Create session management utilities

  - createSession() - Create new session
  - getDeviceInfo() - Extract device information
  - getIPLocation() - Get geolocation from IP
  - generateDeviceFingerprint() - Create device ID
  - _Requirements: 4.1, 7.1_

- [x] 5.2 Update login to create session records

  - Create session in database on login
  - Store session token in Redis
  - Generate device fingerprint
  - Get IP geolocation
  - _Requirements: 4.1_

- [x] 5.3 Create session controller - View Sessions

  - GET /api/auth/sessions endpoint
  - Return all active sessions for user
  - Include device info, location, last activity
  - Mark current session
  - _Requirements: 4.2_

- [x] 5.4 Create session controller - Revoke Session

  - DELETE /api/auth/sessions/:id endpoint
  - Invalidate session token
  - Remove from Redis cache
  - Mark as inactive in database
  - Send notification email
  - _Requirements: 4.3_

- [x] 5.5 Create session controller - Logout All

  - DELETE /api/auth/sessions/all endpoint
  - Invalidate all sessions except current
  - Clear Redis cache for user
  - Send security alert email
  - _Requirements: 4.4_

- [x] 5.6 Implement session auto-expiry

  - Background job to check inactive sessions
  - Expire sessions inactive for 30 days
  - Clean up expired sessions from database
  - _Requirements: 4.5_

- [x] 5.7 Create session validation middleware

  - Validate session on each request
  - Check if session exists and is active
  - Update lastActivity timestamp
  - Check for session expiry
  - _Requirements: 4.1, 8.3_

- [x] 5.8 Create sessions management frontend page

  - Display all active sessions
  - Show device, location, last activity
  - "Revoke" button for each session
  - "Logout from all devices" button
  - Confirm current session
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 6. Device Trust Management
- [x] 6.1 Create trusted device utilities

  - trustDevice() - Mark device as trusted
  - isTrustedDevice() - Check if device is trusted
  - removeTrustedDevice() - Revoke device trust
  - cleanupExpiredTrust() - Remove expired trust
  - _Requirements: 7.1, 7.2, 7.4_

- [x] 6.2 Update 2FA flow for trusted devices

  - After successful 2FA, offer to trust device
  - Store device fingerprint with 30-day expiry
  - Skip 2FA for trusted devices
  - _Requirements: 7.1, 7.2_

- [x] 6.3 Create trusted device controller

  - POST /api/auth/sessions/trust-device endpoint
  - GET /api/auth/sessions/trusted-devices endpoint
  - DELETE /api/auth/sessions/trusted/:id endpoint
  - _Requirements: 7.3, 7.4_

- [x] 6.4 Create trusted devices frontend page

  - Display all trusted devices
  - Show device info and trust expiry
  - "Remove trust" button for each device
  - Confirmation modal
  - _Requirements: 7.3_

- [ ] 7. Session Timeout Management
- [ ] 7.1 Implement session inactivity tracking

  - Track last activity timestamp
  - Update on each API request
  - Check inactivity duration
  - _Requirements: 8.3_

- [ ] 7.2 Create session timeout warning system

  - Frontend: Check session age periodically
  - Show warning modal at 25 minutes
  - Provide "Stay Logged In" button
  - Auto-logout at 30 minutes
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 7.3 Implement session extension

  - POST /api/auth/sessions/extend endpoint
  - Extend session expiry by 30 minutes
  - Update lastActivity timestamp
  - _Requirements: 8.4_

- [ ] 7.4 Handle "Remember Me" extended sessions

  - Set longer expiry (30 days) for remembered sessions
  - Store remember preference in session
  - Apply extended timeout rules
  - _Requirements: 8.5_

- [ ] 7.5 Create timeout warning modal component

  - Display countdown timer
  - "Stay Logged In" button
  - "Logout" button
  - Auto-dismiss on activity
  - _Requirements: 8.1, 8.2, 8.4_

- [ ] 8. Login History & Activity Logging
- [ ] 8.1 Create login attempt logging

  - Log every login attempt (success/failure)
  - Store IP, device, location, timestamp
  - Flag suspicious attempts
  - _Requirements: 3.1, 15.1_

- [ ] 8.2 Create activity logging utility

  - logActivity() - Log user actions
  - Support multiple action types
  - Store IP, device, details
  - _Requirements: 3.4_

- [ ] 8.3 Update controllers to log activities

  - Log password changes
  - Log email changes
  - Log 2FA enable/disable
  - Log profile updates
  - Log session revocations
  - _Requirements: 3.4, 14.2, 14.3_

- [ ] 8.4 Create login history controller

  - GET /api/auth/login-history endpoint
  - Return last 50 login attempts
  - Include success/failure status
  - Show device, location, timestamp
  - _Requirements: 3.2_

- [ ] 8.5 Create activity log controller

  - GET /api/auth/activity-log endpoint
  - Return user's activity history
  - Support filtering by action type
  - Pagination support
  - _Requirements: 3.4_

- [ ] 8.6 Create login history frontend page

  - Display login attempts in timeline
  - Show success/failure indicators
  - Display device, location, time
  - Highlight suspicious attempts
  - _Requirements: 3.2, 3.5_

- [ ] 8.7 Create activity log frontend page

  - Display activity timeline
  - Filter by action type
  - Show details for each action
  - Export functionality
  - _Requirements: 3.4_

- [ ] 9. Suspicious Activity Detection
- [ ] 9.1 Create suspicious activity detection utilities

  - detectUnusualLocation() - Check for location anomalies
  - detectUnusualTime() - Check for time anomalies
  - detectRapidLocationChange() - Check for impossible travel
  - calculateRiskScore() - Overall risk assessment
  - _Requirements: 15.1, 15.2, 15.3_

- [ ] 9.2 Create user behavior profiling

  - Track normal login locations
  - Track normal login times
  - Track typical devices
  - Update profile on each login
  - _Requirements: 15.5_

- [ ] 9.3 Implement suspicious activity middleware

  - Run detection on each login attempt
  - Flag suspicious attempts
  - Require additional verification
  - Log suspicious activity
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [ ] 9.4 Create additional verification flow

  - Send verification code to email
  - Require code entry before login
  - Allow user to confirm legitimate activity
  - Update behavior profile on confirmation
  - _Requirements: 15.4, 15.5_

- [ ] 9.5 Create security alert email templates
  - New device login alert
  - Unusual location alert
  - Suspicious activity alert
  - Include action steps
  - _Requirements: 3.3, 14.1, 14.5_

## Phase 3: GDPR & Privacy Features

- [ ] 10. Password Security Policies
- [x] 10.1 Implement password history checking

  - Store hashed passwords in history array
  - Check new password against last 5 passwords
  - Prevent password reuse
  - _Requirements: 6.1, 6.4_

- [x] 10.2 Update password change controller

  - Add password history check
  - Store old password in history
  - Limit history to 5 passwords
  - _Requirements: 6.1, 6.4_

- [x] 10.3 Implement password expiry

  - Set passwordExpiresAt on password change
  - Check expiry on login
  - Prompt for password change if expired
  - Send reminder emails 7 days before
  - _Requirements: 6.2, 6.5_

- [x] 10.4 Create password expiry reminder job

  - Background job to check expiring passwords
  - Send reminder emails
  - Run daily
  - _Requirements: 6.5_

- [x] 10.5 Implement force password change

  - Set forcePasswordChange flag for new users (optional)
  - Check flag on login
  - Redirect to password change page
  - Clear flag after change
  - _Requirements: 6.3_

- [x] 10.6 Create password change prompt frontend

  - Modal for expired passwords
  - Redirect for forced changes
  - Password change form
  - Success confirmation
  - _Requirements: 6.2, 6.3_

- [ ] 11. Account Deletion & Deactivation
- [x] 11.1 Create account deactivation controller

  - POST /api/auth/account/deactivate endpoint
  - Set accountStatus to 'deactivated'
  - Invalidate all sessions
  - Send confirmation email
  - _Requirements: 10.5_

- [ ] 11.2 Create account reactivation controller

  - POST /api/auth/account/reactivate endpoint
  - Send reactivation link via email
  - Verify token and reactivate
  - Send welcome back email

  - _Requirements: 10.6_

- [ ] 11.3 Create account deletion controller

  - POST /api/auth/account/delete endpoint
  - Send confirmation email with verification link

  - Set deletionScheduledFor to 30 days from now
  - Set accountStatus to 'scheduled_deletion'

  - _Requirements: 10.1, 10.2_

- [x] 11.4 Create cancel deletion controller

  - POST /api/auth/account/cancel-deletion endpoint
  - Clear deletionScheduledFor
  - Set accountStatus back to 'active'

  - Send cancellation confirmation
  - _Requirements: 10.3_

- [ ] 11.5 Implement account deletion job

  - Background job to process scheduled deletions
  - Delete user data after 30 days
  - Anonymize orders (keep for records)
  - Delete personal information
  - Send final confirmation email
  - _Requirements: 10.4_

- [ ] 11.6 Create account management frontend pages

  - Deactivate account page with confirmation
  - Delete account page with warnings
  - Reactivation page
  - Cancellation page
  - _Requirements: 10.1, 10.5, 10.6_

- [x] 12. GDPR Data Export

- [ ] 12.1 Create data export utility

  - collectUserData() - Gather all user data
  - Include profile, orders, reviews, activity logs
  - Format as JSON
  - Generate downloadable file

  - _Requirements: 11.3_

- [ ] 12.2 Create data export controller

  - GET /api/auth/account/export-data endpoint
  - Generate export file
  - Store temporarily with unique token
  - Send download link via email

  - Set 7-day expiry
  - _Requirements: 11.1, 11.2, 11.5_

- [ ] 12.3 Create data download controller

  - GET /api/auth/account/download-data/:token endpoint
  - Verify token validity

  - Return JSON file for download
  - Log download event
  - _Requirements: 11.3_

- [ ] 12.4 Implement export cleanup job

  - Background job to delete expired exports
  - Run daily
  - Remove files older than 7 days
  - _Requirements: 11.5_

- [x] 12.5 Create data export frontend page

  - "Request Data Export" button
  - Export status display
  - Download link when ready
  - Export history
  - _Requirements: 11.1, 11.2_

- [ ] 13. Privacy Settings & Notification Preferences
- [ ] 13.1 Update User model with privacy settings

  - Add privacySettings object
  - Add notification preferences
  - Set defaults
  - _Requirements: 12.1, 12.4_

- [x] 13.2 Create privacy settings controller

  - GET /api/auth/privacy-settings endpoint
  - PUT /api/auth/privacy-settings endpoint
  - Validate settings
  - Apply changes immediately
  - _Requirements: 12.1, 12.4_

- [x] 13.3 Create notification preferences controller

  - GET /api/auth/notification-preferences endpoint
  - PUT /api/auth/notification-preferences endpoint
  - Support granular preferences
  - _Requirements: 12.3_

- [x] 13.4 Update email sending logic

  - Check user preferences before sending
  - Respect marketing email opt-out
  - Always send security alerts (unless disabled)
  - _Requirements: 12.2_

- [ ] 13.5 Create privacy settings frontend page

  - Toggle switches for each setting
  - Clear descriptions
  - Save button with confirmation
  - GDPR compliance notice
  - _Requirements: 12.1, 12.5_

- [x] 13.6 Create notification preferences frontend page

  - Checkboxes for each notification type
  - Grouped by category
  - Save button
  - Preview of notification types

  - _Requirements: 12.3_

- [ ] 14. Email Change Verification
- [x] 14.1 Create email change request controller

  - POST /api/auth/email/change-request endpoint
  - Validate new email
  - Generate tokens for both emails
  - Send verification to old email first
  - Store pendingEmail
  - _Requirements: 13.1_

- [x] 14.2 Create old email verification controller

  - GET /api/auth/email/verify-old/:token endpoint
  - Verify token
  - Set oldEmailVerified flag
  - Send verification to new email
  - _Requirements: 13.2_

- [x] 14.3 Create new email verification controller

  - GET /api/auth/email/verify-new/:token endpoint
  - Check if old email verified
  - Update user email
  - Clear pending email fields
  - Send confirmation to both emails
  - _Requirements: 13.3, 13.4_

- [x] 14.4 Implement email change timeout

  - Set 24-hour expiry on tokens
  - Cancel change if not completed
  - Clean up expired requests
  - _Requirements: 13.5_

- [x] 14.5 Create email change frontend pages

  - Email change request form
  - Verification sent confirmation
  - Success confirmation page
  - _Requirements: 13.1, 13.4_

- [ ] 15. Security Alert Notifications
- [x] 15.1 Create security alert email templates

  - New device login template
  - Password changed template
  - 2FA disabled template
  - Email changed template
  - Suspicious activity template
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 15.2 Update controllers to send security alerts

  - Send alert on new device login
  - Send alert on password change
  - Send alert on 2FA disable
  - Send alert on email change
  - Send alert on suspicious activity
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 15.3 Create security alerts frontend page
  - Display recent security alerts
  - Mark as read/unread
  - Filter by type
  - Action buttons (e.g., "This wasn't me")
  - _Requirements: 14.1, 14.5_

## Phase 4: Social Authentication (Clerk/Google)

- [ ] 16. Clerk Integration for Google OAuth
- [x] 16.1 Configure Clerk project

  - Create Clerk account and project
  - Enable Google OAuth provider
  - Configure OAuth redirect URLs
  - Get publishable and secret keys
  - _Requirements: 9.1_

- [ ] 16.2 Install and configure Clerk SDK

  - Install @clerk/clerk-react
  - Install @clerk/backend
  - Configure Clerk provider in frontend
  - Set up environment variables
  - _Requirements: 9.1_

- [ ] 16.3 Create Clerk webhook handler

  - POST /api/webhooks/clerk endpoint
  - Verify webhook signature
  - Handle user.created event
  - Handle user.updated event
  - Sync user data to database
  - _Requirements: 9.2, 9.3_

- [x] 16.4 Update User model for Clerk

  - Add clerkUserId field
  - Add googleId field
  - Add authProvider enum
  - Create indexes
  - _Requirements: 9.2, 9.3_

- [ ] 16.5 Create account linking logic

  - Check if email exists when Google user signs in
  - Link Clerk user to existing account
  - Merge account data
  - Send confirmation email
  - _Requirements: 9.3_

- [x] 16.6 Update frontend with Clerk components

  - Add SignIn component with Google button
  - Add SignUp component with Google button
  - Add UserButton for profile menu
  - Handle Clerk session
  - _Requirements: 9.1, 9.4_

- [ ] 16.7 Implement dual authentication support

  - Allow users with both password and Google auth
  - Show both options on login page
  - Allow unlinking Google account
  - _Requirements: 9.5_

- [x] 16.8 Create Google account management page

  - Show connected Google account
  - "Disconnect Google" button
  - "Connect Google" button if not connected
  - Security warnings
  - _Requirements: 9.5_

## Phase 5: Testing & Documentation

- [ ] 17. Testing
- [ ]\* 17.1 Write unit tests for 2FA utilities

  - Test TOTP generation and verification
  - Test backup code generation and verification
  - Test QR code generation
  - _Requirements: All 2FA requirements_

- [ ]\* 17.2 Write unit tests for security utilities

  - Test account lockout logic
  - Test password history checking
  - Test suspicious activity detection
  - _Requirements: 2.1, 6.1, 15.1_

- [ ]\* 17.3 Write integration tests for 2FA flow

  - Test complete 2FA setup flow
  - Test login with 2FA
  - Test backup code usage
  - Test 2FA disable flow
  - _Requirements: 1.1-1.7_

- [ ]\* 17.4 Write integration tests for session management

  - Test session creation
  - Test session revocation
  - Test logout from all devices
  - Test trusted device flow
  - _Requirements: 4.1-4.5, 7.1-7.4_

- [x]\* 17.5 Write integration tests for account management


  - Test account deactivation
  - Test account deletion
  - Test data export
  - Test email change flow
  - _Requirements: 10.1-10.6, 11.1-11.5, 13.1-13.5_

- [ ]\* 17.6 Write security tests

  - Test rate limiting effectiveness
  - Test brute force protection
  - Test session hijacking prevention
  - Test 2FA bypass attempts
  - _Requirements: 2.1, 5.1, 15.1_

- [ ]\* 17.7 Write performance tests

  - Test session lookup performance
  - Test rate limiter under load
  - Test activity log queries
  - Test concurrent session management
  - _Requirements: 4.1, 5.1_

- [ ] 18. Documentation
- [ ]\* 18.1 Create API documentation

  - Document all new endpoints
  - Include request/response examples
  - Document error codes
  - Add authentication requirements
  - _Requirements: All_

- [ ]\* 18.2 Create user guides

  - How to enable 2FA guide
  - How to manage sessions guide
  - How to export data guide
  - Security best practices guide
  - _Requirements: All_

- [ ]\* 18.3 Create admin documentation

  - Rate limiting configuration
  - Security monitoring guide
  - User management guide
  - Troubleshooting guide
  - _Requirements: 5.1-5.6, 15.1-15.5_

- [ ]\* 18.4 Update README
  - Add enterprise features section
  - Update environment variables
  - Add setup instructions
  - Add deployment notes
  - _Requirements: All_

## Phase 6: Deployment & Monitoring

- [ ] 19. Deployment Preparation
- [ ] 19.1 Set up Redis in production

  - Configure Redis instance
  - Set up connection pooling
  - Configure persistence
  - Set up monitoring
  - _Requirements: 4.1, 5.1_

- [ ] 19.2 Configure environment variables

  - Add all new environment variables
  - Set up secrets management
  - Configure for different environments
  - _Requirements: All_

- [ ] 19.3 Run database migrations

  - Create migration scripts
  - Test migrations on staging
  - Run migrations on production
  - Verify data integrity
  - _Requirements: 1.1-1.6_

- [ ] 19.4 Set up monitoring and alerts

  - Configure error tracking
  - Set up security alerts
  - Monitor rate limit violations
  - Track 2FA adoption rate
  - _Requirements: 5.4, 15.1_

- [ ] 19.5 Create backup and recovery procedures

  - Backup 2FA secrets
  - Backup session data
  - Document recovery procedures
  - Test recovery process
  - _Requirements: All_

- [ ] 20. Post-Deployment
- [ ] 20.1 Monitor system performance

  - Check API response times
  - Monitor Redis performance
  - Check database query performance
  - Monitor error rates
  - _Requirements: All_

- [ ] 20.2 Gather user feedback

  - Monitor 2FA adoption
  - Track feature usage
  - Collect user feedback
  - Identify pain points
  - _Requirements: All_

- [ ] 20.3 Optimize based on metrics
  - Optimize slow queries
  - Adjust rate limits if needed
  - Improve UX based on feedback
  - Fix reported issues
  - _Requirements: All_
