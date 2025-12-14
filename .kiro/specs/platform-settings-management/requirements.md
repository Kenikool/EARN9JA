# Requirements Document

## Introduction

This document outlines the requirements for implementing a Platform Settings Management system for the Earn9ja admin panel. The system will allow administrators to configure platform-wide settings that control business rules, user limits, and operational parameters. The system must maintain a clear separation between safe, configurable settings (exposed to frontend) and sensitive configuration (kept in backend environment variables only).

## Glossary

- **Platform Settings**: Configurable parameters that control platform behavior and business rules
- **Admin Panel**: The web-based administrative interface for managing the platform
- **Backend-Only Settings**: Sensitive configuration like API keys, secrets, and payment gateway credentials that must never be exposed to the frontend
- **Frontend-Safe Settings**: Non-sensitive configuration values that can be safely displayed and modified through the admin panel
- **System**: The Earn9ja platform
- **Administrator**: A user with admin role who can modify platform settings

## Requirements

### Requirement 1: Platform Financial Settings Management

**User Story:** As an administrator, I want to configure financial parameters for the platform, so that I can control commission rates, minimum amounts, and transaction limits.

#### Acceptance Criteria

1. WHEN an administrator views financial settings, THE System SHALL display current values for minimum withdrawal amount, platform commission rate, referral bonus amount, and minimum task reward
2. WHEN an administrator updates a financial setting, THE System SHALL validate that the value is within acceptable ranges (e.g., commission rate between 0-50%, minimum withdrawal >= 100)
3. WHEN a financial setting is updated, THE System SHALL apply the new value to all subsequent transactions immediately
4. WHEN a financial setting is updated, THE System SHALL log the change with administrator ID, timestamp, old value, and new value
5. THE System SHALL NOT expose payment gateway API keys, secrets, or credentials to the frontend

### Requirement 2: User Limits and Restrictions Configuration

**User Story:** As an administrator, I want to set limits on user activities, so that I can prevent abuse and maintain platform quality.

#### Acceptance Criteria

1. WHEN an administrator configures user limits, THE System SHALL allow setting maximum active tasks per user, maximum submissions per task, and daily spin limit
2. WHEN a user attempts an action that exceeds configured limits, THE System SHALL prevent the action and display an appropriate error message
3. WHEN user limits are updated, THE System SHALL apply new limits to all users immediately
4. THE System SHALL validate that limit values are positive integers within reasonable ranges (e.g., max active tasks between 1-100)
5. WHEN limits are changed, THE System SHALL log the modification with administrator details and timestamp

### Requirement 3: Platform Operational Controls

**User Story:** As an administrator, I want to control platform operational features, so that I can manage maintenance, registrations, and feature availability.

#### Acceptance Criteria

1. WHEN an administrator enables maintenance mode, THE System SHALL display a maintenance message to all non-admin users and prevent normal operations
2. WHEN an administrator disables new user registration, THE System SHALL reject new signup attempts with an appropriate message
3. WHEN an administrator toggles KYC verification requirement, THE System SHALL enforce or waive KYC checks for withdrawals accordingly
4. THE System SHALL allow administrators to view current status of all operational toggles (maintenance mode, registration enabled, KYC required)
5. WHEN operational settings change, THE System SHALL notify active users if applicable (e.g., maintenance mode announcement)

### Requirement 4: Task Management Configuration

**User Story:** As an administrator, I want to configure task-related parameters, so that I can control task approval processes and durations.

#### Acceptance Criteria

1. WHEN an administrator sets task approval auto-timeout, THE System SHALL automatically approve tasks that remain pending beyond the specified number of days
2. WHEN an administrator sets maximum task duration, THE System SHALL prevent sponsors from creating tasks longer than the specified duration
3. THE System SHALL validate that task approval timeout is between 1-30 days
4. THE System SHALL validate that maximum task duration is between 1-365 days
5. WHEN task configuration changes, THE System SHALL apply rules to new tasks only, not retroactively to existing tasks

### Requirement 5: Settings Retrieval and Display

**User Story:** As an administrator, I want to view all current platform settings in one place, so that I can understand the current configuration.

#### Acceptance Criteria

1. WHEN an administrator accesses the platform settings page, THE System SHALL display all configurable settings grouped by category (Financial, User Limits, Operational, Task Management)
2. THE System SHALL display the last modified timestamp and administrator name for each setting
3. THE System SHALL indicate which settings are currently using default values versus custom values
4. THE System SHALL load settings within 2 seconds of page access
5. THE System SHALL NOT display or expose any backend-only sensitive configuration (API keys, database credentials, payment secrets)

### Requirement 6: Settings Update and Validation

**User Story:** As an administrator, I want to update platform settings with proper validation, so that I can safely modify configuration without breaking the platform.

#### Acceptance Criteria

1. WHEN an administrator submits a settings update, THE System SHALL validate all values before saving
2. WHEN validation fails, THE System SHALL display specific error messages indicating which fields are invalid and why
3. WHEN validation succeeds, THE System SHALL save the new values and display a success confirmation
4. THE System SHALL require administrator authentication and authorization before allowing any settings modifications
5. WHEN a critical setting is changed (e.g., maintenance mode), THE System SHALL require confirmation before applying

### Requirement 7: Settings Audit Trail

**User Story:** As an administrator, I want to see a history of settings changes, so that I can track who changed what and when.

#### Acceptance Criteria

1. WHEN an administrator views the settings audit log, THE System SHALL display all settings changes with timestamp, administrator name, setting name, old value, and new value
2. THE System SHALL allow filtering audit logs by date range, administrator, and setting name
3. THE System SHALL retain audit logs for at least 90 days
4. THE System SHALL paginate audit log results with 50 entries per page
5. THE System SHALL allow exporting audit logs to CSV format

### Requirement 8: Default Settings and Reset

**User Story:** As an administrator, I want to reset settings to default values, so that I can recover from misconfiguration.

#### Acceptance Criteria

1. WHEN an administrator requests to reset a setting to default, THE System SHALL display the default value and require confirmation
2. WHEN reset is confirmed, THE System SHALL restore the default value and log the action
3. THE System SHALL provide a "Reset All to Defaults" option that requires additional confirmation
4. THE System SHALL define sensible default values for all settings
5. WHEN settings are reset, THE System SHALL notify the administrator of the previous values that were replaced

### Requirement 9: Settings API Security

**User Story:** As a system architect, I want settings API endpoints to be secure, so that unauthorized users cannot modify platform configuration.

#### Acceptance Criteria

1. THE System SHALL require valid authentication token for all settings API requests
2. THE System SHALL verify that the authenticated user has admin role before allowing settings access
3. THE System SHALL rate-limit settings API requests to prevent abuse (maximum 10 requests per minute per admin)
4. THE System SHALL log all settings API access attempts including IP address and user agent
5. THE System SHALL return only non-sensitive settings data in API responses, never exposing backend-only configuration

### Requirement 10: Settings Caching and Performance

**User Story:** As a system architect, I want settings to be efficiently cached, so that the platform performs well without constant database queries.

#### Acceptance Criteria

1. THE System SHALL cache platform settings in memory with a TTL of 5 minutes
2. WHEN a setting is updated, THE System SHALL invalidate the cache immediately
3. THE System SHALL serve settings from cache when available to reduce database load
4. THE System SHALL fall back to database query if cache is unavailable
5. THE System SHALL measure and log cache hit rate for monitoring purposes

### Requirement 11: Bulk Message Broadcasting

**User Story:** As an administrator, I want to send bulk messages to all users or specific user segments, so that I can communicate important announcements, updates, or promotions.

#### Acceptance Criteria

1. WHEN an administrator creates a bulk message, THE System SHALL allow composing a title, message body, and selecting target audience (all users, active users, specific roles, or custom filters)
2. WHEN an administrator sends a bulk message, THE System SHALL queue the message for delivery and process recipients in batches to avoid overwhelming the system
3. WHEN a bulk message is sent, THE System SHALL create in-app notifications for all targeted users
4. THE System SHALL display delivery progress showing total recipients, messages sent, and messages pending
5. WHEN bulk message delivery completes, THE System SHALL provide a summary report showing total sent, delivered, and failed deliveries

### Requirement 12: Push Notification Broadcasting

**User Story:** As an administrator, I want to send push notifications to users' mobile devices, so that I can reach users even when they're not actively using the app.

#### Acceptance Criteria

1. WHEN an administrator creates a push notification, THE System SHALL allow composing notification title, body, and optional action URL
2. WHEN an administrator sends a push notification, THE System SHALL use Firebase Cloud Messaging (FCM) via Expo Notifications to deliver to registered devices
3. WHEN a push notification is sent, THE System SHALL target only users who have granted push notification permissions
4. THE System SHALL batch push notifications in groups of 500 to comply with FCM rate limits
5. WHEN push notification delivery completes, THE System SHALL log delivery status including successful sends, failed sends, and invalid tokens

### Requirement 13: Message Targeting and Segmentation

**User Story:** As an administrator, I want to target messages to specific user segments, so that I can send relevant communications to the right audience.

#### Acceptance Criteria

1. WHEN an administrator creates a message, THE System SHALL allow filtering recipients by user status (active, suspended, banned), role (worker, sponsor, admin), KYC verification status, and registration date range
2. WHEN filters are applied, THE System SHALL display the estimated recipient count before sending
3. THE System SHALL allow saving filter combinations as audience segments for reuse
4. WHEN an administrator selects a saved segment, THE System SHALL apply the filters and show current recipient count
5. THE System SHALL prevent sending to more than 10,000 users at once without additional confirmation

### Requirement 14: Message Scheduling

**User Story:** As an administrator, I want to schedule messages for future delivery, so that I can plan communications in advance and send at optimal times.

#### Acceptance Criteria

1. WHEN an administrator creates a message, THE System SHALL allow selecting immediate send or scheduling for a future date and time
2. WHEN a message is scheduled, THE System SHALL store it with pending status and process at the scheduled time
3. THE System SHALL allow viewing all scheduled messages with their delivery times
4. WHEN an administrator cancels a scheduled message, THE System SHALL prevent delivery and mark the message as cancelled
5. THE System SHALL send scheduled messages within 5 minutes of the scheduled time

### Requirement 15: Message Templates

**User Story:** As an administrator, I want to create and reuse message templates, so that I can quickly send common communications without rewriting content.

#### Acceptance Criteria

1. WHEN an administrator creates a message template, THE System SHALL allow saving title, body, and target audience configuration
2. THE System SHALL support template variables (e.g., {{user_name}}, {{platform_name}}) that are replaced with actual values when sent
3. WHEN an administrator uses a template, THE System SHALL populate the message form with template content and allow editing before sending
4. THE System SHALL allow administrators to manage (create, edit, delete) message templates
5. THE System SHALL provide default templates for common scenarios (welcome message, maintenance notice, payment confirmation)

### Requirement 16: Message Delivery Tracking

**User Story:** As an administrator, I want to track message delivery and engagement, so that I can measure the effectiveness of communications.

#### Acceptance Criteria

1. WHEN a bulk message is sent, THE System SHALL track delivery status for each recipient (sent, delivered, failed, read)
2. THE System SHALL display delivery statistics including total sent, delivery rate, and failure reasons
3. WHEN a push notification is sent, THE System SHALL track FCM delivery status and invalid token errors
4. THE System SHALL allow administrators to view message history with delivery statistics for the past 90 days
5. THE System SHALL automatically remove invalid FCM tokens after 3 consecutive delivery failures

### Requirement 17: Message Rate Limiting and Throttling

**User Story:** As a system architect, I want message sending to be rate-limited, so that the system remains stable and doesn't overwhelm external services.

#### Acceptance Criteria

1. THE System SHALL limit bulk message sending to maximum 1000 messages per minute
2. THE System SHALL limit push notification sending to maximum 500 notifications per minute (FCM rate limit)
3. WHEN rate limits are reached, THE System SHALL queue remaining messages and process them gradually
4. THE System SHALL prevent administrators from sending more than 5 bulk messages per hour
5. THE System SHALL log all rate limit events for monitoring and optimization

### Requirement 18: Push Notification Token Management

**User Story:** As a system architect, I want to manage user device tokens efficiently, so that push notifications are delivered reliably.

#### Acceptance Criteria

1. WHEN a user registers their device for push notifications, THE System SHALL store the FCM token associated with their user account
2. THE System SHALL allow multiple tokens per user to support multiple devices
3. WHEN a token becomes invalid, THE System SHALL mark it as inactive and exclude it from future sends
4. THE System SHALL automatically clean up tokens that haven't been used in 90 days
5. WHEN a user logs out, THE System SHALL optionally unregister their device token based on user preference

### Requirement 19: App Version Management

**User Story:** As an administrator, I want to manage app versions and force updates, so that I can ensure users are running compatible and secure versions of the mobile app.

#### Acceptance Criteria

1. WHEN an administrator publishes a new app version, THE System SHALL allow specifying version number, minimum required version, download URL, release notes, and whether the update is mandatory
2. WHEN a mobile app starts, THE System SHALL check the current version against the latest version from the backend
3. WHEN a user's app version is below the minimum required version, THE System SHALL display a mandatory update dialog that cannot be dismissed
4. WHEN a user's app version is below the latest version but above minimum required, THE System SHALL display an optional update dialog with "Update Now" and "Later" buttons
5. THE System SHALL display release notes in the update dialog showing what's new in the latest version

### Requirement 20: App Version Configuration

**User Story:** As an administrator, I want to configure app version settings from the admin panel, so that I can control update behavior without deploying backend code.

#### Acceptance Criteria

1. WHEN an administrator accesses app version settings, THE System SHALL display current latest version, minimum required version, download URLs (Android/iOS), and release notes
2. WHEN an administrator updates version settings, THE System SHALL validate that version numbers follow semantic versioning format (e.g., 1.2.3)
3. WHEN an administrator sets minimum required version, THE System SHALL validate that it is not greater than the latest version
4. THE System SHALL allow separate configuration for Android and iOS platforms
5. WHEN version settings are updated, THE System SHALL apply changes immediately to all subsequent app version checks

### Requirement 21: Release Notes Management

**User Story:** As an administrator, I want to create detailed release notes for each version, so that users understand what has changed in the update.

#### Acceptance Criteria

1. WHEN an administrator creates release notes, THE System SHALL allow adding multiple bullet points describing new features, improvements, and bug fixes
2. THE System SHALL support rich text formatting in release notes (bold, italic, lists)
3. WHEN release notes are saved, THE System SHALL associate them with the specific version number
4. THE System SHALL display release notes in chronological order (newest first) in the update dialog
5. THE System SHALL limit release notes to 10 bullet points per version to maintain readability

### Requirement 22: Update Download and Installation

**User Story:** As a user, I want to download and install app updates directly from the update dialog, so that I can easily keep my app up to date.

#### Acceptance Criteria

1. WHEN a user taps "Update Now" on Android, THE System SHALL download the APK file from the configured download URL
2. WHEN downloading an update, THE System SHALL display download progress as a percentage
3. WHEN download completes, THE System SHALL prompt the user to install the APK
4. THE System SHALL request necessary storage permissions before downloading
5. WHEN download fails, THE System SHALL display an error message and allow retry

### Requirement 23: Version Check Frequency

**User Story:** As a system architect, I want to control how often the app checks for updates, so that we balance user experience with server load.

#### Acceptance Criteria

1. THE System SHALL check for updates when the app starts (cold start only, not on resume)
2. THE System SHALL cache version check results for 24 hours to avoid excessive API calls
3. WHEN a mandatory update is available, THE System SHALL check on every app start regardless of cache
4. THE System SHALL allow administrators to configure version check frequency (daily, weekly, on app start)
5. THE System SHALL log all version check attempts for monitoring purposes

### Requirement 24: Platform-Specific Update Handling

**User Story:** As a system architect, I want to handle updates differently for Android and iOS, so that I can accommodate platform-specific distribution methods.

#### Acceptance Criteria

1. WHEN a user is on Android, THE System SHALL offer direct APK download and installation
2. WHEN a user is on iOS, THE System SHALL redirect to the App Store for updates
3. THE System SHALL store separate download URLs for Android APK and iOS App Store link
4. WHEN version settings are configured, THE System SHALL allow different version numbers for Android and iOS if needed
5. THE System SHALL detect the user's platform and show appropriate update instructions

### Requirement 25: Update Analytics and Monitoring

**User Story:** As an administrator, I want to track update adoption rates, so that I can understand how quickly users are updating to new versions.

#### Acceptance Criteria

1. WHEN users check for updates, THE System SHALL log their current version, platform, and whether an update was available
2. THE System SHALL provide a dashboard showing version distribution (how many users on each version)
3. THE System SHALL track update download attempts, successes, and failures
4. THE System SHALL display update adoption rate as a percentage (users on latest version / total active users)
5. THE System SHALL allow filtering update analytics by platform (Android/iOS) and date range
