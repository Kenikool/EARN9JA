# Admin Panel Requirements Document

## Introduction

The Earn9ja Admin Panel is a comprehensive web-based dashboard that enables administrators to manage and monitor the entire platform. The system provides tools for user management, task moderation, withdrawal processing, dispute resolution, analytics, and system configuration. The admin panel integrates with the existing Earn9ja backend API and provides real-time insights into platform operations.

## Glossary

- **Admin Panel**: The web-based administrative interface for managing the Earn9ja platform
- **Service Worker**: A user who completes tasks to earn money on the platform
- **Sponsor**: A user who creates and funds tasks for service workers to complete
- **Task Submission**: Proof submitted by a service worker after completing a task
- **Withdrawal Request**: A request by a user to transfer funds from their wallet to their bank account
- **Dispute**: A formal complaint filed by either a service worker or sponsor regarding a task
- **KYC**: Know Your Customer - identity verification process for users
- **Platform Fee**: Commission charged by Earn9ja on task transactions
- **Escrow Balance**: Funds held in escrow for active tasks
- **Reputation Score**: A numerical rating (0-100) representing a user's trustworthiness
- **Task Moderation**: The process of reviewing and approving/rejecting tasks before they go live
- **AdMob Reward**: Earnings from watching advertisements through Google AdMob

## Requirements

### Requirement 1: Admin Authentication and Authorization

**User Story:** As an admin, I want to securely log in to the admin panel so that I can access administrative functions.

#### Acceptance Criteria

1. WHEN an admin enters valid credentials, THE Admin Panel SHALL authenticate the user and grant access to the dashboard
2. WHEN an admin enters invalid credentials, THE Admin Panel SHALL display an error message and deny access
3. WHEN an admin's session expires, THE Admin Panel SHALL redirect the user to the login page
4. THE Admin Panel SHALL verify that the authenticated user has the "admin" role before granting access to any administrative functions
5. WHEN an admin logs out, THE Admin Panel SHALL clear the authentication token and redirect to the login page

### Requirement 2: Dashboard Overview

**User Story:** As an admin, I want to see a comprehensive overview of platform statistics so that I can quickly assess the platform's health and performance.

#### Acceptance Criteria

1. THE Admin Panel SHALL display the total number of registered users on the dashboard
2. THE Admin Panel SHALL display the number of active users on the dashboard
3. THE Admin Panel SHALL display the total number of tasks on the dashboard
4. THE Admin Panel SHALL display the number of active tasks on the dashboard
5. THE Admin Panel SHALL display the number of completed tasks on the dashboard
6. THE Admin Panel SHALL display the total platform revenue on the dashboard
7. THE Admin Panel SHALL display the total payouts to users on the dashboard
8. THE Admin Panel SHALL display the number of pending withdrawal requests on the dashboard
9. THE Admin Panel SHALL refresh dashboard statistics when the admin clicks a refresh button
10. THE Admin Panel SHALL display statistics with appropriate visual indicators (icons, colors, trend indicators)

### Requirement 3: User Management

**User Story:** As an admin, I want to view and manage all users so that I can maintain platform integrity and handle user-related issues.

#### Acceptance Criteria

1. THE Admin Panel SHALL display a paginated list of all users with their basic information
2. THE Admin Panel SHALL allow filtering users by status (active, suspended, banned, pending_verification)
3. THE Admin Panel SHALL allow filtering users by role (service_worker, sponsor, admin)
4. THE Admin Panel SHALL allow filtering users by KYC verification status
5. THE Admin Panel SHALL allow searching users by name, email, or phone number
6. WHEN an admin clicks on a user, THE Admin Panel SHALL display detailed user information including profile, wallet balance, reputation score, and activity statistics
7. WHEN an admin suspends a user with a reason, THE Admin Panel SHALL update the user status to "suspended" and record the action
8. WHEN an admin bans a user with a reason, THE Admin Panel SHALL update the user status to "banned" and record the action
9. WHEN an admin reactivates a suspended or banned user, THE Admin Panel SHALL update the user status to "active" and record the action
10. THE Admin Panel SHALL display user wallet balance, lifetime earnings, and lifetime spending
11. THE Admin Panel SHALL display the number of tasks completed by service workers
12. THE Admin Panel SHALL display the number of tasks created by sponsors
13. THE Admin Panel SHALL display user registration date and last login date

### Requirement 4: Task Moderation

**User Story:** As an admin, I want to review and moderate tasks before they go live so that I can ensure task quality and prevent fraudulent activities.

#### Acceptance Criteria

1. THE Admin Panel SHALL display a list of tasks pending approval with pagination
2. THE Admin Panel SHALL allow filtering tasks by category (social_media, music, survey, review, game, ads)
3. THE Admin Panel SHALL allow filtering tasks by status (pending_approval, active, paused, completed, expired, cancelled)
4. THE Admin Panel SHALL allow searching tasks by title or description
5. WHEN an admin clicks on a task, THE Admin Panel SHALL display complete task details including title, description, requirements, proof requirements, reward, slots, and sponsor information
6. WHEN an admin approves a task, THE Admin Panel SHALL update the task status to "active" and notify the sponsor
7. WHEN an admin rejects a task with a reason, THE Admin Panel SHALL update the task status to "rejected", record the rejection reason, and notify the sponsor
8. THE Admin Panel SHALL display task creation date and expiration date
9. THE Admin Panel SHALL display the number of available slots, completed slots, and total slots for each task
10. THE Admin Panel SHALL display task images and target URL when available

### Requirement 5: Withdrawal Management

**User Story:** As an admin, I want to review and process withdrawal requests so that users can receive their earnings securely and efficiently.

#### Acceptance Criteria

1. THE Admin Panel SHALL display a list of pending withdrawal requests with pagination
2. THE Admin Panel SHALL allow filtering withdrawals by status (pending, processing, completed, failed, cancelled)
3. THE Admin Panel SHALL allow filtering withdrawals by payment method (bank_transfer, opay, palmpay)
4. THE Admin Panel SHALL allow searching withdrawals by user name, email, or reference number
5. WHEN an admin clicks on a withdrawal, THE Admin Panel SHALL display complete withdrawal details including user information, amount, fee, net amount, account details, and request date
6. WHEN an admin approves a withdrawal, THE Admin Panel SHALL update the withdrawal status to "processing" and record the approval
7. WHEN an admin rejects a withdrawal with a reason, THE Admin Panel SHALL update the withdrawal status to "rejected", refund the amount to the user's wallet, and record the rejection reason
8. THE Admin Panel SHALL display withdrawal creation date and processing date
9. THE Admin Panel SHALL display user bank account details for bank transfers
10. THE Admin Panel SHALL display user phone number for mobile money transfers (Opay, PalmPay)
11. THE Admin Panel SHALL calculate and display the transaction fee and net amount for each withdrawal

### Requirement 6: Dispute Resolution

**User Story:** As an admin, I want to review and resolve disputes between users so that I can maintain fairness and trust on the platform.

#### Acceptance Criteria

1. THE Admin Panel SHALL display a list of pending disputes with pagination
2. THE Admin Panel SHALL allow filtering disputes by status (pending, under_review, resolved, rejected)
3. THE Admin Panel SHALL allow filtering disputes by type (task_not_completed, payment_issue, fraud, other)
4. WHEN an admin clicks on a dispute, THE Admin Panel SHALL display complete dispute details including task information, submission details, reporter information, reported user information, description, and evidence
5. WHEN an admin resolves a dispute with a decision and action, THE Admin Panel SHALL update the dispute status to "resolved" and execute the specified action
6. THE Admin Panel SHALL support the following dispute resolution actions: refund_worker, refund_sponsor, no_action, ban_user
7. WHEN the resolution action is "refund_worker", THE Admin Panel SHALL credit the task reward to the worker's wallet
8. WHEN the resolution action is "refund_sponsor", THE Admin Panel SHALL credit the task reward to the sponsor's wallet
9. WHEN the resolution action is "ban_user", THE Admin Panel SHALL update the reported user's status to "banned"
10. THE Admin Panel SHALL allow admins to add resolution notes when resolving disputes
11. THE Admin Panel SHALL display dispute creation date and resolution date
12. THE Admin Panel SHALL allow admins to update dispute status to "under_review" or "rejected"

### Requirement 7: Analytics and Reporting

**User Story:** As an admin, I want to view detailed analytics and generate reports so that I can make data-driven decisions about platform operations.

#### Acceptance Criteria

1. THE Admin Panel SHALL display user growth metrics over time
2. THE Admin Panel SHALL display task completion metrics over time
3. THE Admin Panel SHALL display revenue metrics over time
4. THE Admin Panel SHALL display withdrawal metrics over time
5. THE Admin Panel SHALL allow filtering analytics by date range
6. THE Admin Panel SHALL display AdMob revenue analytics including total ads watched, unique users, and total revenue
7. THE Admin Panel SHALL display platform breakdown by iOS and Android
8. THE Admin Panel SHALL display top earning users
9. THE Admin Panel SHALL display top task creators
10. THE Admin Panel SHALL allow exporting analytics data as CSV
11. THE Admin Panel SHALL display daily, weekly, and monthly aggregated metrics
12. THE Admin Panel SHALL display average ads per user and average revenue per user

### Requirement 8: KYC Verification Management

**User Story:** As an admin, I want to review and verify user KYC submissions so that I can ensure platform compliance and prevent fraud.

#### Acceptance Criteria

1. THE Admin Panel SHALL display a list of pending KYC submissions with pagination
2. THE Admin Panel SHALL allow filtering KYC submissions by status (pending, approved, rejected, resubmit)
3. THE Admin Panel SHALL allow filtering KYC submissions by verification type (nin, bvn, drivers_license, voters_card)
4. WHEN an admin clicks on a KYC submission, THE Admin Panel SHALL display complete KYC details including user information, identity number, verification type, and uploaded documents
5. WHEN an admin approves a KYC submission, THE Admin Panel SHALL update the user's KYC status to "verified" and update the user's isKYCVerified field to true
6. WHEN an admin rejects a KYC submission with a reason, THE Admin Panel SHALL update the KYC status to "rejected" and record the rejection reason
7. WHEN an admin requests resubmission with a reason, THE Admin Panel SHALL update the KYC status to "resubmit" and notify the user
8. THE Admin Panel SHALL display KYC document images (ID card, selfie, proof of address)
9. THE Admin Panel SHALL display verification data (full name, date of birth, address, phone number)
10. THE Admin Panel SHALL display KYC submission date and verification date

### Requirement 9: Support Ticket Management

**User Story:** As an admin, I want to manage support tickets so that I can provide timely assistance to users.

#### Acceptance Criteria

1. THE Admin Panel SHALL display a list of support tickets with pagination
2. THE Admin Panel SHALL allow filtering tickets by status (open, in_progress, resolved, closed)
3. THE Admin Panel SHALL allow filtering tickets by category (technical, payment, task, account, other)
4. THE Admin Panel SHALL allow filtering tickets by priority (low, medium, high)
5. WHEN an admin clicks on a ticket, THE Admin Panel SHALL display complete ticket details including subject, description, user information, and conversation history
6. WHEN an admin responds to a ticket, THE Admin Panel SHALL add the response to the conversation history and notify the user
7. WHEN an admin updates a ticket status, THE Admin Panel SHALL record the status change and notify the user
8. WHEN an admin assigns a ticket to themselves, THE Admin Panel SHALL update the assignedTo field
9. THE Admin Panel SHALL display ticket creation date and resolution date
10. THE Admin Panel SHALL display ticket attachments when available
11. THE Admin Panel SHALL allow admins to mark tickets as resolved or closed

### Requirement 10: System Configuration and Settings

**User Story:** As an admin, I want to configure system settings so that I can customize platform behavior and parameters.

#### Acceptance Criteria

1. THE Admin Panel SHALL allow admins to view current platform configuration
2. THE Admin Panel SHALL allow admins to update minimum withdrawal amount
3. THE Admin Panel SHALL allow admins to update withdrawal fee percentage
4. THE Admin Panel SHALL allow admins to update platform fee percentage
5. THE Admin Panel SHALL allow admins to enable or disable user registration
6. THE Admin Panel SHALL allow admins to enable or disable task creation
7. THE Admin Panel SHALL allow admins to enable or disable withdrawals
8. THE Admin Panel SHALL allow admins to update system maintenance mode
9. WHEN an admin updates a configuration setting, THE Admin Panel SHALL validate the input and save the changes
10. THE Admin Panel SHALL display a confirmation message after successfully updating settings
11. THE Admin Panel SHALL log all configuration changes with admin ID and timestamp

### Requirement 11: Real-time Notifications

**User Story:** As an admin, I want to receive real-time notifications about critical platform events so that I can respond quickly to issues.

#### Acceptance Criteria

1. WHEN a new withdrawal request is created, THE Admin Panel SHALL display a notification to online admins
2. WHEN a new dispute is filed, THE Admin Panel SHALL display a notification to online admins
3. WHEN a new support ticket is created with high priority, THE Admin Panel SHALL display a notification to online admins
4. WHEN a user is flagged for suspicious activity, THE Admin Panel SHALL display a notification to online admins
5. THE Admin Panel SHALL display a notification badge with the count of unread notifications
6. WHEN an admin clicks on a notification, THE Admin Panel SHALL navigate to the relevant page and mark the notification as read
7. THE Admin Panel SHALL allow admins to view all notifications in a notification center
8. THE Admin Panel SHALL allow admins to mark all notifications as read

### Requirement 12: Bulk Operations

**User Story:** As an admin, I want to perform bulk operations on multiple items so that I can manage the platform efficiently.

#### Acceptance Criteria

1. THE Admin Panel SHALL allow selecting multiple users for bulk operations
2. THE Admin Panel SHALL allow selecting multiple tasks for bulk operations
3. THE Admin Panel SHALL allow selecting multiple withdrawals for bulk operations
4. WHEN an admin selects multiple users, THE Admin Panel SHALL display available bulk actions (suspend, ban, send notification)
5. WHEN an admin selects multiple tasks, THE Admin Panel SHALL display available bulk actions (approve, reject, pause)
6. WHEN an admin selects multiple withdrawals, THE Admin Panel SHALL display available bulk actions (approve, reject)
7. WHEN an admin performs a bulk action, THE Admin Panel SHALL execute the action on all selected items and display a summary of results
8. THE Admin Panel SHALL display a confirmation dialog before executing bulk actions
9. THE Admin Panel SHALL show progress indicator during bulk operations
10. THE Admin Panel SHALL display error messages for items that failed during bulk operations

### Requirement 13: Activity Logging and Audit Trail

**User Story:** As an admin, I want to view activity logs so that I can track administrative actions and maintain accountability.

#### Acceptance Criteria

1. THE Admin Panel SHALL log all administrative actions with admin ID, action type, target entity, and timestamp
2. THE Admin Panel SHALL display an activity log page with pagination
3. THE Admin Panel SHALL allow filtering activity logs by admin user
4. THE Admin Panel SHALL allow filtering activity logs by action type (user_suspended, user_banned, task_approved, task_rejected, withdrawal_approved, withdrawal_rejected, dispute_resolved)
5. THE Admin Panel SHALL allow filtering activity logs by date range
6. THE Admin Panel SHALL display detailed information for each logged action
7. THE Admin Panel SHALL allow exporting activity logs as CSV
8. THE Admin Panel SHALL retain activity logs for at least 12 months
9. THE Admin Panel SHALL display the admin's name and email for each logged action
10. THE Admin Panel SHALL display the affected entity (user, task, withdrawal, dispute) for each logged action

### Requirement 14: Data Export and Reporting

**User Story:** As an admin, I want to export platform data so that I can perform external analysis and generate reports.

#### Acceptance Criteria

1. THE Admin Panel SHALL allow exporting user data as CSV
2. THE Admin Panel SHALL allow exporting task data as CSV
3. THE Admin Panel SHALL allow exporting withdrawal data as CSV
4. THE Admin Panel SHALL allow exporting transaction data as CSV
5. THE Admin Panel SHALL allow exporting analytics data as CSV
6. WHEN an admin exports data, THE Admin Panel SHALL apply current filters to the export
7. THE Admin Panel SHALL include column headers in exported CSV files
8. THE Admin Panel SHALL format dates in a consistent format (YYYY-MM-DD HH:mm:ss) in exported files
9. THE Admin Panel SHALL format currency values with the ₦ symbol in exported files
10. THE Admin Panel SHALL display a download link or automatically download the exported file

### Requirement 15: Responsive Design and Accessibility

**User Story:** As an admin, I want the admin panel to work well on different devices so that I can manage the platform from anywhere.

#### Acceptance Criteria

1. THE Admin Panel SHALL display correctly on desktop screens (1920x1080 and above)
2. THE Admin Panel SHALL display correctly on laptop screens (1366x768 and above)
3. THE Admin Panel SHALL display correctly on tablet screens (768x1024 and above)
4. THE Admin Panel SHALL adapt navigation menu for smaller screens
5. THE Admin Panel SHALL use responsive tables that scroll horizontally on smaller screens
6. THE Admin Panel SHALL use appropriate font sizes for readability on all screen sizes
7. THE Admin Panel SHALL use sufficient color contrast for text and backgrounds
8. THE Admin Panel SHALL support keyboard navigation for all interactive elements
9. THE Admin Panel SHALL display loading indicators during data fetching operations
10. THE Admin Panel SHALL display error messages in a user-friendly format
