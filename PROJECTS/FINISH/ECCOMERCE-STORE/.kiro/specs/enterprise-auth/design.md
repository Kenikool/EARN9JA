# Enterprise Authentication System - Design Document

## Overview

This document outlines the technical design for implementing enterprise-grade authentication features including 2FA/MFA, session management, security monitoring, social authentication via Clerk, and GDPR compliance features.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │   2FA    │  │ Sessions │  │ Settings │   │
│  │   UI     │  │   UI     │  │    UI    │  │    UI    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Rate Limiter │  │   Auth MW    │  │  Session MW  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │   2FA    │  │ Security │  │   GDPR   │   │
│  │Controller│  │Controller│  │Controller│  │Controller│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   User   │  │ Session  │  │ Activity │  │  Device  │   │
│  │  Model   │  │  Model   │  │   Log    │  │  Model   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Clerk   │  │  Email   │  │   SMS    │  │  Redis   │   │
│  │  (OAuth) │  │ Service  │  │ Service  │  │  Cache   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Models

#### User Model Extensions

```javascript
{
  // Existing fields...

  // 2FA Fields
  twoFactorEnabled: Boolean,
  twoFactorSecret: String (encrypted),
  twoFactorBackupCodes: [String] (hashed),
  twoFactorMethod: Enum ['authenticator', 'email', 'sms'],
  phoneNumber: String,
  phoneVerified: Boolean,

  // Security Fields
  failedLoginAttempts: Number,
  accountLockedUntil: Date,
  passwordHistory: [{
    password: String (hashed),
    changedAt: Date
  }],
  passwordChangedAt: Date,
  passwordExpiresAt: Date,
  forcePasswordChange: Boolean,

  // Privacy & GDPR
  privacySettings: {
    marketingEmails: Boolean,
    securityAlerts: Boolean,
    dataSharing: Boolean
  },
  accountStatus: Enum ['active', 'deactivated', 'scheduled_deletion'],
  deletionScheduledFor: Date,

  // Social Auth
  clerkUserId: String,
  googleId: String,
  authProvider: Enum ['local', 'google'],

  // Email Change
  pendingEmail: String,
  emailChangeToken: String,
  emailChangeExpires: Date,
  oldEmailVerified: Boolean
}
```

#### Session Model (New)

```javascript
{
  user: ObjectId (ref: User),
  token: String (hashed),
  refreshToken: String (hashed),
  deviceInfo: {
    userAgent: String,
    browser: String,
    os: String,
    device: String
  },
  ipAddress: String,
  location: {
    country: String,
    city: String,
    coordinates: [Number]
  },
  isTrusted: Boolean,
  trustExpiresAt: Date,
  lastActivity: Date,
  expiresAt: Date,
  isActive: Boolean,
  createdAt: Date
}
```

#### LoginAttempt Model (New)

```javascript
{
  user: ObjectId (ref: User),
  email: String,
  ipAddress: String,
  userAgent: String,
  location: Object,
  success: Boolean,
  failureReason: String,
  twoFactorPassed: Boolean,
  flaggedAsSuspicious: Boolean,
  suspiciousReasons: [String],
  timestamp: Date
}
```

#### TrustedDevice Model (New)

```javascript
{
  user: ObjectId (ref: User),
  deviceFingerprint: String (hashed),
  deviceInfo: Object,
  ipAddress: String,
  trustedAt: Date,
  expiresAt: Date,
  lastUsed: Date,
  isActive: Boolean
}
```

#### ActivityLog Model (New)

```javascript
{
  user: ObjectId (ref: User),
  action: Enum ['login', 'logout', 'password_change', 'email_change', '2fa_enabled', '2fa_disabled', 'profile_update', 'session_revoked'],
  details: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

### 2. API Endpoints

#### 2FA Endpoints

```
POST   /api/auth/2fa/enable              - Enable 2FA (returns QR code)
POST   /api/auth/2fa/verify-setup        - Verify 2FA setup with OTP
POST   /api/auth/2fa/disable             - Disable 2FA
POST   /api/auth/2fa/verify-login        - Verify OTP during login
POST   /api/auth/2fa/regenerate-backup   - Generate new backup codes
POST   /api/auth/2fa/verify-backup-code  - Verify backup code
POST   /api/auth/2fa/send-otp            - Send OTP via email/SMS
```

#### Session Management Endpoints

```
GET    /api/auth/sessions                - Get all active sessions
DELETE /api/auth/sessions/:id            - Revoke specific session
DELETE /api/auth/sessions/all            - Logout from all devices
POST   /api/auth/sessions/trust-device   - Mark device as trusted
GET    /api/auth/sessions/trusted-devices - Get trusted devices
DELETE /api/auth/sessions/trusted/:id    - Remove trusted device
```

#### Security Endpoints

```
GET    /api/auth/login-history           - Get login history
GET    /api/auth/activity-log            - Get activity log
POST   /api/auth/unlock-account          - Request account unlock
GET    /api/auth/security-status         - Get security overview
```

#### Account Management Endpoints

```
POST   /api/auth/account/deactivate      - Deactivate account
POST   /api/auth/account/reactivate      - Reactivate account
POST   /api/auth/account/delete          - Schedule account deletion
POST   /api/auth/account/cancel-deletion - Cancel scheduled deletion
GET    /api/auth/account/export-data     - Request data export
GET    /api/auth/account/download-data/:token - Download exported data
```

#### Privacy & Settings Endpoints

```
GET    /api/auth/privacy-settings        - Get privacy settings
PUT    /api/auth/privacy-settings        - Update privacy settings
GET    /api/auth/notification-preferences - Get notification preferences
PUT    /api/auth/notification-preferences - Update notification preferences
```

#### Email Change Endpoints

```
POST   /api/auth/email/change-request    - Request email change
GET    /api/auth/email/verify-old/:token - Verify old email
GET    /api/auth/email/verify-new/:token - Verify new email
```

### 3. Middleware

#### Rate Limiter Middleware

```javascript
// Uses Redis for distributed rate limiting
- Login: 10 attempts per minute per IP
- Registration: 5 attempts per hour per IP
- 2FA: 3 attempts per 15 minutes per user
- Password Reset: 3 attempts per hour per email
```

#### Session Validator Middleware

```javascript
// Validates session on each request
- Check if session exists and is active
- Update last activity timestamp
- Check if session expired
- Validate device fingerprint for trusted devices
```

#### Suspicious Activity Detector Middleware

```javascript
// Analyzes login patterns
- Check for unusual location
- Check for unusual time
- Check for rapid location changes
- Check for multiple failed attempts
- Flag and require additional verification
```

## Data Models

### 2FA Flow

```
User enables 2FA
    ↓
Generate TOTP secret
    ↓
Display QR code + manual entry key
    ↓
User scans with authenticator app
    ↓
User enters verification code
    ↓
Validate code
    ↓
Generate 10 backup codes
    ↓
Store hashed backup codes
    ↓
Enable 2FA on account
```

### Login Flow with 2FA

```
User enters credentials
    ↓
Validate username/password
    ↓
Check if 2FA enabled
    ↓
If yes → Request OTP
    ↓
User enters OTP
    ↓
Validate OTP
    ↓
Check if device is trusted
    ↓
If not trusted → Offer to trust device
    ↓
Create session
    ↓
Log login attempt
    ↓
Send security alert if new device
    ↓
Return tokens
```

### Account Lockout Flow

```
Failed login attempt
    ↓
Increment failedLoginAttempts
    ↓
Check if >= 5 attempts
    ↓
If yes → Lock account for 30 minutes
    ↓
Send security alert email
    ↓
Log lockout event
    ↓
Return lockout message with timer
```

### Session Management Flow

```
User logs in
    ↓
Create session record
    ↓
Generate device fingerprint
    ↓
Get IP geolocation
    ↓
Store session in database
    ↓
Store session token in Redis (fast lookup)
    ↓
Return access + refresh tokens
    ↓
On each request → Validate session
    ↓
Update lastActivity timestamp
    ↓
Check for inactivity timeout
```

## Error Handling

### Error Codes

```javascript
// 2FA Errors
'2FA_REQUIRED': 'Two-factor authentication required',
'2FA_INVALID_CODE': 'Invalid verification code',
'2FA_EXPIRED_CODE': 'Verification code expired',
'2FA_TOO_MANY_ATTEMPTS': '2FA locked due to too many attempts',
'2FA_BACKUP_CODE_USED': 'Backup code already used',

// Account Security Errors
'ACCOUNT_LOCKED': 'Account locked due to multiple failed attempts',
'ACCOUNT_DEACTIVATED': 'Account has been deactivated',
'ACCOUNT_SCHEDULED_DELETION': 'Account scheduled for deletion',
'SUSPICIOUS_ACTIVITY': 'Suspicious activity detected',

// Session Errors
'SESSION_EXPIRED': 'Session has expired',
'SESSION_INVALID': 'Invalid session',
'SESSION_REVOKED': 'Session has been revoked',
'DEVICE_NOT_TRUSTED': 'Device not recognized',

// Rate Limit Errors
'RATE_LIMIT_EXCEEDED': 'Too many requests',
'IP_BLOCKED': 'IP address temporarily blocked'
```

## Testing Strategy

### Unit Tests

- 2FA code generation and validation
- Password history checking
- Session token generation
- Rate limiter logic
- Suspicious activity detection algorithms

### Integration Tests

- Complete 2FA setup flow
- Login with 2FA flow
- Session management operations
- Account lockout and unlock flow
- Email change verification flow
- Data export generation

### Security Tests

- Brute force attack simulation
- Rate limiting effectiveness
- Session hijacking prevention
- 2FA bypass attempts
- SQL injection on new endpoints
- XSS prevention in activity logs

### Performance Tests

- Session lookup performance (Redis)
- Rate limiter performance under load
- Activity log query performance
- Concurrent session management

## Security Considerations

1. **Encryption**

   - 2FA secrets encrypted at rest
   - Backup codes hashed with bcrypt
   - Session tokens hashed in database
   - Device fingerprints hashed

2. **Token Management**

   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (30 days)
   - Refresh token rotation on use
   - Token revocation on logout

3. **Rate Limiting**

   - Distributed rate limiting with Redis
   - IP-based and user-based limits
   - Exponential backoff for repeated violations
   - Whitelist for trusted IPs

4. **Data Privacy**

   - GDPR-compliant data export
   - Right to be forgotten (account deletion)
   - Granular privacy controls
   - Audit trail for data access

5. **Monitoring**
   - Real-time suspicious activity alerts
   - Failed login attempt monitoring
   - Session anomaly detection
   - Security event logging

## Third-Party Integrations

### Clerk (Google OAuth)

```javascript
// Configuration
- Clerk publishable key in environment
- Webhook for user sync
- Custom claims for role mapping
- Session token validation
```

### SMS Provider (Twilio)

```javascript
// For SMS OTP
- Account SID and Auth Token
- Phone number verification
- OTP delivery
- Delivery status tracking
```

### Redis

```javascript
// For caching and rate limiting
- Session storage
- Rate limit counters
- OTP temporary storage
- Device fingerprint cache
```

### IP Geolocation Service

```javascript
// For location tracking
- IP to location mapping
- Suspicious location detection
- VPN/Proxy detection
```

## Deployment Considerations

1. **Environment Variables**

   - 2FA encryption key
   - Clerk API keys
   - Twilio credentials
   - Redis connection string
   - IP geolocation API key

2. **Database Migrations**

   - Add new fields to User model
   - Create new collections (Session, LoginAttempt, etc.)
   - Create indexes for performance
   - Migrate existing users

3. **Redis Setup**

   - Configure Redis for session storage
   - Set up Redis for rate limiting
   - Configure TTL for cached data

4. **Monitoring**
   - Set up alerts for suspicious activity
   - Monitor rate limit violations
   - Track 2FA adoption rate
   - Monitor session performance
