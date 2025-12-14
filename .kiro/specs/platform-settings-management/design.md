# Design Document: Platform Settings Management

## Overview

This document outlines the technical design for implementing a comprehensive Platform Settings Management system for Earn9ja. The system encompasses three major features:

1. **Platform Settings Configuration** - Manage financial parameters, user limits, and operational controls
2. **Bulk Messaging & Push Notifications** - Send targeted communications to users
3. **App Version Management** - Control app updates and force version upgrades

The design prioritizes security by maintaining a clear separation between frontend-safe settings and backend-only sensitive configuration. All settings are cached for performance and include comprehensive audit logging.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Panel (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Platform   │  │   Messaging  │  │   Version    │      │
│  │   Settings   │  │   Center     │  │   Manager    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (Node.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Settings   │  │   Message    │  │   Version    │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │         Redis Cache (5-minute TTL)               │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   MongoDB Database                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Platform   │  │   Bulk       │  │   App        │      │
│  │   Settings   │  │   Messages   │  │   Version    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Settings   │  │   FCM        │                        │
│  │   Audit Log  │  │   Tokens     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Firebase   │  │   Expo Push  │                        │
│  │     FCM      │  │   Service    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **Admin Panel** → Makes authenticated API requests to backend
2. **Backend API** → Validates admin permissions, processes requests
3. **Services Layer** → Implements business logic, interacts with database
4. **Cache Layer** → Redis caches frequently accessed settings
5. **Database** → MongoDB stores persistent data
6. **External Services** → FCM/Expo for push notifications

## Components and Interfaces

### Backend Components

#### 1. Platform Settings Service

**Responsibilities:**

- Retrieve and update platform settings
- Validate setting values
- Manage settings cache
- Log all changes to audit trail

**Key Methods:**

```typescript
class PlatformSettingsService {
  async getSettings(): Promise<PlatformSettings>;
  async updateSettings(
    updates: Partial<PlatformSettings>,
    adminId: string
  ): Promise<void>;
  async resetToDefaults(settingKeys: string[], adminId: string): Promise<void>;
  async getAuditLog(filters: AuditFilters): Promise<AuditEntry[]>;
  private validateSettings(
    settings: Partial<PlatformSettings>
  ): ValidationResult;
  private invalidateCache(): Promise<void>;
}
```

#### 2. Bulk Message Service

**Responsibilities:**

- Create and send bulk messages
- Process recipients in batches
- Track delivery status
- Manage message templates

**Key Methods:**

```typescript
class BulkMessageService {
  async createMessage(
    message: BulkMessageInput,
    adminId: string
  ): Promise<string>;
  async sendMessage(messageId: string): Promise<void>;
  async scheduleMessage(messageId: string, scheduledTime: Date): Promise<void>;
  async cancelScheduledMessage(messageId: string): Promise<void>;
  async getMessageStatus(messageId: string): Promise<MessageStatus>;
  async createTemplate(template: MessageTemplate): Promise<string>;
  private processRecipientBatch(
    recipients: string[],
    message: Message
  ): Promise<void>;
  private filterRecipients(filters: RecipientFilters): Promise<string[]>;
}
```

#### 3. Push Notification Service

**Responsibilities:**

- Send push notifications via FCM/Expo
- Manage FCM tokens
- Handle batch sending
- Track delivery status

**Key Methods:**

```typescript
class PushNotificationService {
  async sendPushNotification(
    notification: PushNotificationInput
  ): Promise<void>;
  async sendBulkPushNotifications(
    notification: PushNotificationInput,
    userIds: string[]
  ): Promise<void>;
  async registerToken(
    userId: string,
    token: string,
    platform: "ios" | "android"
  ): Promise<void>;
  async unregisterToken(userId: string, token: string): Promise<void>;
  async cleanupInvalidTokens(): Promise<void>;
  private sendToFCM(
    tokens: string[],
    payload: FCMPayload
  ): Promise<FCMResponse>;
  private processBatch(tokens: string[], payload: FCMPayload): Promise<void>;
}
```

#### 4. App Version Service

**Responsibilities:**

- Manage app version configuration
- Check version compatibility
- Track version adoption
- Serve version info to mobile apps

**Key Methods:**

```typescript
class AppVersionService {
  async getVersionInfo(platform: "ios" | "android"): Promise<VersionInfo>;
  async updateVersionConfig(
    config: VersionConfig,
    adminId: string
  ): Promise<void>;
  async checkVersion(
    currentVersion: string,
    platform: string
  ): Promise<UpdateRequired>;
  async logVersionCheck(
    userId: string,
    version: string,
    platform: string
  ): Promise<void>;
  async getVersionAnalytics(
    filters: AnalyticsFilters
  ): Promise<VersionAnalytics>;
}
```

### Frontend Components

#### 1. Platform Settings Page

**Location:** `admin/src/pages/Platform.tsx`

**Features:**

- Tabbed interface (System Status, Security, Configuration)
- Form for editing settings with validation
- Real-time validation feedback
- Confirmation dialogs for critical changes
- Audit log viewer

#### 2. Messaging Center Page

**Location:** `admin/src/pages/MessagingCenter.tsx` (new)

**Features:**

- Message composer with rich text editor
- Recipient targeting with filters
- Template management
- Scheduled messages calendar
- Delivery tracking dashboard

#### 3. Version Manager Page

**Location:** `admin/src/pages/VersionManager.tsx` (new)

**Features:**

- Version configuration form
- Release notes editor
- Platform-specific settings (Android/iOS)
- Version adoption analytics
- Download URL management

## Data Models

### 1. PlatformSettings Model

```typescript
interface PlatformSettings {
  _id: ObjectId;

  // Financial Settings
  financial: {
    minimumWithdrawal: number; // Default: 1000
    platformCommissionRate: number; // Default: 10 (%)
    referralBonusAmount: number; // Default: 100
    minimumTaskReward: number; // Default: 50
  };

  // User Limits
  userLimits: {
    maxActiveTasksPerUser: number; // Default: 10
    maxSubmissionsPerTask: number; // Default: 100
    dailySpinLimit: number; // Default: 3
  };

  // Operational Controls
  operational: {
    maintenanceMode: boolean; // Default: false
    registrationEnabled: boolean; // Default: true
    kycRequired: boolean; // Default: true
  };

  // Task Management
  taskManagement: {
    approvalAutoTimeoutDays: number; // Default: 7
    maxTaskDurationDays: number; // Default: 30
  };

  // Metadata
  lastModified: Date;
  lastModifiedBy: ObjectId; // Admin user ID
  version: number; // For optimistic locking

  createdAt: Date;
  updatedAt: Date;
}
```

### 2. SettingsAuditLog Model

```typescript
interface SettingsAuditLog {
  _id: ObjectId;
  settingKey: string; // e.g., "financial.minimumWithdrawal"
  oldValue: any;
  newValue: any;
  changedBy: ObjectId; // Admin user ID
  changedByName: string; // Denormalized for performance
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}
```

### 3. BulkMessage Model

```typescript
interface BulkMessage {
  _id: ObjectId;
  title: string;
  body: string;
  type: "in_app" | "push" | "both";

  // Targeting
  targetAudience: {
    type: "all" | "filtered" | "segment";
    filters?: {
      status?: ("active" | "suspended" | "banned")[];
      roles?: ("worker" | "sponsor" | "admin")[];
      kycVerified?: boolean;
      registeredAfter?: Date;
      registeredBefore?: Date;
    };
    segmentId?: ObjectId;
  };

  // Scheduling
  scheduledFor?: Date;
  status: "draft" | "scheduled" | "sending" | "sent" | "cancelled";

  // Delivery Tracking
  delivery: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    failed: number;
    read: number;
  };

  // Metadata
  createdBy: ObjectId;
  createdAt: Date;
  sentAt?: Date;
  completedAt?: Date;
}
```

### 4. MessageTemplate Model

```typescript
interface MessageTemplate {
  _id: ObjectId;
  name: string;
  title: string;
  body: string;
  variables: string[]; // e.g., ['user_name', 'platform_name']
  targetAudience?: {
    type: string;
    filters?: any;
  };
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5. FCMToken Model (extends User model)

```typescript
// Add to User model
interface User {
  // ... existing fields

  fcmTokens: Array<{
    token: string;
    platform: "ios" | "android";
    deviceId: string;
    registeredAt: Date;
    lastUsed: Date;
    isActive: boolean;
    failureCount: number;
  }>;
}
```

### 6. AppVersion Model

```typescript
interface AppVersion {
  _id: ObjectId;
  platform: "android" | "ios";

  // Version Info
  latestVersion: string; // e.g., "1.2.3"
  minVersion: string; // e.g., "1.0.0"

  // Download URLs
  downloadUrl: string; // APK URL for Android, App Store URL for iOS

  // Release Notes
  releaseNotes: string[]; // Array of bullet points
  releaseDate: Date;

  // Update Behavior
  updateRequired: boolean; // Force update if below minVersion

  // Metadata
  publishedBy: ObjectId;
  publishedAt: Date;
  isActive: boolean;
}
```

### 7. VersionCheckLog Model

```typescript
interface VersionCheckLog {
  _id: ObjectId;
  userId: ObjectId;
  currentVersion: string;
  platform: "ios" | "android";
  updateAvailable: boolean;
  updateRequired: boolean;
  timestamp: Date;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Settings Validation Consistency

_For any_ platform setting update, if the validation passes, then the setting value must be within the defined acceptable range and the update must be persisted to the database.
**Validates: Requirements 1.2, 2.4, 4.3**

### Property 2: Settings Cache Invalidation

_For any_ platform setting update, the cache must be invalidated immediately after the database update succeeds, ensuring subsequent reads return the new value.
**Validates: Requirements 10.2**

### Property 3: Audit Log Completeness

_For any_ platform setting change, an audit log entry must be created with the old value, new value, admin ID, and timestamp before the operation completes.
**Validates: Requirements 1.4, 2.5, 7.1**

### Property 4: Bulk Message Recipient Count Accuracy

_For any_ bulk message with recipient filters, the estimated recipient count shown before sending must match the actual number of recipients processed within a margin of 1% or 10 users (whichever is larger).
**Validates: Requirements 13.2**

### Property 5: Push Notification Batch Size Limit

_For any_ push notification send operation, each batch sent to FCM must contain no more than 500 tokens to comply with FCM rate limits.
**Validates: Requirements 12.4, 17.2**

### Property 6: Message Rate Limiting

_For any_ admin user, the system must prevent sending more than 5 bulk messages within a 1-hour window.
**Validates: Requirements 17.4**

### Property 7: Invalid Token Cleanup

_For any_ FCM token that fails delivery 3 consecutive times, the token must be marked as inactive and excluded from future push notification sends.
**Validates: Requirements 16.5, 18.3**

### Property 8: Version Comparison Correctness

_For any_ two semantic version strings (e.g., "1.2.3" and "1.3.0"), the version comparison function must correctly determine which is newer according to semantic versioning rules.
**Validates: Requirements 19.2**

### Property 9: Mandatory Update Enforcement

_For any_ mobile app version check where the current version is below the minimum required version, the system must return `updateRequired: true` and the app must display a non-dismissible update dialog.
**Validates: Requirements 19.3, 24.1**

### Property 10: Version Check Cache Bypass

_For any_ version check when a mandatory update is available, the system must bypass the cache and query the database directly to ensure users receive the latest update information.
**Validates: Requirements 23.3**

### Property 11: Settings Admin Authorization

_For any_ settings API request, the system must verify that the authenticated user has the admin role before allowing read or write access to settings.
**Validates: Requirements 9.2**

### Property 12: Message Template Variable Replacement

_For any_ message sent using a template with variables (e.g., {{user_name}}), all variable placeholders must be replaced with actual user-specific values before delivery.
**Validates: Requirements 15.2**

## Error Handling

### Settings Service Errors

| Error Type              | HTTP Status | Handling Strategy                                     |
| ----------------------- | ----------- | ----------------------------------------------------- |
| Invalid setting value   | 400         | Return validation errors with specific field messages |
| Unauthorized access     | 403         | Reject request, log security event                    |
| Setting not found       | 404         | Return error, suggest valid setting keys              |
| Concurrent modification | 409         | Use optimistic locking, retry with latest version     |
| Database error          | 500         | Log error, return generic message, alert ops team     |

### Messaging Service Errors

| Error Type                | HTTP Status | Handling Strategy                               |
| ------------------------- | ----------- | ----------------------------------------------- |
| Invalid recipient filters | 400         | Return validation errors                        |
| No recipients found       | 400         | Warn admin, prevent sending                     |
| Rate limit exceeded       | 429         | Queue message, inform admin of delay            |
| FCM service unavailable   | 503         | Retry with exponential backoff, queue for later |
| Template not found        | 404         | Return error, list available templates          |

### Version Service Errors

| Error Type                   | HTTP Status | Handling Strategy                           |
| ---------------------------- | ----------- | ------------------------------------------- |
| Invalid version format       | 400         | Return validation error with format example |
| Min version > latest version | 400         | Reject update, explain constraint           |
| Download URL unreachable     | 400         | Validate URL before saving                  |
| Platform not supported       | 400         | Return supported platforms list             |

## Testing Strategy

### Unit Tests

**Settings Service:**

- Test setting validation for each field type
- Test cache invalidation on update
- Test audit log creation
- Test default value restoration
- Test concurrent modification handling

**Messaging Service:**

- Test recipient filtering logic
- Test batch processing (mock 1000+ recipients)
- Test template variable replacement
- Test rate limiting enforcement
- Test scheduled message processing

**Push Notification Service:**

- Test FCM token registration/unregistration
- Test batch size limiting (500 per batch)
- Test invalid token cleanup
- Test delivery status tracking
- Test platform-specific handling

**Version Service:**

- Test semantic version comparison
- Test update requirement logic
- Test platform-specific configuration
- Test version analytics aggregation

### Integration Tests

- Test end-to-end settings update flow (API → Service → Database → Cache)
- Test bulk message sending with real database queries
- Test push notification delivery with FCM sandbox
- Test version check flow from mobile app
- Test audit log retrieval with filters

### Property-Based Tests

Each correctness property listed above will be implemented as a property-based test using an appropriate testing library (e.g., fast-check for TypeScript).

## Security Considerations

### Authentication & Authorization

- All admin API endpoints require valid JWT token
- Admin role verification on every request
- Rate limiting: 10 requests/minute per admin for settings APIs
- IP-based rate limiting for version check endpoint (100 requests/minute per IP)

### Data Protection

- Sensitive settings (payment gateway keys) stored in environment variables only
- Settings API never returns backend-only configuration
- Audit logs include IP address and user agent for forensics
- FCM tokens encrypted at rest in database

### Input Validation

- All setting values validated against type and range constraints
- Message content sanitized to prevent XSS
- Version strings validated against semantic versioning regex
- Download URLs validated for HTTPS and domain whitelist

## Performance Optimization

### Caching Strategy

**Settings Cache:**

- Redis cache with 5-minute TTL
- Cache key: `platform:settings:v1`
- Invalidate on any setting update
- Fallback to database if cache miss

**Version Info Cache:**

- Redis cache with 24-hour TTL for non-mandatory updates
- Cache key: `app:version:{platform}:v1`
- Bypass cache if mandatory update available
- Separate cache per platform (iOS/Android)

### Database Indexing

```javascript
// PlatformSettings
db.platformsettings.createIndex({ lastModified: -1 });

// SettingsAuditLog
db.settingsauditlog.createIndex({ timestamp: -1 });
db.settingsauditlog.createIndex({ settingKey: 1, timestamp: -1 });
db.settingsauditlog.createIndex({ changedBy: 1, timestamp: -1 });

// BulkMessage
db.bulkmessages.createIndex({ status: 1, scheduledFor: 1 });
db.bulkmessages.createIndex({ createdBy: 1, createdAt: -1 });

// User (FCM Tokens)
db.users.createIndex({ "fcmTokens.token": 1 });
db.users.createIndex({ "fcmTokens.isActive": 1 });

// AppVersion
db.appversions.createIndex({ platform: 1, isActive: 1 });

// VersionCheckLog
db.versionchecklogs.createIndex({ userId: 1, timestamp: -1 });
db.versionchecklogs.createIndex({ platform: 1, timestamp: -1 });
db.versionchecklogs.createIndex({ currentVersion: 1, platform: 1 });
```

### Batch Processing

- Bulk messages processed in batches of 1000 recipients
- Push notifications sent in batches of 500 (FCM limit)
- Use queue system (Bull/BullMQ) for background processing
- Implement exponential backoff for failed deliveries

## Deployment Considerations

### Environment Variables

```bash
# Backend-only sensitive settings (never exposed to frontend)
PAYSTACK_SECRET_KEY=sk_live_xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxx
FCM_SERVER_KEY=xxx
REDIS_URL=redis://localhost:6379

# Public settings (can be exposed)
PLATFORM_NAME=Earn9ja
SUPPORT_EMAIL=support@earn9ja.com
```

### Database Migration

1. Create `PlatformSettings` collection with default values
2. Add `fcmTokens` array to User model
3. Create `BulkMessages`, `MessageTemplates`, `AppVersions` collections
4. Create indexes as specified above
5. Seed default platform settings
6. Seed default message templates

### Monitoring & Alerts

- Alert if settings cache hit rate < 90%
- Alert if bulk message delivery rate < 95%
- Alert if FCM token failure rate > 10%
- Alert if version check API response time > 500ms
- Dashboard showing version adoption rates
- Dashboard showing message delivery statistics

## API Endpoints

### Platform Settings

```
GET    /api/v1/admin/settings                    - Get all settings
PATCH  /api/v1/admin/settings                    - Update settings
POST   /api/v1/admin/settings/reset              - Reset to defaults
GET    /api/v1/admin/settings/audit              - Get audit log
```

### Bulk Messaging

```
POST   /api/v1/admin/messages                    - Create message
POST   /api/v1/admin/messages/:id/send           - Send message
POST   /api/v1/admin/messages/:id/schedule       - Schedule message
DELETE /api/v1/admin/messages/:id                - Cancel scheduled message
GET    /api/v1/admin/messages/:id/status         - Get delivery status
GET    /api/v1/admin/messages                    - List messages
```

### Message Templates

```
GET    /api/v1/admin/templates                   - List templates
POST   /api/v1/admin/templates                   - Create template
PATCH  /api/v1/admin/templates/:id               - Update template
DELETE /api/v1/admin/templates/:id               - Delete template
```

### Push Notifications

```
POST   /api/v1/notifications/register-token      - Register FCM token
DELETE /api/v1/notifications/unregister-token    - Unregister token
POST   /api/v1/admin/push-notifications          - Send push notification
```

### App Version Management

```
GET    /api/v1/app/version                       - Get version info (public)
GET    /api/v1/admin/versions                    - List all versions
POST   /api/v1/admin/versions                    - Create/update version
GET    /api/v1/admin/versions/analytics          - Get version analytics
```

## Future Enhancements

1. **A/B Testing for Messages** - Test different message variants
2. **Message Personalization** - Advanced variable system with conditional content
3. **SMS Integration** - Send SMS messages via Twilio
4. **Email Campaigns** - Bulk email sending with templates
5. **Scheduled Settings Changes** - Schedule setting updates for future dates
6. **Settings Rollback** - One-click rollback to previous settings state
7. **Multi-language Support** - Localized messages and release notes
8. **Advanced Analytics** - Message engagement metrics, click-through rates
9. **Webhook Integration** - Notify external systems of setting changes
10. **Settings Import/Export** - Backup and restore settings configuration
